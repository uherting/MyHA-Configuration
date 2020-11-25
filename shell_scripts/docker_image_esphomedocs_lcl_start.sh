# this script starts the local standalone ESPHome Docs container

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig

# create a container and start it. if the container is stopped it will be removed (--rm)
sudo docker run --rm --net=host -v "${ESPHOMEDOCS_PATH}/":/data/esphomedocs -p 8000:8000 -it esphome/esphome-docs
