#!/usr/bin/bash

# This script creates symbolic links if the file exists is the bin directory and the repository

HN=`hostname`
SRC_DIR=""
if [ "${HN}" == "alpha" ];then
  SRC_DIR="/usr/share/hassio/homeassistant/shell_scripts"
fi
if [ "${HN}" == "beta" ];then
  SRC_DIR="/home/uwe/Git/UH/MyHAConfig/shell_scripts"
fi
if [ "${HN}" == "delta" ];then
  SRC_DIR="/home/uwe/Git/UH/MyHAConfig/shell_scripts"
fi

if [ "${SRC_DIR}" == "" ];then
  echo "ERROR: hostname not in the list"
  exit 1
fi

echo "HOST: ${HN}"
echo "SRC_DIR: ${SRC_DIR}"

TGT_DIR="${HOME}/bin"

# cd to ${HOME}/bin if possible
if [ -d ${TGT_DIR} ];then
  cd ${TGT_DIR}
  pwd
else
  echo "ERROR: ${TGT_DIR} does not exist"
  exit 1
fi

# now replace every file with a symlink
for i in [a-z]*
do
  SRC_FILE="${SRC_DIR}/${i}"
  if [ -f ${i} ];then
    if [ -f ${SRC_FILE} ];then
      echo "FILE: $i"
      rm ${i}
      ln -s ${SRC_FILE}
    fi
  fi
done

# go back where we started
cd -
