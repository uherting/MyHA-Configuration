#!/usr/bin/bash
# -------------------------------------------------------------------
#  purpose:
#  this script takes directories from the esphome repository and
#  places them in the ../esphome/custom_components_dev dir (including
#  renaming the naming and files / dirs included). no docker activity
#  is required.
# -------------------------------------------------------------------

#
# attn: see ../esphome/custom_components_dev/README for details on how to use the script
#

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
# replace the current dir name ./ with the absolute path
if [ "$DNAME" == "." ];then
  DNAME="`pwd`"
fi
# change the relative path to a absolute path
if [ "`echo $DNAME | cut -c1-2`" == ".." ];then
  DNAME="`pwd`/${DNAME}"
fi

echo "DEBUG: BNAME=${BNAME}"
echo "DEBUG: DNAME=${DNAME}"

DEBUG=0
if [ $# -eq 1 ]; then
  if [ "$1" == "-d" ]; then
    DEBUG=1
  fi
fi


# ==========================================================================
#  these are the settings to be changed (if at all)
# ==========================================================================
SRC_DIR="/home/uwe/Git/UH/esphome/esphome/components/"
TGT_DIR="/home/uwe/Git/UH/MyHAConfig/esphome/custom_components_dev"

# what are the component names to be cloned called? (space separated)
COMPONENT_NAMES_ORIGIN="stepper uln2003"

# what are the cloned components to be called? (space separated)
# attn: the order has to match the order in COMPONENT_NAMES_ORIGIN!!!
COMPONENT_NAMES_CLONED="thermostat_uh equi_n1"

# on which host is the ESPHome codebase?
# -> to be used whether the script is executed on the correct machine
HOST_WITH_REPOSITORY="alpha"

# ==========================================================================
#  !!!! no changes needed below here !!!!
# ==========================================================================

# take a text (parm #3), change it to (l)ower case, (m)ixed case or (u)pper
# case depending on parm #2 and assign it to variable parm #1
function change_case () {
  local __resultvar=$1
  local __target_type=$2
  local __text_to_convert=$3
  local myresult_pt1=""
  local myresult_pt2=""
  local myresult='the input value was not processed due to wrong target type'

  if [ "${__text_to_convert}" == "" ]; then
    myresult=""
  else
    # now we do(TM) something to the input
    case "$__target_type" in
      u ) myresult=`echo ${__text_to_convert} | tr [:lower:] [:upper:]`;;
      l ) myresult=`echo ${__text_to_convert} | tr [:upper:] [:lower:]`;;
      m ) myresult_pt1="`echo ${__text_to_convert} | cut -c1 | tr [:lower:] [:upper:]`"
          myresult_pt2="`echo ${__text_to_convert} | cut -c2- | tr [:upper:] [:lower:]`"
          myresult="${myresult_pt1}${myresult_pt2}"
          # echo "DEBUG: __text_to_convert=${__text_to_convert}   myresult=${myresult}"
          ;;
    esac
  fi

  # prepare the return value
  eval $__resultvar="'$myresult'"
}

# initialise the variables
COMPONENT_NAMES_ORIGIN_LC=""
COMPONENT_NAMES_CLONED_LC=""

# now make sure that we got component names in lower case only
change_case COMPONENT_NAMES_ORIGIN_LC "l" "${COMPONENT_NAMES_ORIGIN}"
change_case COMPONENT_NAMES_CLONED_LC "l" "${COMPONENT_NAMES_CLONED}"

# echo "LCO: #${COMPONENT_NAMES_ORIGIN}#${COMPONENT_NAMES_ORIGIN_LC}#"
# echo "LCO: #${COMPONENT_NAMES_CLONED}#${COMPONENT_NAMES_CLONED_LC}#"

# put the names in a associative array
declare -A arr_names_lc
# declare -A arr_names_mc
# declare -A arr_names_uc
declare -A arr_names_all

# fill arrays with key / value pairs
idx=1
comp_name_cloned_mc=""
comp_name_cloned_uc=""
comp_name_origin_mc=""
comp_name_origin_uc=""
for COMP_NAME_ORIGIN_LC in ${COMPONENT_NAMES_ORIGIN_LC}
do
  # origin names
  change_case comp_name_origin_mc "m" "${COMP_NAME_ORIGIN_LC}"
  change_case comp_name_origin_uc "u" "${COMP_NAME_ORIGIN_LC}"

  # cloned names
  comp_name_cloned_lc=`echo ${COMPONENT_NAMES_CLONED_LC} | cut -f $idx -d " "`
  if [ "${comp_name_cloned_lc}" == "" ]; then
    echo "ERROR: amount of names in ORIGIN / CLONED does not match."
    exit 3
  fi

  change_case comp_name_cloned_mc "m" "${comp_name_cloned_lc}"
  change_case comp_name_cloned_uc "u" "${comp_name_cloned_lc}"

  echo "DEBUG: comp_name_cloned_lc = ${comp_name_cloned_lc}"
  arr_names_lc["${COMP_NAME_ORIGIN_LC}"]="${comp_name_cloned_lc}"
  # arr_names_mc["${comp_name_origin_mc}"]="${comp_name_cloned_mc}"
  # arr_names_uc["${comp_name_origin_uc}"]="${comp_name_cloned_uc}"

  arr_names_all["${COMP_NAME_ORIGIN_LC}"]="${comp_name_cloned_lc}"
  arr_names_all["${comp_name_origin_mc}"]="${comp_name_cloned_mc}"
  arr_names_all["${comp_name_origin_uc}"]="${comp_name_cloned_uc}"

  idx=$((idx+1))
done

# debug output
if [ $DEBUG -eq 1 ]; then
  for i in "${!arr_names_all[@]}"
  do
  echo "key  : $i  value: ${arr_names_all[$i]}"
  done
fi

# lets get our hands dirty... or not ....


# check existance of tgt and src dir
# echo "INFO: checking existance of src and tgt dir"
# echo "INFO:     src: ${SRC_DIR}"
# echo "INFO:     tgt: ${TGT_DIR}"
EXIT_YN=0
if [ ! -d ${TGT_DIR} ]; then
  echo "ERROR: dir ${TGT_DIR} does not exist"
  EXIT_YN=1
fi
if [ ! -d ${SRC_DIR} ]; then
  echo "ERROR: dir ${SRC_DIR} does not exist"
  EXIT_YN=1
fi
if [ ${EXIT_YN} -eq 1 ]; then
  HOST_WHERE_I_AM_EXECUTED="`hostname`"
  if [ "${HOST_WHERE_I_AM_EXECUTED}" != "${HOST_WITH_REPOSITORY}" ];then
    echo "INFO: You are executing the script on the host ${HOST_WHERE_I_AM_EXECUTED}, but the repository is on ${HOST_WITH_REPOSITORY}..."
  fi
  exit 3
fi

# change naming conventions in files
SED_CMD_FILE="${DNAME}/${BNAME}.sed_cmd"
echo "DEBUG: SED_CMD_FILE=${SED_CMD_FILE}"

# for key in "${!arr_names_lc[@]}"
# do
#   value=${arr_names_lc[$key]}
#   echo "DEBUG: (sed/lc): key/val=$key/${value}" >> s.txt
# done
# for key in "${!arr_names_mc[@]}"
# do
#   value=${arr_names_mc[$key]}
#   echo "DEBUG: (sed/mc): key/val=$key/${value}" >> s.txt
# done
# for key in "${!arr_names_all[@]}"
# do
#   value=${arr_names_all[$key]}
#   echo "DEBUG: (sed/all): key/val=$key/${value}" >> s.txt
# done

echo "INFO: creating sed script file"
if [ -f ${SED_CMD_FILE} ]; then
  rm ${SED_CMD_FILE}
fi
for key in "${!arr_names_all[@]}"
do
  value=${arr_names_all[$key]}
  echo "s#${key}#${value}#g" >> ${SED_CMD_FILE}
done

GREP_OPTIONS_ORIGIN=""
for p in ${COMPONENT_NAMES_ORIGIN_LC}
do
  GREP_OPTIONS_ORIGIN="${GREP_OPTIONS_ORIGIN}-e ${p} "
done
echo "DEBUG: GREP_OPTIONS_ORIGIN = ${GREP_OPTIONS_ORIGIN}"

# start the real task ...  Eventually.
echo "INFO: Changing PWD to ${TGT_DIR} (to check permissions)."
cd ${TGT_DIR}
if [ $? -ne 0 ];then
  echo "ERROR: cannot change PWD to ${TGT_DIR}"
  exit 4
fi

echo "INFO: Cleaning up tgt dir from residues of previous runs of ${BNAME}.sh"
# echo "INFO:   to be exec: rm -rf ${COMPONENT_NAMES_ORIGIN_LC} ${COMPONENT_NAMES_CLONED_LC}"
rm -rf ${COMPONENT_NAMES_ORIGIN_LC} ${COMPONENT_NAMES_CLONED_LC}

echo "INFO: Copying directories to be cloned into ${TGT_DIR}"
for directory in ${COMPONENT_NAMES_ORIGIN_LC}
do
  cp -r ${SRC_DIR}/${directory} ${TGT_DIR}
done

# loop over the dirs we have got and apply filter of original component names
DIRECTORIES_TO_WORK_ON="`ls | grep ${GREP_OPTIONS_ORIGIN}`"
# echo "DEBUG: PWD now: `pwd`"
echo "DEBUG: now working on dirs generated by \"ls | grep ${GREP_OPTIONS_ORIGIN}\""
for DIRECTORY_TO_WORK_ON in ${DIRECTORIES_TO_WORK_ON}
do
  # echo "INFO: working on directory ${DIRECTORY_TO_WORK_ON}"
  # echo "DEBUG: cd to ${TGT_DIR}/${DIRECTORY_TO_WORK_ON}"
  cd ${TGT_DIR}/${DIRECTORY_TO_WORK_ON}
  if [ $? -ne 0 ];then
    echo "ERROR: cannot change PWD to ${TGT_DIR}/${DIRECTORY_TO_WORK_ON}"
    exit 5
  fi

  # change naming conventions
  echo "INFO: changing naming conventions (dir ${DIRECTORY_TO_WORK_ON})"
  for i in `find . -type f \
    | grep -v "__pycache__" \
    | xargs grep -ni ${GREP_OPTIONS_ORIGIN} \
    | grep -v ${BNAME}.sh \
    | cut -f 1 -d ":" \
    | sort -u`
  do
    echo "INFO:   Change naming conventions in file: $i"
    if [ -f $i ]; then
      # echo "DEBUG: cmd executed: sed -i -f ${SED_CMD_FILE} $i" >> t.txt
      sed -i -f ${SED_CMD_FILE} $i
    else
      echo "ERROR: file $i does not exist. cannot apply sed to it."
    fi
  done

  # change file names
  echo "INFO: changing file names"
  for FILENAME in `ls *.cpp *.h *.py`
  do
    key=`echo $FILENAME | cut -f 1 -d "."`
    # FILENAME_BASE=`echo ${arr_names_lc["$key"]} | tr -d "\[" | tr -d "\]"`
    FILENAME_BASE=${arr_names_lc["$key"]}
    if [ "${FILENAME_BASE}" == "" ]; then
      echo "INFO:   file name $FILENAME will not be changed"
    else
      # echo "DEBUG: FILENAME=${FILENAME} / key=${key} / FILENAME_BASE=${FILENAME_BASE}"
      ext=`echo $FILENAME | cut -f 2 -d "."`
      FILENAME_NEW="${FILENAME_BASE}.${ext}"
      # echo "DEBUG:   (ext/fn/fnnew)=(${ext}/${key}/${FILENAME_BASE})"
      # echo "DEBUG:   FILENAME/FILENAME_NEW:${FILENAME}/${FILENAME_NEW}"
      if [ "${FILENAME}" == "${FILENAME_NEW}" ]; then
        echo "INFO:   file name $FILENAME will not be changed (huh?)"
      else
        echo "INFO:   Renaming file $FILENAME -> $FILENAME_NEW"
        mv $FILENAME $FILENAME_NEW
      fi
    fi
  done

  cd ${TGT_DIR}

done

# change dir names
echo "INFO: changing directory names"
for DIRECTORY_TO_WORK_ON in "${!arr_names_lc[@]}"
do
  dirname_new=${arr_names_lc[$DIRECTORY_TO_WORK_ON]}
  mv ${DIRECTORY_TO_WORK_ON} $dirname_new
  echo "INFO: Renamed directory: ${DIRECTORY_TO_WORK_ON} -> $dirname_new"
done

rm ${SED_CMD_FILE}

# EOF
