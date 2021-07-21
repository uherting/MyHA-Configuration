#!/usr/bin/bash

#
# attn: this script is not longer of use as VS code is installed / updated via the system update procedure
#       as suggested at https://code.visualstudio.com/docs/setup/linux
#

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

exit 0

# this might work, too:
# wget 'https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64' -O /tmp/code_latest_amd64.deb
# dpkg -i /tmp/code_latest_amd64.deb
# rm -f /tmp/code_latest_amd64.deb