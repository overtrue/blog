#!/bin/bash
#

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

cd $DIR && git reset --hard && git pull && bundle install && npm i && grunt build && \

curl 'https://api.github.com/users/overtrue/repos?type=owner&per_page=100' -H 'Accept: */*' -H 'Referer: https://overtrue.me/open-source/' -H 'Origin: https://overtrue.me' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36' --compressed > /www/overtrue.me/_site/opensource.json