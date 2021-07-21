#!/usr/bin/bash

# This script checks whether there is a new vs code file downloaded and installs it if it exists


echo "checking on new downloaded file of VS-Code"
FILENAME_COMMON="/home/uwe/Downloads/code_"
l=`ls -rt ${FILENAME_COMMON}* 2>/dev/null | grep ${FILENAME_COMMON} | wc -l`

if [ $l -gt 0 ]; then
  echo "new version will be installed"
else 
  exit 1
fi

TOBEINSTALLED=`ls -rt ${FILENAME_COMMON}* 2>/dev/null | tail -n1`

echo "to be installed: ${TOBEINSTALLED}"

apt remove code
apt install ${TOBEINSTALLED}

