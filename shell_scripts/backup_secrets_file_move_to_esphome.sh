#!/bin/bash

##########################################################################################
#
#  this script takes the secrets.yaml file from its backup location on on localhost 
#   and places it into the repository dir to be used on beta
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

TS=`date +%Y%m%d_%H%M%S`

HOST_NAME=`hostname`

if [ "$HOST_NAME" == "beta" ];then
  HOME_DIR="/home/uwe"
  HOME_REPOSITORY="/Git/UH/MyHAConfig"

  SRC_FILE=`ls -rt ${HOME_DIR}/Desktop/secrets_*yaml | tail -n1`
  TGT_FILE="${HOME_DIR}${HOME_REPOSITORY}/esphome/secrets.yaml"
  cat $SRC_FILE > $TGT_FILE
fi
