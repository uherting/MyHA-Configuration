path="/sys/devices/virtual/thermal"
name="temp"
TEMP=""
for dir in thermal_zone0 thermal_zone1
do 
  file="${path}/${dir}/${name}"
  # echo $file
  TEMP="${TEMP} `cat ${file}`"
done
echo "TEMP = ${TEMP}"

path="/sys/devices/virtual/thermal/thermal_zone0"
TP=""
for name in trip_point_0_temp trip_point_1_temp
do 
  file="${path}/${name}"
  # echo $file
  TP="${TP} `cat ${file}`"
done
echo "TP = ${TP}"

# ###############################
# EOF
# ###############################