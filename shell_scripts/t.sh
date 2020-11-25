#!/bin/bash

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi

. ${DNAME}/scriptConfig

MAIN_DEVICE_YAML_FILE="l0corridor01.yaml"
ESPHOME_SUBSTITUTIONS_FILE="${ESPHOME_SUBSTITUTIONS_PATH}/${MAIN_DEVICE_YAML_FILE}"

function isSearchStringContained()
{
  local __resultvar=$1
  local __line=$2
  local __searchForStringOne=$3
  local __searchForStringTwo=$4
  local __tmpResult=""
  local  myresult='some value'

  echo "Function isSearchStringContained debug ----------------------"
  echo "input:"
  echo "__searchForStringOne: ${__searchForStringOne}"
  echo "__searchForStringTwo${__searchForStringTwo}"
  echo "__line: ${__line}"
  echo "Function isSearchStringContained debug ----------------------"

  __tmpResult=`echo ${__line} | grep -v "^#" | grep "${__searchForStringOne}" | grep "${__searchForStringTwo}"

  if [ "${__tmpResult}" == "" ];then
    myresult=0
  else
    myresult=1
  fi

  eval $__resultvar="'$myresult'"
}
# usage:
# isSearchStringContained result "$line" "- platform:"
# echo $result

function resolveSubstitution()
{
  local __resultvar=$1
  local __line=$2
  local __substitutionFile=$3
  local __tmpResultNoComment=""
  local __tmpResultSubstituteName=""
  local __tmpResultSubstituteNameCheck=""
  local __tmpResultRealEntityName=""
  local __tmpResultRealEntityNameRaw=""
  local __tmpResultRealEntityNameRawPartOne=""
  local __real_entity_name=""

  echo "Function resolveSubstitution debug ----------------------"
  echo "input:"
  echo "__substitutionFile: ${__substitutionFile}"
  echo "__line: ${__line}"
  echo "Function resolveSubstitution debug ----------------------"

  # make sure we are not processing a comment by accident
  __tmpResultNoComment=`echo ${__line} | grep -v "^#" | grep "-name:"`

  # if the current line is not a comment and contains "-name:"
  if [ "${__tmpResultNoComment}" != "" ];then
    #
    # WORKING ON THE FILE CONTAINING DEFINITIONS OF SENSORS --- START
    #

    # filter the entity name may it be a substitution or (rarely) a entity name
    #   __tmpResultSubstituteName will contain the part after the colon without space chars
    #   __tmpResultSubstituteNameCheck will contain the same as __tmpResultSubstituteName minus a possible dollar sign
    __tmpResultSubstituteName=`echo ${__tmpResultNoComment} | cut -f 2 -d ":" | tr -d " "`
    __tmpResultSubstituteNameCheck=`echo ${__tmpResultSubstituteName} | tr -d "$"`

    # if the vars are equal no substitution was used, we are done
    if [ "${__tmpResultSubstituteName}" == "${__tmpResultSubstituteNameCheck}"];then
      # the real entity name was found
      # why? the name does not contain a dollar sign
      __real_entity_name=__tmpResultSubstituteName
    else
      # now we go into the substitution file to find the substitution with is probably formed by another substitution

      #
      # WORKING ON THE SUBSTITUTION FILE --- START
      #

      # a)
      # let's look up the substitution in the substitution file

      # first we get the content on the right side of the colon and remove the first space char
      __tmpResultRealEntityNameRaw=`grep "${__tmpResultSubstituteNameCheck}:" ${__substitutionFile} | cut -f 2 -d ":" | cut -c2-`

      # b)
      # let's assume there is a substitution and the rest of the entity name in what we got
      # we check whether we have a substitution as part of the entity name

      b1)
      # so let's get the first part of the entity name
      __tmpResultRealEntityNameRawPartOneRaw=`echo ${__tmpResultRealEntityNameRaw} | cut -f 1 -d " "`

      b2)
      # now we remove a possible dollar sign to check whether there is a dollar sign
      __tmpResultRealEntityNameRawPartOneRawCheck=`echo ${__tmpResultRealEntityNameRawPartOneRaw} | tr -d "$"`

      if [ "${__tmpResultRealEntityNameRawPartOneRaw}" == "${__tmpResultRealEntityNameRawPartOneRawCheck}" ];then
        # the name does not contain a dollar sign, the real entity name was found
        # we just have to replace the spaces with a underline
        __tmpResultRealEntityNameRawPartOneRaw=`echo ${__tmpResultRealEntityNameRawPartOneRaw} | sed -e "s/ /_/g`
      else
        echo "foo bar"
      fi

      #
      # WORKING ON THE SUBSTITUTION FILE --- END
      #
    fi
  fi

  eval $__resultvar="'$__real_entity_name'"
}
# usage
# resolveSubstitution real_entity_name $next_line ${ESPHOME_SUBSTITUTIONS_FILE}


      # define the file names of the files holding the entities which are needed
      ESPHOME_ENTITIES_BINARYSENSORS_FILE="${ESPHOME_ENTITIES_BINARYSENSORS_PATH}/${MAIN_DEVICE_YAML_FILE}"
      ESPHOME_ENTITIES_SENSORS_FILE="${ESPHOME_ENTITIES_SENSORS_PATH}/${MAIN_DEVICE_YAML_FILE}"
      ESPHOME_ENTITIES_SWITCHES_FILE="${ESPHOME_ENTITIES_SWITCHES_PATH}/${MAIN_DEVICE_YAML_FILE}"
#      for ESPHOME_ENTITIES_FILE in \
#        ${ESPHOME_ENTITIES_SENSORS_FILE} \
#        ${ESPHOME_ENTITIES_BINARYSENSORS_FILE} \
#        ${ESPHOME_ENTITIES_SWITCHES_FILE}
      for ESPHOME_ENTITIES_FILE in \
        ${ESPHOME_ENTITIES_SENSORS_FILE}
      do
        # if the file exists and has a size greater than zero
        if [ -s ${ESPHOME_ENTITIES_FILE} ];then
          while IFS= read -r line
          do
            echo "$line"
            # check on "- platform"

            # set defaults
            prefix=""
            searchForStringOne=""
            searchForStringTwo=""

            if [ "${ESPHOME_ENTITIES_FILE}" == "${ESPHOME_ENTITIES_BINARYSENSORS_FILE}" ];then
              prefix="      - binary_sensor"
              searchForStringOne="- platform:"
              searchForStringTwo="gpio"
            fi
            if [ "${ESPHOME_ENTITIES_FILE}" == "${ESPHOME_ENTITIES_SENSORS_FILE}" ];then
              prefix="      - sensor"
              searchForStringOne="- platform:"
              searchForStringTwo="dallas"
            fi
            if [ "${ESPHOME_ENTITIES_FILE}" == "${ESPHOME_ENTITIES_SWITCHES_FILE}" ];then
              prefix="      - switch"
              searchForStringOne="- platform:"
              searchForStringTwo="gpio"
            fi

            if [ "${prefix}" != "" ];then
              echo "INFO: prefix is defined: ${prefix}"

              isSearchStringContained result "$line" "${searchForStringOne}" "${searchForStringTwo}"
              if [ $result =eq 1 ];then
                echo "INFO: searchString was found (1)"
                prefix="${prefix}.DEVICE_"
                entity_name=""
                real_entity_name=""
                # search strings found so lets read the next line with the entity name
                read -r next_line
                # now next_line should be something like "    name: $pir01_name"

                # search real entity name, a substitutuin is most likely used
                searchForStringOne="name:"
                searchForStringTwo=":"
                isSearchStringContained substition_found "$line" "${searchForStringOne}" "${searchForStringTwo}"
                if [ $substition_found - eq 1 ];then
                  echo "INFO: entity name found"

                  # set default. superflous, but nevertheless...
                  real_entity_name="rumpelstilzchen"

                  # replace possible substitute string with real entity name
                  resolveSubstitution real_entity_name $next_line ${ESPHOME_SUBSTITUTIONS_FILE}
                  output="${prefix}${real_entity_name}"
                  echo "TAB FILE ENTRY: ${output}"
                else
                  echo "ERROR: entity name not found"
                fi
              else
                echo "WARNING: searchString was not found (1)"
              fi
            else
              echo "ERROR: prefix is not defined"
            fi
          done < ${ESPHOME_ENTITIES_FILE}
        fi
      done

echo "done"

####################################################################
# EOF
####################################################################
