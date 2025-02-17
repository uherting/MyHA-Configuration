#!/usr/bin/bash

###############################################################################
# stop display manager and disable the display manager service
#
# from https://3xn.nl/projects/2024/04/04/permanently-switching-off-the-gui-in-debian-linux/
###############################################################################

# Disable the Display Manager: The Display Manager is the graphical login screen 
# that appears when you start up Debian. You can disable it by stopping the 
# service and preventing it from starting at boot time. Use the following command to stop the service:

systemctl stop display-manager.service
systemctl disable display-manager.service

###############################################################################
# Additional information
###############################################################################

# Removal of GUI packages: You can remove the GUI packages from your Debian installation by using the following command:

sudo apt-get remove task-gnome-desktop

# This will remove the GNOME desktop environment and all its associated packages. 
# If you’re using a different desktop environment, replace “gnome” with the name 
# of your desktop environment.

# Reboot your system: Once you’ve disabled the Display Manager and removed the GUI 
# packages, you’ll need to reboot your system for the changes to take effect. 
# Use the following command to reboot your system:

reboot

# After the reboot, your Debian installation should boot into a command-line interface without any GUI.

# Keep in mind that disabling the GUI permanently may make some tasks more difficult or time-consuming to perform. It’s recommended to proceed with caution and ensure that you have a backup plan in case you need to re-enable the GUI later.

# The following has been suggested by https://fosstodon.org/@HankB :
#     systemctl set-default multi-user.target
#     systemctl set-default graphical.target

