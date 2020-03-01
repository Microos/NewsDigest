import datetime
from prettytable import PrettyTable

def response_summary(endpoint, resp):
    table = PrettyTable()
    table.field_names = [f'{endpoint} Response']
    table.add_row([resp])

    return str(table)
