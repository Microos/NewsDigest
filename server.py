from news_client import NewsClient
from config import get_config
from helper import validate_headline_item
import simplejson as json
import re

news_client = NewsClient()
config = get_config()


# TODO: headline slidshow
def get_headlines_slidshow_data(cnt):
    response = news_client.request_headlines(page_size=100)
    if (response['status'] != "ok"):
        # directly return the error msg to the front end
        return json.dumps(response, indent=4)

    ret_list = []
    for art in response['content']['articles']:
        if len(ret_list) == cnt: break
        if not validate_headline_item(art):
            continue

        art['content'] = re.sub(r"\[\+\d+ chars\]|\r|\n|…", "", art['content'])
        print(art['content'])
        ret_list.append(art)

    ret_dict = {'status': 'ok', 'err_code': None, 'err_msg': None, 'content': ret_list}
    json_ret_dict = json.dumps(ret_dict, indent=4)
    return json_ret_dict


# TODO: search
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

    stopwords = config["stopwords"]
    # collect 100 headlines
    response = news_client.request_headlines(page_size=100)
    if (response['status'] != "ok"):
        # directly return the error msg to the front end
        return json.dumps(response, indent=4)

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
    json_ret_dict = json.dumps(ret_dict, indent=4)
    return json_ret_dict


if __name__ == '__main__':
    r = get_headlines_slidshow_data(4)
    print(r)
