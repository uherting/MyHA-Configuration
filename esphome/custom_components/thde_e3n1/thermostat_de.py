import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import pins
from esphome.components import thermostat_de
from esphome.const import CONF_ID, CONF_PIN_A, CONF_PIN_B, CONF_PIN_C, CONF_PIN_D, \
    CONF_SLEEP_WHEN_DONE, CONF_STEP_MODE

thde_e3n1_ns = cg.esphome_ns.namespace('thde_e3n1')
THDE_E3N1StepMode = thde_e3n1_ns.enum('THDE_E3N1StepMode')

STEP_MODES = {
    'FULL_STEP': THDE_E3N1StepMode.THDE_E3N1_STEP_MODE_FULL_STEP,
    'HALF_STEP': THDE_E3N1StepMode.THDE_E3N1_STEP_MODE_HALF_STEP,
    'WAVE_DRIVE': THDE_E3N1StepMode.THDE_E3N1_STEP_MODE_WAVE_DRIVE,
}

THDE_E3N1 = thde_e3n1_ns.class_('THDE_E3N1', thermostat_de.Thermostat_de, cg.Component)

CONFIG_SCHEMA = thermostat_de.THERMOSTAT_DE_SCHEMA.extend({
    cv.Required(CONF_ID): cv.declare_id(THDE_E3N1),
    cv.Required(CONF_PIN_A): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_B): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_C): pins.gpio_output_pin_schema,
    cv.Required(CONF_PIN_D): pins.gpio_output_pin_schema,
    cv.Optional(CONF_SLEEP_WHEN_DONE, default=False): cv.boolean,
    cv.Optional(CONF_STEP_MODE, default='FULL_STEP'): cv.enum(STEP_MODES, upper=True, space='_')
}).extend(cv.COMPONENT_SCHEMA)


def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    yield cg.register_component(var, config)
    yield thermostat_de.register_thermostat_de(var, config)

    pin_a = yield cg.gpio_pin_expression(config[CONF_PIN_A])
    cg.add(var.set_pin_a(pin_a))
    pin_b = yield cg.gpio_pin_expression(config[CONF_PIN_B])
    cg.add(var.set_pin_b(pin_b))
    pin_c = yield cg.gpio_pin_expression(config[CONF_PIN_C])
    cg.add(var.set_pin_c(pin_c))
    pin_d = yield cg.gpio_pin_expression(config[CONF_PIN_D])
    cg.add(var.set_pin_d(pin_d))

    cg.add(var.set_sleep_when_done(config[CONF_SLEEP_WHEN_DONE]))
    cg.add(var.set_step_mode(config[CONF_STEP_MODE]))
