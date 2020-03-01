from news_client import NewsClient
from config import get_config
import simplejson as json
import re

news_client = NewsClient()
config = get_config()

# TODO: headline

# TODO: search

# TODO: wordcloud
'''
:return Json: [{word: "Running", size: "10"}, 
{word: "Surfing", size: "20"}, 
{word: "Climbing", size: "50"}, 
{word: "Kiting", size: "30"}, 
{word: "Sailing", size: "20"}, 
{word: "Snowboarding", size: "60"} 
]
'''


def get_wordcloud_data():
    """
    Count words using top 30 headlines.

    :return: str, jsonified.
        a dict contains key "status", "err_code", "err_msg"
    and payload "content"

    where "content" is a list of dict containing word: "Kiting", size: "30"
    (size is normalized)
    """

    stopwords = config["stopwords"]
    response = news_client.request_headlines()
    if (response['status'] != "ok"):
        # directly return the error msg to the front end
        return json.dumps(response, indent=4)

    patt = re.compile('\[\+\d+ chars\]|[^\w ]')

    counter = {}

    for art in response['articles']:
        if art['content'] is None: continue
        # ssstr: space separated string
        ssstr = re.sub(patt, " ", art['content'].strip())
        for word in ssstr.split(" "):
            word = word.strip().lower()
            if (len(word) == 0): continue
            if (word in stopwords): continue
            if (re.search(r'^\d+$', word)): continue
            counter[word] = counter.get(word, 0) + 1

    # prepare formatted counter
    # also sort it and only take top 30 words
    top_keys = sorted(counter.keys(), key=lambda k: -counter[k])[:30]
    fmt_counter = []

    # normalize size
    total_cnt = 0
    for key in top_keys:
        total_cnt += counter[key]
    for key in top_keys:
        fmt_counter.append({"word": key, "size": f'{counter[key] / total_cnt: .3f}'})

    ret_dict = {'status': 'ok', 'err_code': None, 'err_msg': None, 'content': fmt_counter}
    json_ret_dict = json.dumps(ret_dict, indent=4)
    return json_ret_dict


if __name__ == '__main__':
    r = get_wordcloud_data()
    print(r)
