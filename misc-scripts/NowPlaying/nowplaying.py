import subprocess
from time import sleep
import configparser
import requests
import json


def patchStreamMetadata(config, value):
    api_url = config['VAUHTIJUOKSU_API_URL']
    r = requests.patch(f'{api_url}/stream-metadata/', json=value, auth=(config['BASIC_AUTH_USER'], config['BASIC_AUTH_PW']))
    if r.status_code == 200:
        return json.loads(r.content)
    else:
        print(r.status_code)
        print(r.content)


def get_song():
    process = subprocess.run(["rhythmbox-client", '--print-playing'],capture_output=True)
    song = process.stdout.decode('utf-8').strip()
    if song and song != "-":
        return song
    return False


def main():
    while True:
        song = get_song()
        if song:
            patchStreamMetadata(config, {'now_playing': song})
        else:
            patchStreamMetadata(config, {'now_playing': ""})
        sleep(2)


if __name__ == "__main__":
    configReader = configparser.ConfigParser()
    configReader.read('config.ini')

    config = configReader['DEFAULT']
    if not config:
        print('Please give config')
        quit()

    main()

