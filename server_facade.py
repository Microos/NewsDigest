from news_client import NewsClient
from config import get_config
from helper import validate_dict, news_content_cleanup
from functools import partial
import re

news_client = NewsClient()
config = get_config()

default_check_keys = ('author', 'description', 'title', 'url',
                      'urlToImage', 'publishedAt', 'source')


def search_validator(item):
    search_check_keys = ('author', 'description', 'title', 'url',
                         'urlToImage', 'publishedAt')
    res = validate_dict(item, search_check_keys)
    if res is not None:
        return res

    if 'source' not in item.keys():
        return '(source):[nokey]'

    if 'name' not in item['source'].keys():
        return '(source):(name):[nokey]'

    if item['source']['name'] in ['null', '']:
        return f"source:name:{item['source']['name']}"

    return None


def get_search_data(q, source, from_date, to_date, cnt):
    response = news_client.request_articals(q=q, sources=source, from_date=from_date, to_date=to_date, page_size=30)
    if (response['status'] != 'ok'):
        return response

    ret_list = __postprocess_articles(response, cnt, search_validator)
    ret_dict = {'status': 'ok', 'err_code': None, 'err_msg': None, 'content': ret_list}
    return ret_dict


def get_newscard_data(source, cnt):
    return __get_headlines_data(source=source, cnt=cnt)


def get_slideshow_data(cnt):
    return __get_headlines_data(source=None, cnt=cnt)


def __postprocess_articles(resp, cnt, validator):
    ret_list = []
    title_set = set()  # remove duplicates
    for art in resp['content']['articles']:

        # print(art)
        if len(ret_list) == cnt:
            break
        if art['title'] in title_set:
            continue

        # check every key and subkeys
        valid_res = validator(art)

        if valid_res is not None:
            # print(valid_res)
            continue

        if validate_dict(art, ['content']) is None:
            art['content'] = news_content_cleanup(art['content'])

        title_set.add(art['title'])
        ret_list.append(art)

    return ret_list


def __get_headlines_data(source, cnt):
    response = news_client.request_headlines(sources=source, page_size=100)
    if (response['status'] != "ok"):
        # directly return the error msg to the front end
        return response

    ret_list = __postprocess_articles(response, cnt, validator=partial(validate_dict, keys=default_check_keys))
    if (len(ret_list) < cnt):
        print(f"No Enough Valid Headlines (src: {str(source)}): {len(ret_list)}/{cnt}")
    ret_dict = {'status': 'ok', 'err_code': None, 'err_msg': None, 'content': ret_list}
    return ret_dict


def get_sources(category):
    response = news_client.get_sources(category)
    if (response['status'] != "ok"):
        # directly return the error msg to the front end
        return response

    # if category is None, return 10 sources
    # else return all sources
    all_sources = response['content']['sources']

    max_num_ret = 10

    ret_list = []
    if (len(all_sources) > 10):
        intv = len(all_sources) // max_num_ret
        indces = [intv * i for i in range(0, 10)]
        for i in indces:
            ret_list.append({'id': all_sources[i]['id'], 'name': all_sources[i]['name']})
    else:
        for src in all_sources:
            ret_list.append({'id': src['id'], 'name': src['name']})

    ret_dict = {'status': 'ok', 'err_code': None, 'err_msg': None, 'content': ret_list}
    return ret_dict


def get_wordcloud_data(norm_min, norm_max):
    """
    Count words using top 30 headlines.

    :norm_min, norm_max:
    min-max normalization

    :return: str, jsonified.
        a dict contains key "status", "err_code", "err_msg"
    and payload "content"

    where "content" is a list of dict containing word: "Kiting", size: "30"
    (size is normalized)
    """

    stopwords = config.stopwords
    # collect 100 headlines
    response = news_client.request_headlines(page_size=100)
    if (response['status'] != "ok"):
        # directly return the error msg to the front end
        return response

    patt = re.compile('[^\w ]')

    counter = {}

    for art in response['content']['articles']:
        if art['title'] is None: continue
        # ssstr: space separated string
        ssstr = re.sub(patt, " ", art['title'].strip())
        for word in ssstr.split(" "):
            word = word.strip().lower()
            if (len(word) == 0): continue  # skip empty words
            if (word in stopwords): continue  # skip stopwords
            if (re.search(r'^\d+$', word)): continue  # skip pure numbers
            counter[word] = counter.get(word, 0) + 1

    # prepare formatted counter
    # also sort it and only take top 30 words

    top_keys = sorted(counter.keys(), key=lambda k: -counter[k])[:30]

    fmt_counter = []

    # normalize size
    if (norm_min * norm_max != 0):
        min_ = float('inf')
        max_ = float('-inf')

        for key in top_keys:
            min_ = min(min_, counter[key])
            max_ = max(max_, counter[key])

        for key in top_keys:
            x_std = (counter[key] - min_) / (max_ - min_)
            x_normed = x_std * (norm_max - norm_min) + norm_min
            fmt_counter.append({"word": key.capitalize(), "size": f'{x_normed: .3f}'})
    else:

        for key in top_keys:
            fmt_counter.append({"word": key.capitalize(), "size": f'{counter[key]}'})

    ret_dict = {'status': 'ok', 'err_code': None, 'err_msg': None, 'content': fmt_counter}
    return ret_dict


if __name__ == '__main__':
    r = get_newscard_data('fox-news', 4)
    print(r)
