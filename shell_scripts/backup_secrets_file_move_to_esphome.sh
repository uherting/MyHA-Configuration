#!/bin/bash

##########################################################################################
#
#  this script takes the secrets.yaml file from its backup location on host winnipeg
#   and places it into the repository dir to be used on winnipeg
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

TS=`date +%Y%m%d_%H%M%S`

HOST_NAME=`hostname`

if [ "$HOST_NAME" == "winnipeg" ];then
  HOME_DIR="/home/uwe"
  HOME_REPOSITORY="/Git/UH/MyHAConfig"

  SRC_FILE=`ls -rt ${HOME_DIR}/Desktop/secrets_*yaml | tail -n1`
  TGT_FILE="${HOME_DIR}${HOME_REPOSITORY}/esphome/secrets.yaml"

  echo "Using ${SRC_FILE} for copying content to ${TGT_FILE}"

  cat $SRC_FILE > $TGT_FILE
fi
