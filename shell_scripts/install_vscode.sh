#!/usr/bin/bash

exit 99

#
# attn: this script is not longer of use as VS code is installed / updated via the system update procedure
#       as suggested at https://code.visualstudio.com/docs/setup/linux
#

# ##########################################################################################

# preferred method according to https://code.visualstudio.com/docs/setup/linux :
# execute as root:

wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
rm -f packages.microsoft.gpg

apt install apt-transport-https
apt update
apt install code 
# or 
# apt install code-insiders

# ##########################################################################################
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