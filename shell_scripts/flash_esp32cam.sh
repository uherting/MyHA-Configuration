#!/usr/bin/bash

# this script flashes ESPHome esp32cam devices

if [ $# -ne 1 ]; then
  echo "usage: $0 device_name"
  echo "    e.g. $0 l9cam3202"
  exit 1
fi

# find out the tty on which the device is connected to. 
# this is needed for flashing the device
USB_TO_TEST="/dev/ttyUSB0 /dev/ttyACM0"
ADDITIONAL_USB=""

BNAME=$(basename $0 .sh)
DNAME=$(dirname $0)
if [ "$DNAME" == "." ];then
 DNAME=$(pwd)
fi

# check if the scriptConfig file exists
if [ ! -e ${DNAME}/scriptConfig ]; then
  echo "ERROR: scriptConfig file does not exist: ${DNAME}/scriptConfig"
  exit 100
fi
. ${DNAME}/scriptConfig

# check if the dir with the file to be flashed exists
if [ ! -d ${FIRMWARE_HOME_UH} ];then
  echo "ERROR: directory does not exist: ${FIRMWARE_HOME_UH}"
  exit 99
fi

FLASH_FILE="${FIRMWARE_HOME_UH}/${1}-firmware.factory.bin"

# does the file to be flashed exist? yes == great
if [ ! -e ${FLASH_FILE} ]; then
  echo "${FLASH_FILE} does not exist. No flashing will take place."
  exit 82
fi

for USB in ${USB_TO_TEST}; do
  if [ -e ${USB} ]; then
    ADDITIONAL_USB="${USB}"
  fi
done

if [ "${ADDITIONAL_USB}" == "" ]; then
  echo "No USB devices found. ESPHome dashboard will not be able to connect to any devices."
else
  echo "Found USB devices: ${ADDITIONAL_USB}"
fi

${DNAME}/esptool/esptool --chip auto -p "${ADDITIONAL_USB}" write-flash 0x0 "${FLASH_FILE}"
# rm ${FLASH_FILE}