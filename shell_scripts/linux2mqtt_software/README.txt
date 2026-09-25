Links
-----

- How to Monitor Linux Server Stats in Home Assistant
    https://blog.fosketts.net/2024/12/30/how-to-monitor-linux-server-stats-in-home-assistant/
- linux2mqtt at GitHub
    https://github.com/miaucl/linux2mqtt

Installation
------------
- does not work on Ubuntu: pip install linux2mqtt
- therefore:
  - apt install python3-venv (already existed on the machine winnipeg)
  - python3 -m venv /root/linux2mqtt (sets up a virtual environment in the directory /root/linux2mqtt, 
      for more on virtual environments see https://python.land/virtual-environments/virtualenv )
  - no activation of the new venv aka "source /root/linux2mqtt/bin/activate"!!!
  - /root/linux2mqtt/bin/pip install linux2mqtt 
      (installs packages: typish, typing-extensions, psutil, paho-mqtt, jsons, linux2mqtt in the 
      /root/linux2mqtt directory structure)
  - network devices:
    - wlp4s0
    - eno1 (altname enp3s0)
  - test run (to be tested on Home Assistant with MQTT Explorer):
    /root/linux2mqtt/bin/python3 \
      /root/linux2mqtt/bin/linux2mqtt \
      --name $HOSTNAME \
      --cpu=15 \
      --vm \
      --temp \
      --fan \
      --du='/' \
      --du='/home' \
      --net=enp3s0,15 \   eno1
      --host=192.168.178.31 \
      --username=mqtt_linux2mqtt \
      --password=lifetec \
      -vvvvv
  - vi /etc/systemd/system/linux2mqtt and insert the following lines:
[Unit]
Description=Log system information via MQTT
DefaultDependencies=no
After=network-online.target

[Service]
ExecStart=/root/linux2mqtt/bin/linux2mqtt --name $HOSTNAME --cpu=15 --vm --temp --fan --du='/' --du='/home' --net=enp0s1,15 --host=192.168.178.31 --username=mqtt_linux2mqtt --password=lifetec
Type=exec
Restart=always

[Install]
WantedBy=default.target

- commands:
  - systemctl daemon-reload
  - systemctl stop linux2mqtt.service
  - systemctl status linux2mqtt.service
  - systemctl daemon-reload