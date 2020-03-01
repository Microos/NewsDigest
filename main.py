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


@app.route('/api/headlines', methods=['GET', 'POST'])
def headlines():
    for k, v in request.form.items():
        print(f'{k}: {v} [type:{type(v)}]')

    return "good"


# TODO: /api/wordcloud
@app.route('/api/wordcloud', methods=['GET', 'POST'])
def wordcloud():
    resp = server.get_wordcloud_data()
    summary = response_summary('/api/wordcloud', resp)
    print(summary)
    return resp


# TODO: /api/search


if __name__ == "__main__":
    conf = get_config()
    app.run(host='0.0.0.0', port=conf['port'])
