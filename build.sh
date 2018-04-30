#!/bin/bash
#

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

cd $DIR && git reset --hard && git pull && bundle install && npm i && grunt build