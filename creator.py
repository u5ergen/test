import datetime
from hearthstone.deckstrings import Deck
import io
import json
import math
import requests
import sys
import subprocess
import os
from PIL import Image

from progress.bar import ChargingBar

import tmp
from config import Config


BASE_DIR = Config.BASE_DIR
TEMP_DIR = Config.TEMP_DIR


def get_decklist(deckstring):
	try:
		deck = Deck.from_deckstring(deckstring)
	except:
		return None
		
	decklist = []
	with open(f'{BASE_DIR}/static/cards.collectible.json', 'rb') as f:
		data = json.load(f)
		for i in range(len(deck.cards)):
			card = [{'id': 'NOT_EXISTS', 'cost': 404}, deck.cards[i][1]]
			for j in range(len(data)):
				if deck.cards[i][0] == data[j]['dbfId']:
					card = [data[j], deck.cards[i][1]]
			decklist.append(card)

	decklist = sorted(decklist, key=lambda cost: cost[0]['cost'])
	return decklist, deck.format.name.split('_')[1]


def make_deck_info_dict(deckstring, lang='enUS', send_existing_files = False):
	decklist, game_format = get_decklist(deckstring)
	rarity_cost = {'FREE': 0, 'COMMON': 50, 'RARE': 100, 'EPIC': 400, 'LEGENDARY': 1600}
	deck_info = {
		'class_name': 'class_name',
		'class_bg_top': 'static/images/bg_top_ROGUE.png', #png?2'
		'format': 'Unknown',
		'card_width': 256,
		'card_height': 388,
		'x2_image': {'src': 'static/images/x2-42.png', 'position_correction': [98, 340]},
		'decklist': [],
		'images_filenames_cards': [],
		'images_filenames_all': [],
		'deck_cost': 0,
	}

	deck_info['format'] = game_format
	deck_info['deck_cost'] = 0

	decklen = len(decklist)
	for cardlist in range(len(decklist)):
		url = f"https://art.hearthstonejson.com/v1/render/latest/{lang}/256x/{decklist[cardlist][0]['id']}.png"
		# url = 'https://art.hearthstonejson.com/v1/tiles/CS2_235.jpg'

		deck_info['deck_cost'] += rarity_cost[decklist[cardlist][0]['rarity']] * decklist[cardlist][1]
		if send_existing_files != True:
			foldername, filename = tmp.make_temp_file_from_url(url, temp_dir=TEMP_DIR) # Can return None!!!!!!!!
			if filename:
				print(f'{cardlist} from {decklen}:', filename)
				deck_info['images_filenames_cards'].append('static/images/temp/' + filename)

		if decklist[cardlist][0]['cardClass'] and decklist[cardlist][0]['cardClass'] != 'NEUTRAL':
			deck_info['class_name'] = decklist[cardlist][0]['cardClass']
			deck_info['class_bg_top'] = 'static/images/bg_top_' + decklist[cardlist][0]['cardClass'] + '.png?1'

	deck_info['decklist'] = decklist

	print()
	tmp.remove_old_temp_files(buffer=30, temp_dir=TEMP_DIR)




	if send_existing_files:
		deck_info['images_filenames_cards'] = ['static/images/temp/' + filename for filename in os.listdir(TEMP_DIR)]

	deck_info['images_filenames_all'].extend(deck_info['images_filenames_cards'])
	deck_info['images_filenames_all'].extend([deck_info['class_bg_top'], deck_info['x2_image']['src']])

	return deck_info


def create_image2(decklist, user_id='user_id', lang='enUS', background_color = (0, 0, 0), transparent = None):
	card_width = 256
	card_height = 388
	card_down = 340

	if transparent:
		img = Image.new('RGBA', (card_width*7, card_height*math.ceil(len(decklist)/7)))
	else:
		img = Image.new('RGB', (card_width*7, card_height*math.ceil(len(decklist)/7)), background_color)

	x2 = Image.open(f'{BASE_DIR}/static/images/x2-42.png')
	x2.load()

	bar = ChargingBar('Countdown', max = len(decklist))

	for i in range(len(decklist)):
	# for i in range(1):
		if i <= 6:
			position = [card_width*i, card_height*0]
		elif i <= 13:
			position = [card_width * (i-7), card_height]
		elif i <= 20:
			position = [card_width * (i-7*2), card_height*2]
		elif i <= 27:
			position = [card_width * (i-7*3), card_height*3]
		else:
			position = [card_width * (i-7*4), card_height*4]

		try:
			if decklist[i][0]['type'] and decklist[i][0]['type'] == 'HERO':
				position[0] = position[0] -7
				position[1] = position[1] -21
			else:
				pass
		except:
			print("Error. if decklist[i][0]['type']... NOT_EXISTS files")
		decklist[i].append(position)

	return decklist


def create(deckstring, user_id='user_id', lang='enUS', hex_color = '#000000', transparent = None):
	decklist = get_decklist(deckstring)
	# print(decklist)
	try:
		hex_color = hex_color.lstrip('#')
		background_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
	except:
		background_color = (0, 0, 0)
	decklist2 = create_image2(decklist, user_id, lang, background_color, transparent)
	# print(decklist2[10])
	return decklist2



	# startTime = datetime.datetime.now()
	# filename = create_image2(decklist, user_id, lang, background_color, transparent)
	# print(datetime.datetime.now() - startTime)
	
	# # os.startfile(f'{BASE_DIR}/static/temp/' + filename)
	# if sys.platform == "win32":
	# 	os.startfile(f'{BASE_DIR}/static/temp/' + filename)
	# else:
	# 	opener ="open" if sys.platform == "darwin" else "xdg-open"
	# 	subprocess.call([opener, (f'{BASE_DIR}/static/temp/' + filename)])


if __name__ == '__main__':
	# deckstring = 'AAECAQcGogmShwPfrQOIsAPjtAPFwAMMm/MCs/wCi4cDqosD6JQD2K0D2q0D0q8D57AD8LAD/LADhbEDAA==' #control warrior
	# deckstring = 'AAECAaIHDAAAAIoBsgKkA5sFhgns/AKggAPOjAOApgMJAAC0Ac0DiAe09gLe+gKPlwP1pwMA' # [{'id': 'NOT_EXISTS', 'cost': 404}, 2]
	deckstring = 'AAECAaIHBMGuA9K5A+2+A/vEAw2eAbQBiAfiB4+XA5u2A7m4A7q4A8y5A865A8+5A9C5A7m+AwA='
	deckstring = 'AAECAf0GAta5A9S6Aw4w9QXiBs4HiJ0DtZ8D/aQDvaYD/acD+a4DsLYDtbkDtrkDx7kDAA=='
	deckstring = 'AAEBAf0EBMABqwSi0wK/pAMNcbsC7AXXtgLrugKHvQLBwQKP0wK+pAPdqQP0qwPCuAONuQMA'
	deckstring = 'AAECAZ/HAgbTCuubA5+pA+O0A8i+A8jAAwzcAckGigfRpQOZqQPXrAParAPyrAOqrwPNrwOTugPpvgMA'
	startTime = datetime.datetime.now()
	# create(deckstring)
	deck_info = make_deck_info_dict('AAECAQcC3q0D1LoDDhYckAPUBNQIvaYD9agD3KkD3a0DpLYDq7YDu7kDwLkDnLsDAA==')
	print(datetime.datetime.now() - startTime)
	print(deck_info['images_filenames_all'])
	print(deck_info['format'])