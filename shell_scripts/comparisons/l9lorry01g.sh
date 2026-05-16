#!/bin/bash

##########################################################################################
#
#  this script compares l9lorry01g config files with analogous files related to l2kitchen12
#
##########################################################################################

BNAME=$(basename $0 .sh)
DNAME=$(dirname $0)
if [ "$DNAME" == "." ];then
 DNAME=$(pwd)
fi

. ${DNAME}/../scriptConfig

cd ${ESPHOME_PATH}
if [ $? -ne 0 ]; then
  echo "Cannot cd to ${ESPHOME_PATH}. Exiting."
  exit 1
fi

for file in $(find . -name ${BNAME}.yaml)
do
  DN=$(dirname $file)
  CMP_FILE=${DN}/l2kitchen12.yaml
  echo "Comparing files ... ======================================"
  echo "${file}"
  echo "${CMP_FILE}"
  diff -u $file ${CMP_FILE}
done