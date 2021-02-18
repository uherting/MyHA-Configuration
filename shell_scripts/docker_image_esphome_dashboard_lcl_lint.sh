# this script starts the local standalone ESPHome dashboard

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig
# echo "ESPHOMELOCATION_FOR_DOCKER=${ESPHOMELOCATION_FOR_DOCKER}"

if [ "$1" == "-f" ]; then
  # Full lint+test suite. ATTN: if the container is stopped it will be removed (--rm)
  sudo docker run --rm -v "${ESPHOMELOCATION_FOR_DOCKER}/":/esphome -it esphome/esphome-lint script/fulltest
fi

if [ "$1" == "-q" ]; then
  # Run lint only over changed files. ATTN: if the container is stopped it will be removed (--rm)
  sudo docker run --rm -v "${ESPHOMELOCATION_FOR_DOCKER}/":/esphome -it esphome/esphome-lint script/quicklint
fi
