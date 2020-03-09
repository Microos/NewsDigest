import re
import simplejson as json

from prettytable import PrettyTable


def summary_response(endpoint, resp, form=None):
    table = PrettyTable()
    table.field_names = [f'{endpoint}']

    if (form is not None):
        param_str = ''
        for k, v in form.items():
            param_str += f'{k:>10s}: {v:<10s}\n'
        if (param_str != ''):
            table.add_row([param_str])

    table.add_row([resp])
    table.max_width = 50
    table.align[f'{endpoint}'] = 'l'

    print(table)


def validate_dict(item, keys=None):
    check_keys = item.keys() if not keys else keys

    for k in check_keys:
        if k not in item.keys():
            return f'({k}):[nokey]'

        if item[k] is None:
            return f'({k})[{item[k]}]'

        if (type(item[k])) == str and (item[k] in ['', 'null']):
            return f'({k})[{item[k]}]'

        if type(item[k]) == dict:
            res = validate_dict(item[k])
            if (res is not None):
                return f'({k}){res}'

    return None


def news_content_cleanup(content_str):
    return re.sub(r"\[\+\d+ chars\]|\r|\n", "", content_str)


def jsonify(obj):
    return json.dumps(obj, indent=4)
