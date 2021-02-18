import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import automation
from esphome.const import CONF_ACCELERATION, CONF_DECELERATION, CONF_ID, CONF_MAX_SPEED, \
    CONF_POSITION, CONF_TARGET, CONF_SPEED
from esphome.core import CORE, coroutine, coroutine_with_priority

IS_PLATFORM_COMPONENT = True

# pylint: disable=invalid-name
uhbase_ns = cg.esphome_ns.namespace('uhbase')
Uhbase = uhbase_ns.class_('Uhbase')

# SetTargetAction = uhbase_ns.class_('SetTargetAction', automation.Action)
# ReportPositionAction = uhbase_ns.class_('ReportPositionAction', automation.Action)
# SetSpeedAction = uhbase_ns.class_('SetSpeedAction', automation.Action)

def validate_acceleration(value):
    value = cv.string(value)
    for suffix in ('steps/s^2', 'steps/s*s', 'steps/s/s', 'steps/ss', 'steps/(s*s)'):
        if value.endswith(suffix):
            value = value[:-len(suffix)]

    if value == 'inf':
        return 1e6

    try:
        value = float(value)
    except ValueError:
        # pylint: disable=raise-missing-from
        raise cv.Invalid(f"Expected acceleration as floating point number, got {value}")

    if value <= 0:
        raise cv.Invalid("Acceleration must be larger than 0 steps/s^2!")

    return value

UHBASE_SCHEMA = cv.Schema({
    cv.Optional(CONF_ACCELERATION, default='inf'): validate_acceleration,
})


@coroutine
def setup_uhbase_core_(uhbase_var, config):
    if CONF_ACCELERATION in config:
        cg.add(uhbase_var.set_acceleration(config[CONF_ACCELERATION]))


@coroutine
def register_uhbase(var, config):
    if not CORE.has_id(config[CONF_ID]):
        var = cg.Pvariable(config[CONF_ID], var)
    yield setup_uhbase_core_(var, config)


@coroutine_with_priority(100.0)
def to_code(config):
    cg.add_global(uhbase_ns.using)
