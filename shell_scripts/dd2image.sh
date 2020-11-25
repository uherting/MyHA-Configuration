BNAME=`basename $0 .sh`

if [ $# -ne 2 ]; then
  echo "Usage"
  echo "$0 hostname name_of_the_image_without_timestamp"
  exit 99
fi

ADD_PARM=""
if [ ${BNAME} = "dd2image4GB" ];then
  ADD_PARM="count=4000"
fi

TGT_DIR="/home/raspi_images/${1}"
TS=`date +%Y%m%d_%H%M%S`
of="${TGT_DIR}/${TS}__${2}.img"

echo "doing the unmount of the mmc partitions"
umount /dev/mmcblk0p1
umount /dev/mmcblk0p2

if [ ! -d ${TGT_DIR} ]; then
 mkdir ${TGT_DIR}
fi

echo "doing dd"
time dd bs=4M ${ADD_PARM} \
        if=/dev/mmcblk0 \
        of=${of} \
        status=progress

#echo "doing bzip2"
#time bzip2 ${of}
