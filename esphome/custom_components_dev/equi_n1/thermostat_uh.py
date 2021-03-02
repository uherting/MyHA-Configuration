import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import pins
from esphome.components import thermostat_uh
from esphome.const import CONF_ID, CONF_SLEEP_WHEN_DONE, CONF_STEP_MODE

CONF_PIN_A = 'pin_a'
CONF_PIN_B = 'pin_b'
CONF_PIN_C = 'pin_c'
# CONF_PIN_D = 'pin_d'

equi_n1_ns = cg.esphome_ns.namespace('equi_n1')
EQUI_N1StepMode = equi_n1_ns.enum('EQUI_N1StepMode')

STEP_MODES = {
    'FULL_STEP': EQUI_N1StepMode.EQUI_N1_STEP_MODE_FULL_STEP,
    'HALF_STEP': EQUI_N1StepMode.EQUI_N1_STEP_MODE_HALF_STEP,
    'WAVE_DRIVE': EQUI_N1StepMode.EQUI_N1_STEP_MODE_WAVE_DRIVE,
}

EQUI_N1 = equi_n1_ns.class_('EQUI_N1', thermostat_uh.Thermostat_uh, cg.Component)

CONFIG_SCHEMA = thermostat_uh.THERMOSTAT_UH_SCHEMA.extend({
    cv.Required(CONF_ID): cv.declare_id(EQUI_N1),
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
    yield thermostat_uh.register_thermostat_uh(var, config)

    pin_a = yield cg.gpio_pin_expression(config[CONF_PIN_A])
    cg.add(var.set_pin_a(pin_a))
    pin_b = yield cg.gpio_pin_expression(config[CONF_PIN_B])
    cg.add(var.set_pin_b(pin_b))
    pin_c = yield cg.gpio_pin_expression(config[CONF_PIN_C])
    cg.add(var.set_pin_c(pin_c))
    # pin_d = yield cg.gpio_pin_expression(config[CONF_PIN_D])
    # cg.add(var.set_pin_d(pin_d))

    cg.add(var.set_sleep_when_done(config[CONF_SLEEP_WHEN_DONE]))
    cg.add(var.set_step_mode(config[CONF_STEP_MODE]))
