import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import pins
from esphome.components import thermostat_de
from esphome.const import CONF_ID, CONF_SLEEP_WHEN_DONE, CONF_STEP_MODE

thde_e3n1_ns = cg.esphome_ns.namespace('thde_e3n1')
# THDE_E3N1StepMode = thde_e3n1_ns.enum('THDE_E3N1StepMode')

# STEP_MODES = {
#     'FULL_STEP': THDE_E3N1StepMode.THDE_E3N1_STEP_MODE_FULL_STEP,
#     'HALF_STEP': THDE_E3N1StepMode.THDE_E3N1_STEP_MODE_HALF_STEP,
#     'WAVE_DRIVE': THDE_E3N1StepMode.THDE_E3N1_STEP_MODE_WAVE_DRIVE,
# }

CONF_PIN_BOOST_BUTTON = "PIN_BOOST_BUTTON"
CONF_PIN_ROTARY_ENCODER01 = "PIN_ROTARY_ENCODER01"
CONF_PIN_ROTARY_ENCODER02 = "PIN_ROTARY_ENCODER02"

THDE_E3N1 = thde_e3n1_ns.class_('THDE_E3N1', thermostat_de.Thermostat_de, cg.Component)

CONFIG_SCHEMA = thermostat_de.THERMOSTAT_DE_SCHEMA.extend({
    cv.Required(CONF_ID): cv.declare_id(THDE_E3N1),
    cv.Required(CONF_PIN_BOOST_BUTTON): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_ROTARY_ENCODER01): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_ROTARY_ENCODER02): pins.gpio_output_pin_schema,
    cv.Optional(CONF_SLEEP_WHEN_DONE, default=False): cv.boolean,
}).extend(cv.COMPONENT_SCHEMA)


def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    yield cg.register_component(var, config)
    yield thermostat_de.register_thermostat_de(var, config)

    pin_boost_button = yield cg.gpio_pin_expression(config[CONF_PIN_BOOST_BUTTON])
    cg.add(var.set_pin_boost_button(pin_boost_button))
    pin_rotary_encoder01 = yield cg.gpio_pin_expression(config[CONF_PIN_ROTARY_ENCODER01])
    cg.add(var.set_pin_rotary_encoder01(pin_rotary_encoder01))
    pin_rotary_encoder02 = yield cg.gpio_pin_expression(config[CONF_PIN_ROTARY_ENCODER02])
    cg.add(var.set_pin_rotary_encoder02(pin_rotary_encoder02))

    cg.add(var.set_sleep_when_done(config[CONF_SLEEP_WHEN_DONE]))
    cg.add(var.set_step_mode(config[CONF_STEP_MODE]))
