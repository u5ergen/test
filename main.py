import os
import json

from flask import Flask
from flask import render_template
from flask import request
from flask import Flask, render_template, request, redirect, url_for, flash, make_response,session, current_app, jsonify
from flask_wtf import FlaskForm
from wtforms import Form, TextField, TextAreaField, validators, StringField, SubmitField
from wtforms.validators import DataRequired
import git

from config import Config
from creator import get_decklist
from creator import make_deck_info_dict
from creator import create
import tmp


TEMP_DIR = Config.TEMP_DIR
HSSITE_MODE = Config.HSSITE_MODE
# HSSITE_MODE = 'production'


app = Flask(__name__,)
app.config.from_object(Config)


class SendCodeString(FlaskForm):
    username = StringField('Codestrinf', validators=[DataRequired()])
    submit = SubmitField('Submit')


@app.route('/', methods=['POST', 'GET'])
def index():
    # form = SendCodeString()

    if HSSITE_MODE == 'testing':
    	disable_ui_elements = ''
    else:
    	disable_ui_elements = 'disabled'

    return render_template('index.html', disabled=disable_ui_elements, HSSITE_MODE=HSSITE_MODE)


@app.route('/get_deck_info', methods=['GET', 'POST'])
def get_deck_info():
	print('/get_deck_info')

	if request.method == 'POST':
		deckstring = request.form.get('block_send__input')
		lang = request.form.get('options_LANG')
		print(deckstring)
		print(lang)
		try:
			if HSSITE_MODE == 'testing':
				deck_info = make_deck_info_dict(deckstring, lang=lang, send_existing_files = True)
			else:
				deck_info = make_deck_info_dict(deckstring, lang=lang)
		except:
			deck_info = {'decklist': 0}
	else:
		deck_info = {'decklist': 0}

	return json.dumps(deck_info)


# refresh css
@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                 endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


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


@app.route('/test_flex')
def test_flex():
	return render_template('test_color.html')


@app.route('/get_len', methods=['GET', 'POST'])
def get_len():
	name = request.form.get('deck_string_form_input')
	return json.dumps({'len': len(name)})


if __name__ == '__main__':
	app.run(debug=True)
