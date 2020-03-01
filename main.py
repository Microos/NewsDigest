from flask import Flask
from flask import render_template
from flask import request

from config import get_config
from flask_cors import CORS
from helper import response_summary
import server

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/headlines/slideshow', methods=['GET', 'POST'])
def headlines_slideshow():
    cnt = request.form.get('cnt', 0)
    resp = server.get_headlines_slidshow_data(int(cnt))

    summary = response_summary('/api/headlines/slideshow', resp, request.form)
    print(summary)

    return resp


@app.route('/api/wordcloud', methods=['GET', 'POST'])
def wordcloud():
    norm_min = request.form.get('normMin', 0)
    norm_max = request.form.get('normMax', 0)

    resp = server.get_wordcloud_data(int(norm_min), int(norm_max))
    summary = response_summary('/api/wordcloud', resp, request.form)
    print(summary)
    return resp


# TODO: /api/search


if __name__ == "__main__":
    conf = get_config()
    app.run(host='0.0.0.0', port=conf['port'])
