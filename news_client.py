import sys
import simplejson as json
import traceback
import requests.exceptions as req_excption

from config import get_config
from newsapi import NewsApiClient

'''
All API request using NewsClient should expect a 
dict of 'status', 'content', 'err_code', 'err_msg' returned

'''


def safe_api_request(api_func):
    def func_wrapper(self, *args, **kwargs):
        try:
            resp = api_func(self, *args, **kwargs)
            resp['err_code'] = None
            resp['err_msg'] = None
            return resp


        except (TypeError, ValueError) as e1:
            # before request sent
            traceback.print_exc(file=sys.stderr)
            ret_dict = {'status': 'value_error', 'content': None, 'err_code': type(e1).__name__, 'err_msg': str(e1)}
            return ret_dict

        except req_excption.RequestException as e2:
            # during request sent (request error)
            ret_dict = {'status': 'requests_error', 'content': None, 'err_code': type(e2).__name__, 'err_msg': str(e2)}
            return ret_dict


        except Exception as e3:
            # after request sent (API error)
            traceback.print_exc(file=sys.stderr)
            ret_dict = {'status': 'api_error', 'content': None, 'err_code': e3.get_code(), 'err_msg': e3.get_message()}
            return ret_dict

    return func_wrapper


class NewsClient:
    def __init__(self, config_file='./config.json'):
        self.config_file = config_file
        self.__client = self.__get_client(config_file)

    def __get_client(self, config_file):
        conf = get_config()

        self.API_KEY = conf['news-api-key']
        newsapi = NewsApiClient(api_key=self.API_KEY)
        return newsapi

    @safe_api_request
    def get_sources(self):
        return self.__client.get_sources()

    @safe_api_request
    def request_headlines(self, q=None, sources=None, category=None, page_size=30, page=1, language='en'):
        return self.__client.get_top_headlines(q=q, sources=sources, category=category,
                                               language=language, page_size=page_size, page=page)

    @safe_api_request
    def request_articals(self, q, sources, from_date, to_date, domains=None, language='en', sort_by='relevancy',
                         page=1):

        return self.__client.get_everything(q=q, sources=sources, domains=domains, from_param=from_date,
                                            to=to_date, language=language, sort_by=sort_by, page=page)

    def get_sources_list(self):
        ret_dict = self.get_sources()

        if ret_dict['status'] != 'ok':
            return ret_dict

        ids, names = [], []

        for item in ret_dict['sources']:
            ids.append(item['id'])
            names.append(item['name'])

        ret = {'status': 'ok', 'ids': ids, 'names': names}
        return ret

    def get_sources_list(self):
        ret_dict = self.get_sources()

        if ret_dict['status'] != 'ok':
            return ret_dict

        ids, names = [], []

        for item in ret_dict['sources'][:10]:
            ids.append(item['id'])
            names.append(item['name'])

        ret = {'status': 'ok', 'ids': ids, 'names': names}
        return ret

    # Test methods
    def sample_headline_request(self):
        return self.request_headlines(q='123', sources='ab', category='business')

    def sample_artical_request(self):
        return self.request_articals(q='bitcoin', sources='abc-news', from_date='2019-02-01', to_date='2020-01-01')


if __name__ == '__main__':
    api = NewsClient()
    r = api.request_headlines()
    print(r)
    print('Done')
