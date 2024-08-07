#!/bin/bash

##########################################################################################
#
#  this script generates the lovelace tabs for esp8266 devices
#  from the defined ESPHome devices named "l*"
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig

if [ ! -d ${HA_PATH} ];then
  echo "ERROR: directory does not exist: ${HA_PATH}"
  exit 99
fi

# go to the dir which contains the ESPHome device main definitions
cd ${ESPHOME_PATH}
if [ $? -ne 0 ]; then
  echo "cannot cd to ${ESPHOME_PATH}"
  exit 99
fi

# get the device file names
MAIN_DEVICE_YAML_FILES=`ls l*yaml | sort`

# get the unique names of the levels on which the devices are located
LEVELS=`ls l*yaml | cut -c1-2 | sort -u`

# define the common part of the location where the lovelace files are located
TABS_PATH_COMMON_ROOT="${HA_PATH}/conf/lovelace/tabs"

# define the location where the lovelace files for the admin tabs are located
TABS_PATH_ADMIN="${TABS_PATH_COMMON_ROOT}/admin"

# define the location where the lovelace files for the user tabs are located
TABS_PATH_USER="${TABS_PATH_COMMON_ROOT}/tabs/user"

for TABS_PATH in ${TABS_PATH_USER}
do
  # go to the dir which contains the lovelace tab definitions
  cd ${TABS_PATH}
  if [ $? -ne 0 ]; then
    echo "cannot cd to ${TABS_PATH}"
    exit 98
  fi

  # define the default for the main template file
  TEMPLATE_MAIN_FILE="esp8266_template_main_admin.yaml"
  # depending on the path being processed we need to change the default
  if [ "${TABS_PATH}" == "${TABS_PATH_USER}" ];then
    TEMPLATE_MAIN_FILE="esp8266_template_main_admin.yaml"
  fi

  # built the tab file header
  for lvl in $LEVELS
  do
    cat ${TABS_PATH}/../esp8266_template_header.yaml | \
      sed -e "s/LEVEL/${lvl}/g" \
      > esp8266_${lvl}.yaml
  done

  # built the tab file core
  for MAIN_DEVICE_YAML_FILE in ${MAIN_DEVICE_YAML_FILES}
  do
    ESPHOME_SUBSTITUTIONS_FILE="${ESPHOME_SUBSTITUTIONS_PATH}/${MAIN_DEVICE_YAML_FILE}"
    DEVICE=`grep devicename ${ESPHOME_SUBSTITUTIONS_FILE} | head -n1 | tr -d " " | cut -f 2 -d ":"`
    LEVEL=`echo ${DEVICE} | cut -c1-2`
    TITLE=`grep friendly_name ${ESPHOME_SUBSTITUTIONS_FILE} | \
      head -n1 | \
      cut -f 2 -d ":" | \
      cut -c2- | \
      sed -e "s/01/ 01/g" \
          -e "s/02/ 02/g" \
          -e "s/03/ 03/g" \
          -e "s/04/ 04/g" \
          -e "s/05/ 05/g" \
          -e "s/06/ 06/g" \
          -e "s/07/ 07/g" \
          -e "s/08/ 08/g" \
          -e "s/09/ 09/g" | \
      tr -s " "`

    # some outpout on the command line so we know which
    #  - level and device we are processing
    #  - the title for the card
    echo "LEVEL=${LEVEL}   DEVICE=${DEVICE}   TITLE=${TITLE}"

    # use the template and add a section for each device in the tab file
    if [ "${TABS_PATH}" == "${TABS_PATH_USER}" ];then
      # user tab is created here
      cat ${TEMPLATE_MAIN_FILE} | \
        sed -e "s/DEVICE/${DEVICE}/g" \
            -e "s/TITLE/${TITLE}/g" \
            -e "s/\.l0/.l0_/g" \
            -e "s/\.l2/.l2_/g" \
            -e "s/\.l9/.l9_/g" \
        >> esp8266_${LEVEL}.yaml

      # define the file names of the files holding the entities which are needed
      ESPHOME_ENTITIES_BINARYSENSORS_FILE="${ESPHOME_ENTITIES_BINARYSENSORS_PATH}/${MAIN_DEVICE_YAML_FILE}"
      ESPHOME_ENTITIES_SENSORS_FILE="${ESPHOME_ENTITIES_SENSORS_PATH}/${MAIN_DEVICE_YAML_FILE}"
      ESPHOME_ENTITIES_SWITCHES_FILE="${ESPHOME_ENTITIES_SWITCHES_PATH}/${MAIN_DEVICE_YAML_FILE}"
      for ESPHOME_ENTITIES_FILE in \
        ${ESPHOME_ENTITIES_SENSORS_FILE} \
        ${ESPHOME_ENTITIES_BINARYSENSORS_FILE} \
        ${ESPHOME_ENTITIES_SWITCHES_FILE}
      do
        # if the file exists and has a size greater than zero
        if [ -s ${ESPHOME_ENTITIES_FILE} ];then
          while IFS= read -r line
          do
            echo "$line"
            if [ "${ESPHOME_ENTITIES_FILE}" == "${ESPHOME_ENTITIES_SENSORS_FILE}" ];then
            fi
            if [ "${ESPHOME_ENTITIES_FILE}" == "${ESPHOME_ENTITIES_BINARYSENSORS_FILE}" ];then
            fi
            if [ "${ESPHOME_ENTITIES_FILE}" == "${ESPHOME_ENTITIES_SWITCHES_FILE}" ];then
            fi
          done < ${ESPHOME_ENTITIES_FILE}
        fi
      done

    else
      # admin tab is created here
      cat ${TEMPLATE_MAIN_FILE} | \
        sed -e "s/DEVICE/${DEVICE}/g" \
            -e "s/TITLE/${TITLE}/g" \
            -e "s/\.l0/.l0_/g" \
            -e "s/\.l2/.l2_/g" \
            -e "s/\.l9/.l9_/g" \
        >> esp8266_${LEVEL}.yaml
    fi

  done

  # built the tab file footer
  for lvl in $LEVELS
  do
    cat ${TABS_PATH}/../esp8266_template_footer.yaml \
      >> esp8266_${lvl}.yaml
  done

done
echo "done"

####################################################################
# EOF
####################################################################
