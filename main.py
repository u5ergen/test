from flask import Flask
from flask import render_template
from flask import request

from config import Config
import git


app = Flask(__name__,)
app.config.from_object(Config)


@app.route('/')
def hello_world():
    return 'Hello, World! - 4'


@app.route('/update_server', methods=['POST', 'GET'])
def webhook():
	print('\n\n\n\nwebhook\n\n\n\n')
	if request.method == 'POST':
		repo = git.Repo('https://github.com/u5ergen/test.git')
		origin = repo.remotes.origin
		origin.pull()
		return 'Updated PythonAnywhere successfully', 200
	else:
		return 'Wrong event type', 400 


if __name__ == '__main__':
	app.run(debug=True)