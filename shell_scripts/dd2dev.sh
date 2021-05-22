BNAME=`basename $0 .sh`

if [ $# -ne 2 ]; then
  echo "Usage"
  echo "$0 name_of_the_image output_dev"
  exit 99
fi

if=$1
of=$2

echo "input:  ${if}"
echo "output: ${of}"
echo ""
echo "5 secs till dd starts."
sleep 5
echo ""
echo ""

echo "doing dd"
time dd bs=32M \
        if=${if} \
        of=${of} \
        status=progress

