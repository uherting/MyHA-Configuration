#!/bin/bash

##########################################################################################
#
#  this script generates the lovelace tab for unplugged esp8266 devices
#  (aka integrated but disconnected devices)
#
#  source:
#    the definition of ESPHome devices named "l*" according to their substitutions files
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig

if [ ! -d ${HA_PATH} ];then
  echo "ERROR: directory does not exist: ${HA_PATH}"
  exit 99
fi

# go to the dir which contains the ESPHome device main definitions
cd ${ESPHOME_PATH}
if [ $? -ne 0 ]; then
  echo "cannot cd to ${ESPHOME_PATH}"
  exit 99
fi

ESPHome - integrated and disconnected


echo "done"

####################################################################
# EOF
####################################################################
