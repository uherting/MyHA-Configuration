TGT_DIR="overwrites"
for i in `ls l*yaml | grep -v -e ttgo -e cam32`
do
  TGT_FILE="${TGT_DIR}/${i}"
  echo "####################################################################" > ${TGT_FILE}
  echo "# OVERWRITE COMMON SUBSTITUTIONS" >> ${TGT_FILE}
  echo "" >> ${TGT_FILE}
  
  grep dht01_upd ${i} | grep -v DHT_UPDATE_INTERVAL_15MIN >> ${TGT_FILE}
  grep Door ${i} >> ${TGT_FILE}
done
