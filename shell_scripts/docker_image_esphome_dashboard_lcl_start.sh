# this script starts the local standalone ESPHome dashboard

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig
# echo "BUILD_DIR_FOR_DOCKER=${BUILD_DIR_FOR_DOCKER}"

USB_TO_TEST="/dev/ttyUSB0 /dev/ttyACM0"
ADDITIONAL_USB=""

for USB in ${USB_TO_TEST}; do
  if [ -e ${USB} ]; then
    ADDITIONAL_USB="${ADDITIONAL_USB} --device=${USB}"
  fi
done

if [ "${ADDITIONAL_USB}" == "" ]; then
  echo "No USB devices found. ESPHome dashboard will not be able to connect to any devices."
else
  echo "Found USB devices: ${ADDITIONAL_USB}"
fi

# create a container and start it. if the container is stopped it will be removed (--rm)
sudo docker run --rm --net=host -v "${BUILD_DIR_FOR_DOCKER}":/config ${ADDITIONAL_USB} -it esphome/esphome
