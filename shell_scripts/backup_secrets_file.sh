#!/bin/bash

##########################################################################################
#
#  this script exports the secrets.yaml file to uwe@beta
#
##########################################################################################

BNAME=`basename $0 .sh`
DNAME=`dirname $0`
if [ "$DNAME" == "." ];then
 DNAME="`pwd`"
fi


TS=`date +%Y%m%d_%H%M%S`
scp secrets_real.yaml uwe@beta:/home/uwe/Desktop/secrets_${TS}.yaml

