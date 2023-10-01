#!/bin/bash

##########################################################################################
#
#  this script exports the secrets.yaml file to uwe@beta
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi


TS=`date +%Y%m%d_%H%M%S`
# scp /usr/share/hassio/homeassistant/esphome/secrets.yaml uwe@beta.local:/home/uwe/Desktop/HA/secrets_${TS}.yaml
scp /usr/share/hassio/homeassistant/esphome/secrets.yaml uwe@192.168.178.32:/home/uwe/Desktop/HA/secrets_${TS}.yaml

