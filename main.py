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


app = Flask(__name__,)
app.config.from_object(Config)


class SendCodeString(FlaskForm):
    username = StringField('Codestrinf', validators=[DataRequired()])
    submit = SubmitField('Submit')


@app.route('/', methods=['POST', 'GET'])
def index():
    # form = SendCodeString()

    if request.method == 'POST':
        deckstring = request.form.get('deck_string_form')
        lang = request.form.get('options_LANG')
        print(deckstring)
        print(lang)
        # decklist = create(deckstring)

        # images_filenames = []
        # bg_top = 'static/images/bg_top_MAGE.png'
        # # for i in range(2):
        # decklen = len(decklist)
        # for i in range(len(decklist)):
        #     url = f"https://art.hearthstonejson.com/v1/render/latest/enUS/256x/{decklist[i][0]['id']}.png";
        #     if decklist[i][0]['cardClass'] and decklist[i][0]['cardClass'] != 'NEUTRAL':
        #         bg_top = 'static/images/bg_top_' + decklist[i][0]['cardClass'] + '.png?1'
        #     # url = 'https://hsto.org/r/w32/webt/5a/de/0e/5ade0efe6f5d5276653463.png'
        #     # url = 'https://via.placeholder.com/256x387'
            
        #     foldername, filename = tmp.make_temp_file_from_url(url, temp_dir=TEMP_DIR) # Can return None
        #     print(f'{i} from {decklen}:', filename)
        #     images_filenames.append('static/images/temp/' + filename)
        # images_filenames.extend([bg_top, 'static/images/x2-42.png'])

        # tmp.remove_old_temp_files(buffer=30, temp_dir=TEMP_DIR)

        deck_info = make_deck_info_dict(deckstring, lang=lang) #, send_existing_files = True)
        # deck_info = {}
    else:
        # decklist = create('AAEBAf0EBpwCuAj3DdDBArnRAsW4AwyKAcAByQOrBMsE5gT4B5jEAtrFArT8Ap+bA/+dAwA=')
        # decklist = 0
        images_filenames = ['static/images/temp/' + filename for filename in os.listdir(TEMP_DIR)]
        images_filenames.extend(['static/images/bg_top_ROGUE.png?1', 'static/images/x2-42.png'])

        deckstring = 'AAECAZ/HAgbTCuubA5+pA+O0A8i+A8jAAwzcAckGigfRpQOZqQPXrAParAPyrAOqrwPNrwOTugPpvgMA'
        # deck_info = make_deck_info_dict(deckstring, send_existing_files = True)
        deck_info = {'decklist': 0}


    decklist = {'color':'#909000'}
    images_filenames = {'color':'#909000'}

    return render_template('index.html', decklist=decklist, images_filenames = images_filenames, deck_info = deck_info)


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


@app.route('/get_len', methods=['GET', 'POST'])
def get_len():
	name = request.form.get('deck_string_form')
	return json.dumps({'len': len(name)})


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
