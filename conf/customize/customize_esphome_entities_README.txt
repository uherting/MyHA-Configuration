# ================================================================
# ================================================================
# {%- for e in integration_entities('esphome') %}
# {{ e }}:
#   friendly_name: "{{ state_attr(e, 'friendly_name')|regex_replace('^' ~ device_name(e)~' ', '') }}"
# {%- endfor %}
# ================================================================
# The above code is to be used in the template editor
# The result is to be pasted into customize_esphome_entities.yaml
# ================================================================