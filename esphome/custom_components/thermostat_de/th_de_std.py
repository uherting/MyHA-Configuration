import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import pins
from esphome.components import i2c
from esphome.components import mcp23017
from esphome.const import CONF_ID, CONF_NUMBER, CONF_MODE, CONF_INVERTED

DEPENDENCIES = ['i2c', 'mcp23017']
MULTI_CONF = True

thermostat_de_ns = cg.esphome_ns.namespace('thermostat_de')
THERMOSTAT_DEGPIOMode = thermostat_de_ns.enum('THERMOSTAT_DEGPIOMode')
THERMOSTAT_DE_GPIO_MODES = {
    'INPUT': THERMOSTAT_DEGPIOMode.THERMOSTAT_DE_INPUT,
    'INPUT_PULLUP': THERMOSTAT_DEGPIOMode.THERMOSTAT_DE_INPUT_PULLUP,
    'OUTPUT': THERMOSTAT_DEGPIOMode.THERMOSTAT_DE_OUTPUT,
}

THERMOSTAT_DE = thermostat_de_ns.class_('THERMOSTAT_DE', cg.Component, i2c.I2CDevice)
THERMOSTAT_DEGPIOPin = thermostat_de_ns.class_('THERMOSTAT_DEGPIOPin', cg.GPIOPin)

CONFIG_SCHEMA = cv.Schema({
    cv.Required(CONF_ID): cv.declare_id(THERMOSTAT_DE),
}).extend(cv.COMPONENT_SCHEMA).extend(i2c.i2c_device_schema(0x20))


def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    yield cg.register_component(var, config)
    yield i2c.register_i2c_device(var, config)


CONF_THERMOSTAT_DE = 'thermostat_de'
THERMOSTAT_DE_OUTPUT_PIN_SCHEMA = cv.Schema({
    cv.Required(CONF_THERMOSTAT_DE): cv.use_id(THERMOSTAT_DE),
    cv.Required(CONF_NUMBER): cv.int_,
    cv.Optional(CONF_MODE, default="OUTPUT"): cv.enum(THERMOSTAT_DE_GPIO_MODES, upper=True),
    cv.Optional(CONF_INVERTED, default=False): cv.boolean,
})
THERMOSTAT_DE_INPUT_PIN_SCHEMA = cv.Schema({
    cv.Required(CONF_THERMOSTAT_DE): cv.use_id(THERMOSTAT_DE),
    cv.Required(CONF_NUMBER): cv.int_,
    cv.Optional(CONF_MODE, default="INPUT"): cv.enum(THERMOSTAT_DE_GPIO_MODES, upper=True),
    cv.Optional(CONF_INVERTED, default=False): cv.boolean,
})


@pins.PIN_SCHEMA_REGISTRY.register(CONF_THERMOSTAT_DE,
                                   (THERMOSTAT_DE_OUTPUT_PIN_SCHEMA, THERMOSTAT_DE_INPUT_PIN_SCHEMA))
def thermostat_de_pin_to_code(config):
    parent = yield cg.get_variable(config[CONF_THERMOSTAT_DE])
    yield THERMOSTAT_DEGPIOPin.new(parent, config[CONF_NUMBER], config[CONF_MODE], config[CONF_INVERTED])
