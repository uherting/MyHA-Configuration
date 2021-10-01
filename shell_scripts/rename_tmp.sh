#!/bin/bash

# attn: no longer needed!

exit 99

for i in `find .. -type f -name \*.yaml | xargs grep \
      -e sensor.xiaomi_bathroom \
      -e sensor.xiaomi_bedroom \
      -e sensor.xiaomi_lounge \
      -e sensor.xiaomi_storage | cut -f1 -d":" | sort -u`
do
  echo $i
  sed -i \
      -e "s/sensor.xiaomi_bathroom/sensor.xiaomi_l2_bathroom/g" \
      -e "s/sensor.xiaomi_bedroom/sensor.xiaomi_l2_bedroom/g" \
      -e "s/sensor.xiaomi_lounge/sensor.xiaomi_l2_lounge/g" \
      -e "s/sensor.xiaomi_storage/sensor.xiaomi_l2_storage/g" \
      $i
done
