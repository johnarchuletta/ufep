''' Server for Udacity Front End project '''

from flask import Flask, render_template
import os


app = Flask(__name__)


@app.route('/')
def index():
    ''' Route for index page '''
    return render_template('index.html')


if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host='0.0.0.0', port=33507)
