##########################################################################
#
# This Python script creates the service python_script.dismiss_notifications
# which dismisses all persistent notifications.
#
# usage: call the service python_script.dismiss_notifications
#
# for details see
# https://community.home-assistant.io/t/option-to-dismiss-all-persistent-notifications/220094
# https://community.home-assistant.io/t/option-to-dismiss-all-persistent-notifications/220094/2
#
##########################################################################
for notif in hass.states.entity_ids('persistent_notification'):
    hass.services.call(
        'persistent_notification', 'dismiss',
        {"notification_id": notif.split('.', 1)[-1]})
