TGT_DIR="overwrites"
for i in l*yaml
do
  TGT_FILE="${TGT_DIR}/${i}"
  echo "####################################################################" > ${TGT_FILE}
  echo "# OVERWRITE COMMON SUBSTITUTIONS" >> ${TGT_FILE}
  echo "" >> ${TGT_FILE}
  
  grep dht01_upd ${i} >> ${TGT_FILE}
done
