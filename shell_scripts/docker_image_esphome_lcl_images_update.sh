# this script updaates the local standalone ESPHome dashboard docker image

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig
# echo "BUILD_DIR_FOR_DOCKER=${BUILD_DIR_FOR_DOCKER}"

echo "Is  the esphome dashboard container running? See the following output:"
sudo docker ps
echo "any running container has to be stopped."
echo "press STRC-c if any container shows up."
echo "in any other case press the enter key"
read c

# update the image to the latest version
sudo docker pull esphome/esphome:latest
sudo docker pull esphome/esphome-lint:latest