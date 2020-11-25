echo "restarting docker service"
/etc/init.d/docker restart

echo " "
echo "restarting hassio_supervisor container"
docker restart hassio_supervisor

sleep 35

# no longer necessary as the container gets started by hassio_supervisor 
echo " "
echo "restarting homeassistant container"
docker restart homeassistant

exit 1

# everything below is thrash as the output of docker ps is not predictable


if [ $# -eq 1 ]; then
  if [ "$1" == "-a" ]; then
    # wait until containers hassio_dns and homeassistant are running
    sleep 35

    # no longer necessary as the container gets started by hassio_supervisor 
    docker restart homeassistant
    sleep 10

    # which containers are currently running?
    GREP_PARM=""
    for running_container in `docker ps | tr -s " " | cut -f5- -d " " | grep -v NAMES`
    do 
      #echo "#${running_container}#"
      GREP_PARM="${GREP_PARM} -e ${running_container}"
    done
   
    echo " "
    echo "restarting addon containers"
   
    for addon in `docker ps -a | cut -c160- | tr -d " " | grep -v -e MES ${GREP_PARM}`
    do
      echo "starting container ${addon}"
      docker start $addon
    done
  fi
fi
