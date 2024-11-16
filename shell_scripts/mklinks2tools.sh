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
if [ "${HN}" == "winnipeg" ];then
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
for i in ${SRC_DIR}/[a-z]*
do
    f=`basename ${i}`
    echo "Processing ${f}"
    if [ -f ${f} ];then
      echo "delete existing file: ${f}"
      rm ${f}
    fi
    echo "Make symlink: ${f}"
    ln -s ${i}
done

# go back where we started
cd -
