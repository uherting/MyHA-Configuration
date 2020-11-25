
BNAME=`basename $0 .sh`

if [ $# -eq 0 ];then
  echo "USAGE: $0 <dev_name> [ <dev_num> <dev_comment> <PATH_TO_HA_CONFIG> <start> <end> ]"
  exit 1
fi

DEVICE_NAME=$1
DEVICE_NAME_UC="`echo ${DEVICE_NAME} | tr '[:lower:]' '[:upper:]'`"
DEVICE_NAME_LC="`echo ${DEVICE_NAME} | tr '[:upper:]' '[:lower:]'`"

if [ $# -gt 1 ];then
  DALLAS_DEV_NUM=$2
else
  DALLAS_DEV_NUM="1"
fi

if [ $# -gt 2 ];then
  DALLAS_DEV_COMMENT=$3
else
  DALLAS_DEV_COMMENT=""
fi

if [ $# -gt 3 ];then
  SRC_PATH=$4
else
  SRC_PATH="${ESPHOME_PATH}"
  if [ ! -d ${SRC_PATH} ];then
    echo "ERROR: directory does not exist: ${SRC_PATH}"
    exit 99
  fi
fi

# default count of sensor definitions?
if [ $# -gt 4 ];then
  START_CNT=$5
  END_CNT=$6
else
  START_CNT=1
  END_CNT=1
fi

# assign the output file names
OUTPUT_TGT_FILE_SECRETSYAML="${SRC_PATH}/tmp/secrets/${DEVICE_NAME}.yaml"
OUTPUT_TGT_FILE_SENSORS="${SRC_PATH}/tmp/sensors/${DEVICE_NAME}.yaml"
OUTPUT_TGT_FILE_SUBSTITUTIONS="${SRC_PATH}/tmp/substitutions/${DEVICE_NAME}.yaml"

# avoid overwriting files by checking one of the three
if [ -f ${OUTPUT_TGT_FILE_SUBSTITUTIONS} ];then
  echo "no action taken as file exists: ${OUTPUT_TGT_FILE_SUBSTITUTIONS}"
  exit 1
fi

for i in ${OUTPUT_TGT_FILE_SECRETSYAML} ${OUTPUT_TGT_FILE_SENSORS} ${OUTPUT_TGT_FILE_SUBSTITUTIONS} 
do
  b="`dirname $i`"
  if [ ! -d ${b} ]; then
    echo "creating directory ${b}"
    mkdir -p ${b}
    touch ${b}/.git_dummy_file
  fi
done

# change dir to where the main config files exist
cd ${SRC_PATH}

# to be added to secrets.yaml file
CNT=${START_CNT}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SECRETSYAML}
echo "# SECRETS - to be moved to secrets.yaml" >> ${OUTPUT_TGT_FILE_SECRETSYAML}
echo "" >> ${OUTPUT_TGT_FILE_SECRETSYAML}

printf "# DALLAS temp sensor addresses for device %s %s\n" ${DEVICE_NAME_LC} ${DALLAS_DEV_COMMENT} >> ${OUTPUT_TGT_FILE_SECRETSYAML}
printf "DALLAS_%02d_${DEVICE_NAME_UC}_CASESENSOR_01_ADDRESS: \"\"\n" ${DALLAS_DEV_NUM} >> ${OUTPUT_TGT_FILE_SECRETSYAML}
while true
do
  printf "DALLAS_%02d_${DEVICE_NAME_UC}_ENVSENSOR_%02d_ADDRESS: \"\"\n" ${DALLAS_DEV_NUM} ${CNT} >> ${OUTPUT_TGT_FILE_SECRETSYAML}
  let CNT++
  if [ ${CNT} -gt ${END_CNT} ]; then 
    break
  fi
done
echo "" >> ${OUTPUT_TGT_FILE_SECRETSYAML}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SECRETSYAML}
echo "# EOF" >> ${OUTPUT_TGT_FILE_SECRETSYAML}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SECRETSYAML}
echo "" >> ${OUTPUT_TGT_FILE_SECRETSYAML}

echo "####################################################################" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
echo "# SUBSTITUTIONS" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
echo "" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}

# per device config file (substitutions)
printf "  # details for DALLAS sensors connected to device %s\n" ${DEVICE_NAME_LC} >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
printf "  dallas_%02dc01_name: \$friendly_name TempCase 01\n" ${DALLAS_DEV_NUM} >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
printf "  dallas_%02dc01_address: !secret DALLAS_01_${DEVICE_NAME_UC}_CASESENSOR_01_ADDRESS\n" ${DALLAS_DEV_NUM} >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}

CNT=${START_CNT}
while true
do
  printf "  dallas_%02de%02d_name: \$friendly_name TempEnv %02d\n" ${DALLAS_DEV_NUM} ${CNT} ${CNT} >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
  printf "  dallas_%02de%02d_address: !secret DALLAS_01_%s_ENVSENSOR_%02d_ADDRESS\n" ${DALLAS_DEV_NUM} ${CNT} ${DEVICE_NAME_UC} ${CNT} >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}

  let CNT++
  if [ ${CNT} -gt ${END_CNT} ]; then 
    break
  fi
done
echo "" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
echo "# EOF" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}
echo "" >> ${OUTPUT_TGT_FILE_SUBSTITUTIONS}

# per device config file (sensors)
CNT=${START_CNT}

echo "####################################################################" >> ${OUTPUT_TGT_FILE_SENSORS}
echo "# SENSORS" >> ${OUTPUT_TGT_FILE_SENSORS}
echo "" >> ${OUTPUT_TGT_FILE_SENSORS}

echo   "  # case sensor" >> ${OUTPUT_TGT_FILE_SENSORS}
echo   "#  - platform: dallas" >> ${OUTPUT_TGT_FILE_SENSORS}
printf "#    name: \${dallas_%02dc01_name}\n" ${DALLAS_DEV_NUM} >> ${OUTPUT_TGT_FILE_SENSORS}
printf "#    address: \${dallas_%02dc01_address}\n" ${DALLAS_DEV_NUM} >> ${OUTPUT_TGT_FILE_SENSORS}
echo "  # external sensors" >> ${OUTPUT_TGT_FILE_SENSORS}
while true
do
  printf "#  - platform: dallas\n" >> ${OUTPUT_TGT_FILE_SENSORS}
  printf "#    name: \${dallas_%02de%02d_name}\n" >> ${OUTPUT_TGT_FILE_SENSORS}
  printf "#    address: \${dallas_%02de%02d_address}\n" ${DALLAS_DEV_NUM} ${CNT} >> ${OUTPUT_TGT_FILE_SENSORS}
  let CNT++
  if [ ${CNT} -gt ${END_CNT} ]; then 
    break
  fi
done
echo "" >> ${OUTPUT_TGT_FILE_SENSORS}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SENSORS}
echo "# EOF" >> ${OUTPUT_TGT_FILE_SENSORS}
echo "####################################################################" >> ${OUTPUT_TGT_FILE_SENSORS}
echo "" >> ${OUTPUT_TGT_FILE_SENSORS}


