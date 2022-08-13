#!/bin/bash

# this script is based on what is to be found at https://www.home-assistant.io/integrations/telegram
# it can help determine the id of the bot or a group

# usage: 
#   1.) send msg to bot or group
#   2.) execute this script


BNAME=`basename $0 .sh`
DNAME=`dirname $0`
SECRETS_FILE="${DNAME}/../../secrets.yaml"

MY_API_TOKEN=`grep TELEGRAM_TOKEN ${SECRETS_FILE} | cut -f2 -d'"'`
echo "The token is: ${MY_API_TOKEN}"
curl -X GET https://api.telegram.org/bot${MY_API_TOKEN}/getUpdates