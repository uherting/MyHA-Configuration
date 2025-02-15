#!/usr/bin/bash

###############################################################################
# stop display manager and disable the display manager service
#
# from https://unix.stackexchange.com/questions/569514/how-to-disable-and-enable-gui-of-debian-10
###############################################################################

# To disable the GUI:
systemctl set-default multi-user.target
reboot

# To re-enable the GUI:

systemctl set-default graphical.target
reboot


###############################################################################
# Additional information (background to above)
#
# from https://www.server-world.info/en/note?os=Debian_12&p=runlevel
###############################################################################
 	
# If you would like to change System Run-Level, set like follows.
# [1] 	Run-Level is set with linking to [default.target].
# For example, the default setting with Graphical-Login is set like follows.
root@dlp:~# systemctl get-default
# graphical.target

root@dlp:~# ll /usr/lib/systemd/system/default.target
lrwxrwxrwx 1 root root 16 Feb 28 05:15 /usr/lib/systemd/system/default.target -> graphical.target

root@dlp:~# ll /lib/systemd/system/graphical.target
-rw-r--r-- 1 root root 606 Feb 16 12:10 /lib/systemd/system/graphical.target

# [2] 	For example, if you'd like to change Run-Level to Text-Login, set like follows.
# On Debian based System, Graphical-Login is enabled automatically when 
# installing Desktop Environment packages, however if you'd like to disable 
# Graphical-Login by default, specify [multi-user.target].
root@dlp:~# systemctl set-default multi-user.target
Created symlink /etc/systemd/system/default.target → /lib/systemd/system/multi-user.target.

root@dlp:~# systemctl get-default
multi-user.target

root@dlp:~# ll /etc/systemd/system/default.target
lrwxrwxrwx 1 root root 37 Jun 15 01:42 /etc/systemd/system/default.target -> /lib/systemd/system/multi-user.target 