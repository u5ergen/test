import os

class Config:
	DEBUG = True

	BASE_DIR = os.path.abspath(os.path.dirname(__file__))
	TEMP_DIR = os.path.join(BASE_DIR, 'static/images/temp/')

	HSSITE_MODE = os.environ['HSSITE_MODE']