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
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

DEBUG=0
if [ $# -eq 1 ]; then
  if [ "$1" == "-d" ]; then
    DEBUG=1
  fi
fi
SRC_DIR="/home/uwe/Git/UH/esphome/esphome/components/"
TGT_DIR="/home/uwe/Git/UH/MyHAConfig/esphome/custom_components"

# what are the component names to be cloned called? (space separated)
COMPONENT_NAMES_ORIGIN="stepper uln2003"

# what are the cloned components to be called? (space separated)
# attn: the order has to match the order in COMPONENT_NAMES_ORIGIN!!!
COMPONENT_NAMES_CLONED="thermostat_uh equi_n1"

# ==========================================================================
#  !!!! no changes needed below here !!!!
# ==========================================================================

# take a text (parm #3), change it to (l)ower case, (m)ixed case or (u)pper
# case depending on parm #2 and assign it to variable parm #1
function change_case () {
  local __resultvar=$1
  local __target_type=$2
  local __text_to_convert=$3
  local myresult='the input value was not processed due to wrong target type'

  if [ "${__text_to_convert}" == "" ]; then
    myresult=""
  else
    # now we do(TM) something to the input
    case "$__target_type" in
      u ) myresult=`echo ${__text_to_convert} | tr [:lower:] [:upper:]`;;
      l ) myresult=`echo ${__text_to_convert} | tr [:upper:] [:lower:]`;;
      m ) myresult="`echo ${__text_to_convert} | cut -c1 | tr [:lower:] [:upper:]``echo ${__text_to_convert} | cut -c2- | tr [:upper:] [:lower:]`";;
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
declare -A arr_names_mc
declare -A arr_names_uc
declare -A arr_names_all

# fill arrays with key / value pairs
idx=1
comp_name_cloned_mc=""
comp_name_cloned_uc=""
comp_name_origin_mc=""
comp_name_origin_uc=""
for comp_name_origin_lc in ${COMPONENT_NAMES_ORIGIN_LC}
do
  # origin names
  change_case comp_name_origin_mc "m" "${comp_name_origin_lc}"
  change_case comp_name_origin_uc "u" "${comp_name_origin_lc}"

  # cloned names
  comp_name_cloned_lc=`echo ${COMPONENT_NAMES_CLONED_LC} | cut -f $idx -d " "`
  change_case comp_name_cloned_mc "m" "${comp_name_cloned_lc}"
  change_case comp_name_cloned_uc "u" "${comp_name_cloned_lc}"

  # echo "comp_name_cloned_lc = ${comp_name_cloned_lc}"
  idx=$((idx+1))
  arr_names_lc["${comp_name_origin_lc}"]="${comp_name_cloned_lc}"
  arr_names_mc["${comp_name_origin_mc}"]="${comp_name_cloned_mc}"
  arr_names_uc["${comp_name_origin_uc}"]="${comp_name_cloned_uc}"

  arr_names_all["${comp_name_origin_lc}"]="${comp_name_cloned_lc}"
  arr_names_all["${comp_name_origin_mc}"]="${comp_name_cloned_mc}"
  arr_names_all["${comp_name_origin_uc}"]="${comp_name_cloned_uc}"

  if [ "${comp_name_cloned_lc}" == "" ]; then
    echo "ERROR: amount of names in ORIGIN / CLONED does not match."
    exit 3
  fi
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
exit 102

# start the real task ...  Eventually.
echo "INFO: Changing PWD to ${TGT_DIR}."
cd ${TGT_DIR}
exit 102

echo "INFO: Cleaning up ${TGT_DIR} from residues of preivious runs of ${BNAME}."
rm -rf ${COMPONENT_NAMES_ORIGIN_LC} ${COMPONENT_NAMES_CLONED_LC}

echo "INFO: "
echo "INFO: Copying directories to be cloned into ${TGT_DIR}."
for dir in ${COMPONENT_NAMES_ORIGIN_LC}
do
  cp -r ${SRC_DIR}${dir} .
done
exit 103

GREP_OPTIONS_ORIGIN=""
for p in ${COMPONENT_NAMES_ORIGIN_LC}
do
  GREP_OPTIONS_ORIGIN="${GREP_OPTIONS}-e \"${p}\" "
done

# change naming conventions in files
SED_SCRIPT=""
for key in "${!arr_names_all[@]}"
do
  value=${arr_names_all[$i]}
  echo "key  : $key  value: ${value}"
  SED_SCRIPT="${SED_SCRIPT}-e \"s/${key}/${value}/g'\" "
done
echo "GREP_OPTIONS_ORIGIN = ${GREP_OPTIONS_ORIGIN}"
echo "SED_SCRIPT = ${SED_SCRIPT}"
exit 104

# loop over the dirs we have got and apply filter of original component names
for d in `ls | grep ${GREP_OPTIONS_ORIGIN}`
do
  echo "========================================"
  echo "  directory $d"
  echo "========================================"

  cd $d

  # change naming conventions
  for i in `find . -type f \
    | grep -v "__pycache__" \
    | xargs grep -ni ${GREP_OPTIONS_ORIGIN} \
    | grep -v ${BNAME}.sh \
    | cut -f 1 -d ":" \
    | sort -u`
  do
    echo "  Change naming conventions in file: $i"
    echo "cmd executed: sed -i ${SED_SCRIPT} $i"
    # sed -i ${SED_SCRIPT} $i
  done

exit 105

  # change file names
  for filename in `ls *.cpp *.h *.py`
  do
    key=`echo $filename | cut -f 1 -d "."`
    filename_base=$arr_names_lc[$key]
    ext=`echo $filename | cut -f 2 -d "."`
    filename_new=${filename_base}.${ext}
    mv $filename $filename_new
    echo "  Renamed file: $filename -> $filename_new"
  done
exit 106

  cd -

  # change dir names
  for dirname in "${!arr_names_lc[@]}"
  do
    dirname_new=${arr_names_lc[$dirname]}
    mv $dirname $dirname_new
    echo "  Renamed directory: $dirname -> $dirname_new"
  done
done
# EOF


