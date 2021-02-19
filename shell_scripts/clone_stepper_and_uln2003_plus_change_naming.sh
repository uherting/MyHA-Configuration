#!/usr/bin/bash

DIR_STEPPER="stepper"
DIR_ULN2003="uln2003"

DIR_STEPPER_NEW="uhthermostat"
DIR_ULN2003_NEW="uheq3n1"

SRC_DIR="/home/uwe/Git/UH/esphome/esphome/components/"
TGT_DIR="/home/uwe/Git/UH/MyHAConfig/esphome/custom_components"

if [ ! -d ${TGT_DIR} ]; then
    echo "ERROR: dir ${TGT_DIR} does not exist"
    exit 99
fi

cd ${TGT_DIR}

rm -rf ${DIR_STEPPER} ${DIR_ULN2003} ${DIR_STEPPER_NEW} ${DIR_ULN2003_NEW}

cp -r ${SRC_DIR}${DIR_STEPPER} .
cp -r ${SRC_DIR}${DIR_ULN2003} .

# exit 99

for d in `ls | grep -e "stepper" -e "uln2003"`
do
    echo "========================================"
    echo "  directory $d"
    echo "========================================"

    cd $d

    # change naming conventions
    for i in `find . -type f \
        | grep -v "__pycache__" \
        | grep -v -e zzbase -e zzext \
        | xargs grep -ni -e "stepper" -e "uln2003" \
        | grep -v change_naming.sh \
        | cut -f 1 -d ":" \
        | sort -u`
    do
        echo "    Change naming conventions in file: $i"
        sed -i \
            -e "s/STEPPER/UHTHERMOSTAT/g" \
            -e "s/Stepper/Uhthermostat/g" \
            -e "s/${DIR_STEPPER}/${DIR_STEPPER_NEW}/g" \
            -e "s/ULN2003/UHEQ3N1/g" \
            -e "s/Uln2003/Uheq3n1/g" \
            -e "s/${DIR_ULN2003}/${DIR_ULN2003_NEW}/g" \
            $i
    done

    # change file names
    for f in `ls *.cpp *.h *.py`
    do
        # echo "f = $f"
        fn=`echo $f | sed -e "s/${DIR_STEPPER}/${DIR_STEPPER_NEW}/g"`
        # echo "fn1 = $fn"
        fn=`echo $fn | sed -e "s/${DIR_ULN2003}/${DIR_ULN2003_NEW}/g"`
        # echo "fn2 = $fn"
        if [ "$f" != "$fn" ]; then
            mv  $f $fn
            echo "    Renamed file: $f -> $fn"
        fi
    done
    cd -
    if [ "$d" == "${DIR_STEPPER}" ]; then
        mv ${DIR_STEPPER} ${DIR_STEPPER_NEW} 
    fi
    if [ "$d" == "${DIR_ULN2003}" ]; then
        mv ${DIR_ULN2003} ${DIR_ULN2003_NEW}
    fi
done
# EOF


