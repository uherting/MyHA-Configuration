name="temp"
T1=""
for i in `find /sys -type f -name $name`
do 
  # echo $i
  T1="${T1} `cat ${i}`"
done
echo "T1 = ${T1}"

name="trip*temp"
TT=""
for i in `find /sys -type f -name $name`
do 
  # echo $i
  TT="${TT} `cat ${i}`"
done
echo "TT = ${TT}"
