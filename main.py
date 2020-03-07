#! /usr/bin/env python3

from argparse import ArgumentParser
from flask import Flask
from flask import request
from config import get_config
from helper import summary_response #, jsonify
from flask import jsonify
import server_facade as facade

app = Flask(__name__, static_url_path='/static')


@app.route('/')
def index():
    return app.send_static_file('index.html')


# return render_template('index.html')


@app.route('/api/searchform/search', methods=['POST'])
def search():
    keyword = request.form.get('q').lower()
    from_date = request.form.get('fromDate')
    to_date = request.form.get('toDate')
    source = request.form.get('source', None).lower()
    source = None if source == 'all' else source
    cnt = request.form.get('cnt', '15')
    cnt = int(cnt)

    resp = facade.get_search_data(q=keyword, from_date=from_date, to_date=to_date, source=source, cnt=cnt)

    # summary_response('/api/searchform/search', resp, request.form)

    return jsonify(resp)


@app.route('/api/searchform/sources', methods=['POST'])
def sources():
    category = request.form.get('category', None).lower()
    category = None if category == 'all' else category

    resp = facade.get_sources(category)
    # summary_response('/api/searchform/sources', resp, request.form)

    return jsonify(resp)


@app.route('/api/headlines/newscard', methods=['POST'])
def newscard():
    cnt = int(request.form.get('cnt', 4))
    source = request.form.get('source')

    resp = facade.get_newscard_data(source, cnt)

    # summary_response('/api/headlines/newscard', resp, request.form)
    return jsonify(resp)


@app.route('/api/headlines/slideshow', methods=['POST'])
def slideshow():
    cnt = int(request.form.get('cnt', 5))
    resp = facade.get_slideshow_data(cnt)

    # summary_response('/api/headlines/slideshow', resp, request.form)

    return jsonify(resp)


@app.route('/api/wordcloud', methods=['POST'])
def wordcloud():
    norm_min = request.form.get('normMin', 0)
    norm_max = request.form.get('normMax', 0)

    resp = facade.get_wordcloud_data(int(norm_min), int(norm_max))
    # summary_response('/api/wordcloud', resp, request.form)

    return jsonify(resp)


@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('error.html'), 404


if __name__ == "__main__":
    config = get_config()
    parser = ArgumentParser(description="CSCI571-Homework6 News website server backend.")
    parser.add_argument('--port', '-p', dest="port", action='store', help="Run server at a port number.", type=int,
                        default=config.port)
    parser.add_argument('--debug', '-d', dest="debug", action='store_true',
                        help="Either run the server at flask debug mode.",
                        default=config.debug)

    args = parser.parse_args()

    app.run(host='0.0.0.0', port=args.port, debug=args.debug)
