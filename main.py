from flask import Flask
from flask import render_template
from flask import request
import os
import subprocess
from subprocess import call

from config import Config
import git


BASE_DIR = os.path.abspath(os.path.dirname(__file__))


app = Flask(__name__,)
app.config.from_object(Config)


@app.route('/')
def hello_world():
    return 'Testxxx'


@app.route('/update_server', methods=['POST', 'GET'])
def webhook():
	if request.method == 'POST':
		# repo = git.Repo('https://github.com/u5ergen/test.git')
		repo = git.Repo('/home/viy04205/mysite')
		origin = repo.remotes.origin
		origin.pull('master')

		return 'Updated PythonAnywhere successfully', 200
	else:
		return 'Wrong event type', 400 


if __name__ == '__main__':
	app.run(debug=True)
