from flask import Flask
from flask import render_template
from flask import request

from config import get_config
from flask_cors import CORS
from helper import response_summary
import server_facade as facade

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/searchform/sources', methods=['POST'])
def sources():
    category = request.form.get('category', None).lower()
    category = None if category == 'all' else category

    resp = facade.get_sources(category)
    response_summary('/api/searchform/sources', resp, request.form)

    return resp


@app.route('/api/headlines/newscard', methods=['POST'])
def newscard():
    cnt = int(request.form.get('cnt', 4))
    source = request.form.get('source')

    resp = facade.get_newscard_data(source, cnt)

    # response_summary('/api/headlines/newscard', resp, request.form)
    return resp


@app.route('/api/headlines/slideshow', methods=['POST'])
def slideshow():
    cnt = int(request.form.get('cnt', 5))
    resp = facade.get_slideshow_data(cnt)

    # response_summary('/api/headlines/slideshow', resp, request.form)

    return resp


@app.route('/api/wordcloud', methods=['POST'])
def wordcloud():
    norm_min = request.form.get('normMin', 0)
    norm_max = request.form.get('normMax', 0)

    resp = facade.get_wordcloud_data(int(norm_min), int(norm_max))
    # response_summary('/api/wordcloud', resp, request.form)
    return resp


# TODO: /api/search


if __name__ == "__main__":
    conf = get_config()
    app.run(host='0.0.0.0', port=conf['port'])
