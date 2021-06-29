#!/usr/bin/bash

SRC_DIR="/home/uwe/Git/UH/MyHAConfig/shell_scripts"

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

