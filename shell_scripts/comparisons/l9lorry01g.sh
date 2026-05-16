#!/bin/bash

##########################################################################################
#
#  this script compares l9lorry01g config files with analogous files related to l2kitchen12
#
##########################################################################################

BNAME=$(basename $0 .sh)
DNAME=$(dirname $0)
if [ "$DNAME" == "." ];then
 DNAME=$(pwd)
fi

. ${DNAME}/scriptConfig

