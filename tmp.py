import os
import tempfile

import requests


BASE_DIR = os.getcwd()
TEMP_DIR = os.path.join(BASE_DIR, 'static/images/temp/')
url = 'https://hsto.org/r/w32/webt/5a/de/0e/5ade0efe6f5d5276653463.png'


def make_temp_file_from_url(url, temp_dir=TEMP_DIR):
	response = requests.get(url)
	if response.status_code == 200:
		file = tempfile.NamedTemporaryFile(dir=os.path.join(temp_dir), prefix='ben', suffix=".png", delete=False)
		file.write(response.content)
		full_path = file.name
		foldername, filename = os.path.split(full_path)

		return foldername, filename

	return None


def remove_temp_file(filepath):
	if filepath:
		os.remove(filepath)


def remove_old_temp_files(buffer=30, temp_dir=TEMP_DIR):
	files = os.listdir(TEMP_DIR)
	files.sort(key=lambda file: os.path.getmtime(f'{temp_dir}{file}'))
	if len(files) > buffer:
		for i in files[:-buffer]:
			try:
				os.remove(f'{TEMP_DIR}{i}')
			except:
				print('remove_old_temp_files: can\'t remove file')
				continue


def main():
	foldername, filename = make_temp_file_from_url(url)
	# remove_old_temp_files(30, TEMP_DIR)
	print(os.listdir(TEMP_DIR))

if __name__ == '__main__':
	main()
