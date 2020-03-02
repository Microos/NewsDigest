import datetime
from prettytable import PrettyTable
import re


def response_summary(endpoint, resp, form=None):
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


def validate_dict(item):
    for k, v in item.items():
        if item[k] is None:
            return False

        if (type(item[k])) == str and (item[k] in ['', 'null']):
            return False

        if type(item[k]) == dict and not validate_dict(item[k]):
            return False

    return True


def news_content_cleanup(content_str):
    return re.sub(r"\[\+\d+ chars\]|\r|\n|…", "", content_str)
