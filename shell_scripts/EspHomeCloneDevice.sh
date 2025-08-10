#!/usr/bin/bash

# this script clones ESPHome devices

if [ $# -ne 2 ]; then
  echo "usage: $0 <old_dev_name> <new_dev_name>"
  exit 1
fi

# BNAME=(basename $0 .sh)
DNAME=$(dirname $0)
if [ "$DNAME" == "." ];then
 DNAME=(pwd)
fi

# remove the file extension to get the device name
OLD_DEVICE=$(basename ${1} .yaml)
NEW_DEVICE=$(basename ${2} .yaml)

# create the file names
CLONE_SRC_FILE="${OLD_DEVICE}.yaml"
CLONE_TGT_FILE="${NEW_DEVICE}.yaml"

echo "Cloning ESPHome device from ${CLONE_SRC_FILE} to ${CLONE_TGT_FILE}"
if [ 1 -eq 2 ]; then
  echo "ERROR: No device name given. Exiting."
  exit 1
fi

# check if the scriptConfig file exists
if [ ! -e ${DNAME}/scriptConfig ]; then
  echo "ERROR: scriptConfig file does not exist: ${DNAME}/scriptConfig"
  exit 100
fi
. ${DNAME}/scriptConfig

# set the source path
# this is the path where the ESPHome devices are located
# it is the same as ESPHOME_PATH in scriptConfig
# but we need to set it here for the cloning to work
# if the script is run on the HA server, ESPHOME_PATH is set to /usr/share/hassio/homeassistant/esphome
# if the script is run on another machine, ESPHOME_PATH is set to /home/uwe/Git/UH/MyHAConfig/esphome
# so we can use ESPHOME_PATH directly
# but we need to set it here for the cloning to work
SRC_PATH=${ESPHOME_PATH}
if [ ! -d ${SRC_PATH} ];then
  echo "ERROR: directory does not exist: ${SRC_PATH}"
  exit 99
fi

cd ${SRC_PATH}
#pwd

# does the source file exist? yes == great
if [ ! -e ${CLONE_SRC_FILE} ]; then
  echo "${CLONE_SRC_FILE} does not exist. No cloning will take place."
  exit 82
fi

# does the target file exist? yes == no cloning possible
if [ -e ${CLONE_TGT_FILE} ]; then
  echo "${CLONE_TGT_FILE} already exists. No cloning will take place."
  exit 81
fi

# src file exists and tgt file can be created. Great! Let's go for it.
echo "OLD: ${OLD_DEVICE}  NEW: ${NEW_DEVICE}"
echo ""

FILES_FOUND=$(find . -name ${CLONE_SRC_FILE} 2> /dev/null)
echo "Let's clone the files related to ${OLD_DEVICE}:"
for file in ${FILES_FOUND}
do
  DIR=$(dirname ${file})

  SRC_FILE="${file}"
  TGT_FILE="${DIR}/${NEW_DEVICE}.yaml"

  echo "DIR: ${DIR}"
  echo "SRC: ${SRC_FILE}"
  echo "TGT: ${TGT_FILE}"
  echo ""
  sed -e "s/${OLD_DEVICE}/${NEW_DEVICE}/g" < ${SRC_FILE} > ${TGT_FILE}
done
