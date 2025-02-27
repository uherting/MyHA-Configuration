#!/bin/bash

##########################################################################################
#
#  this script exports the secrets.yaml file to uwe@${TARGET_MACHINE}
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

# beta
# TARGET_MACHINE="192.168.178.32"
# winnipeg
TARGET_MACHINE="192.168.178.33"

TS=`date +%Y%m%d_%H%M%S`
scp /usr/share/hassio/homeassistant/esphome/secrets_yaml/secrets.yaml uwe@${TARGET_MACHINE}:/home/uwe/Desktop/secrets_${TS}.yaml

