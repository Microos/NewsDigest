import datetime
from prettytable import PrettyTable


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

    return str(table)


def validate_headline_item(item):
    for k, v in item.items():
        if item[k] is None:
            return False
        if k == 'source' and not validate_headline_item(item[k]):
            return False
    return True
