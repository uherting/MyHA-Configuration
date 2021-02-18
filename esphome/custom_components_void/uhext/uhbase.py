import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import pins
from esphome.components import uhbase
from esphome.const import CONF_ID, CONF_SLEEP_WHEN_DONE, CONF_STEP_MODE

uh_ext_ns = cg.esphome_ns.namespace('uh_ext')

CONF_PIN_BOOST_BUTTON = "PIN_BOOST_BUTTON"
CONF_PIN_ROTARY_ENCODER01 = "PIN_ROTARY_ENCODER01"
CONF_PIN_ROTARY_ENCODER02 = "PIN_ROTARY_ENCODER02"

UH_EXT = uh_ext_ns.class_('UH_EXT', uhbase.Uhbase, cg.Component)

CONFIG_SCHEMA = uhbase.UHBASE_SCHEMA.extend({
    cv.Required(CONF_ID): cv.declare_id(UH_EXT),
    cv.Required(CONF_PIN_BOOST_BUTTON): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_ROTARY_ENCODER01): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_ROTARY_ENCODER02): pins.gpio_output_pin_schema,
    cv.Optional(CONF_SLEEP_WHEN_DONE, default=False): cv.boolean,
}).extend(cv.COMPONENT_SCHEMA)


def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    yield cg.register_component(var, config)
    yield uhbase.register_uhbase(var, config)
