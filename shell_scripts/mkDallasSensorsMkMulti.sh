##########################################################################################
#
#  this script generates ...
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig

SRC_PATH=${ESPHOME_PATH}
if [ ! -d ${SRC_PATH} ];then
  echo "ERROR: directory does not exist: ${SRC_PATH}"
  exit 99
fi

cd ${SRC_PATH}

# work on all definitions
for i in `ls *yaml`
do
  bn=`basename $i .yaml`
  echo "${bn}"

  # file does get replaced / overwritten!
  # ==>>> no protection against accitental overwrite
  rm ${OUTPUT_TGT_FILE_SUBSTITUTIONS} ${OUTPUT_TGT_FILE_SENSORS}

  ${DNAME}/mkDallasSensorsMkSingle.sh \
    $bn \
    1 \
    "" \
    ${SRC_PATH}
done

