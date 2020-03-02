import simplejson as json
from easydict import EasyDict

CONFIG = './config.json'

__config = None

with open(CONFIG, 'r') as f:
    __config = EasyDict(json.load(f))

# load stopwords
if ('stopwords' in __config.keys()):
    with open(__config['stopwords'], 'r') as f:
        # make the stopwords list a set for O(1) existence check
        __config['stopwords'] = set([w.strip() for w in f.readlines()])

print('Initialized config.py.')


def get_config():
    return __config
