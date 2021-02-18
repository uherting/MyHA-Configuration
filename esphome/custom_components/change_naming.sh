#!/usr/bin/bash

for i in `find . -type f \
    | grep -v "__pycache__" \
    | xargs grep -ni -e "stepper" -e "uln2003" \
    | grep -v change_naming.sh \
    | cut -f 1 -d ":" \
    | sort -u`
do
    echo "FILE: $i"
    sed -i \
        -e "s/ULN2003/UH_E3N1/g" \
        -e "s/Uln2003/Uh_e3n1/g" \
        -e "s/uln2003/uh_e3n1/g" \
        -e "s/STEPPER/UH_THERMOSTAT/g" \
        -e "s/Stepper/Uh_thermostat/g" \
        -e "s/stepper/uh_thermostat/g"
done

    # | grep -v -e ULN2003 -e STEPPER -e uln2003 -e stepper -e Stepper