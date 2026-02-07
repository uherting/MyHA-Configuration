for i in equi_n1 thermostat_uh
do
  cd $i
  echo "DIR: $i"
  for f in `grep -e pin_a -e pin_b -e pin_c -e CONF_PIN_ * | cut -f 1 -d ":" | sort -u`
  do
    echo "    FILE: $f"
    sed -i \
      -e "s/pin_a/push_button/g" -e "s/pin_b/rotary_encoder01/g" -e "s/pin_c/rotary_encoder02/g" \
      -e "s/CONF_PIN_A/CONF_PUSH_BUTTON/g" -e "s/CONF_PIN_B/CONF_ROTARY_ENCODER01/g" -e "s/CONF_PIN_B/CONF_ROTARY_ENCODER02/g" -e "s/CONF_PIN_D/CONF_NOTINUSE/g" \
      $f
  done
  cd - > /dev/null
  # pwd
done
