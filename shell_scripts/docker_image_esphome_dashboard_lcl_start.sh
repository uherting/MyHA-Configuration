# this script starts the local standalone ESPHome dashboard

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig
# echo "BUILD_DIR_FOR_DOCKER=${BUILD_DIR_FOR_DOCKER}"

USB_TO_TEST="/dev/ttyUSB0"
ADDITIONAL_USB=""
if [ -e ${USB_TO_TEST} ]; then
  ADDITIONAL_USB="--device=${USB_TO_TEST}"
else
  echo "No device on ${USB_TO_TEST}. Starting dashboard without USB device."
fi

# create a container and start it. if the container is stopped it will be removed (--rm)
sudo docker run --rm --net=host -v "${BUILD_DIR_FOR_DOCKER}":/config ${ADDITIONAL_USB} -it esphome/esphome
