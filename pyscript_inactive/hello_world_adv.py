# source: https://github.com/custom-components/pyscript

@service
def hello_world_adv(action=None, id=None):
    """yaml
description: hello_world service example using pyscript.
fields:
  action:
     description: turn_on turns on the light, fire fires an event
     example: turn_on
  id:
     description: id of light, or name of event to fire
     example: kitchen.light
"""
    log.info(f"hello world: got action {action}")
    if action == "turn_on" and id is not None:
        light.turn_on(entity_id=id, brightness=255)
    elif action == "fire" and id is not None:
        event.fire(id)

