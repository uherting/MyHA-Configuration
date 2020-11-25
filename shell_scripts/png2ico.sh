
BNAME=`basename $0 .sh`

function create_ico {
  ICO_SIZE=48
  if [ $# -gt 0 ]; then
    ICO_SIZE=$1
  fi

  CUR_DIR="`pwd`"
  PNG_FILE="`basename ${CUR_DIR}`.png"

  echo "icon size: ${ICO_SIZE}px"
  #echo "PNG_FILE: ${PNG_FILE}"

  if [ -f ${PNG_FILE} ]; then
    /usr/bin/convert \
      -resize x${ICO_SIZE} \
      -gravity center \
      -crop ${ICO_SIZE}x${ICO_SIZE}+0+0 ${PNG_FILE} favicon.png
    /usr/bin/icotool -c -o favicon.ico f*.png
  fi
}

if [ "${BNAME}" == "png2ico" ]; then
  create_ico
elif [ "${BNAME}" == "png2dir" ]; then
  for file in *png; do
    echo $file
    DIR=`basename ${file} .png`
    if [ ! -e ${DIR} ]; then
      echo "creating dir ${DIR}"
      mkdir $DIR
      cp -a ${file} ${DIR}
      cd $DIR > /dev/null
      create_ico
      cd -  > /dev/null
    fi
  done

fi

