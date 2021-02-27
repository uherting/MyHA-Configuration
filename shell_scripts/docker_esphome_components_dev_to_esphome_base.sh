#!/bin/bash
# attn:
#   the script is executed in the HA docker container which has got bash in
#   a diffrent location than standard Ubuntu

#
# attn:
#   this script can be found with the command
#     `find / -type d -name custom_components_dev`/../../shell_scripts/docker_esphome_components_dev_to_esphome_base.sh
# purpose:
#   copying all directories located in the MyHAconfiguration repository under
#     esphome/custom_components_dev
#

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

function usage {
  echo "How to us: ${0} -t r|n"
  echo "  - r => remove directories only"
  echo "  - n => remove and copy directories";
}

function chk_dir {
  TYP="$1"
  CHK_DIR="$2"
  if [ -d ${CHK_DIR} ]; then
    echo "INFO: dir ${CHK_DIR} of type ${TYP} does exists."
  else
    echo "ERROR: dir ${CHK_DIR} of type ${TYP} does not exist."
    echo "INFO: check if this is a dir please: `ls -ld ${CHK_DIR}`"
    exit 5
  fi
  echo " "
}

function remove_custom_dev_dirs_in_espbase {
  echo "INFO: executing function remove_custom_dev_dirs_in_espbase"
  if [ -f ${LOG_FILE_CUR} ]; then
    if [ -f ${LOG_FILE_OLD} ]; then
      cat ${LOG_FILE_OLD} > $LOG_FILE_OLD_BA{}
    fi
    #mv ${LOG_FILE_CUR} ${LOG_FILE_OLD}
    while read line_from_logfile
    do
      log_entry=`echo ${line_from_logfile} | cut -f 1 -d ":"`
      dir_name=`echo ${line_from_logfile} | cut -f 2 -d ":"`

      TGT_DIR_DEL="${TGT_DIR}/${dir_name}"
      if [ -d ${TGT_DIR_DEL} ]; then
        # rm -rf {TGT_DIR_DEL}
        echo "   component ${dir_name} was removed."
        # echo "REMOVED:" >> ${LOG_FILE_CUR
      else
        echo "   component ${dir_name} was not found and therefore not removed."
        # echo "NOT EXISTING:" >> ${LOG_FILE_CUR
      fi
    done < ${LOG_FILE_OLD}
  else
    echo "INFO: The log file ${LOG_FILE_CUR} does not exist."
    echo "INFO: Seems like no transfer has taken place yet or "
    echo "INFO: all customisation have been removed in a previous run of this script."
  fi
  echo " "
}

function copy_files_over_to_espbase {
  echo "INFO: executing function copy_files_over_to_espbase"
  echo "INFO: The function copy_files_over_to_espbase is not yet fully implemented"

  cd ${SRC_DIR}
  for dir in `find . -maxdepth 1 -type d | grep -v "^.$" | cut -f 2 -d "/"`; do
    echo "INFO: dir ${dir} to be copied to esphome base dir"
  done
  cd - > /dev/null
  echo " "
}

options=':t:h'
while getopts $options option
do
    case "$option" in
        t  ) t_arg=$OPTARG;;
        h  ) usage; exit;;
        \? ) echo "Unknown option: -$OPTARG" >&2; exit 1;;
        :  ) echo "Missing option argument for -$OPTARG" >&2; exit 1;;
        *  ) echo "Unimplemented option: -$option" >&2; exit 1;;
    esac
done

if ((OPTIND == 1))
then
    echo "No options specified"
fi

shift $((OPTIND - 1))

# the following line is just creating disturbing output
# if (($# == 0))
# then
#     echo "No positional arguments specified"
# fi

nothing_to_do=1
case ${t_arg} in
  r) nothing_to_do=0; echo "option r accepted";;
  n) nothing_to_do=0; echo "option n accepted";;
  *) usage; exit;;
esac


# - find the esphome custom_components directory
echo "INFO: finding / checking SRC dir"
SRC_DIR=`find / -type d -name custom_components_dev`
chk_dir "src" ${SRC_DIR}

# - find THE esphome component directory
echo "INFO: finding / checking TGT dir"
TGT_DIR=`find / -type d -name components | grep "/opt"`
chk_dir "tgt" ${TGT_DIR}

echo "INFO: assigning log file vars"
echo " "
LOG_FILE_BASENAME="transfer"
LOG_DIR=${SRC_DIR}
LOG_FILE_CUR="${LOG_DIR}/${LOG_FILE_BASENAME}.log"
LOG_FILE_OLD="${LOG_DIR}/${LOG_FILE_BASENAME}_old.log"
LOG_FILE_OLD_BA="${LOG_DIR}/${LOG_FILE_BASENAME}_old_backup.log"


# remove directories (required as preparation for copying dirs over)
remove_custom_dev_dirs_in_espbase

if [ "${t_arg}" == "r" ]; then
  exit 127
fi

copy_files_over_to_espbase

# EOF
