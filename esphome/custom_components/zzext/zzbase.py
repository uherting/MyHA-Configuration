import esphome.codegen as cg
import esphome.config_validation as cv

CODEOWNERS = ['@glmnet']
CONF_ZZEXT = 'zzext'

zzext_ns = cg.esphome_ns.namespace('zzext')

Zzext = zzext_ns .class_('Zzext', cg.Component)

# CONFIG_SCHEMA = cv.Schema({
#     cv.GenerateID(CONF_ID): cv.declare_id(Zzext),
#     cv.Required(CONF_OUTPUT): cv.use_id(FloatOutput),
#     cv.Optional(CONF_ON_FINISHED_PLAYBACK): automation.validate_automation({
#         cv.GenerateID(CONF_TRIGGER_ID): cv.declare_id(FinishedPlaybackTrigger),
#     }),
# }).extend(cv.COMPONENT_SCHEMA)

CONFIG_SCHEMA = cv.Schema({
    cv.GenerateID(CONF_ID): cv.declare_id(Zzext),
    cv.Required(CONF_MY_REQUIRED_KEY): cv.string,
    cv.Optional(CONF_MY_OPTIONAL_KEY, default=10): cv.int_,
}).extend(cv.COMPONENT_SCHEMA)


# def to_code(config):
#     var = cg.new_Pvariable(config[CONF_ID])
#     yield cg.register_component(var, config)

#     out = yield cg.get_variable(config[CONF_OUTPUT])
#     cg.add(var.set_output(out))

#     for conf in config.get(CONF_ON_FINISHED_PLAYBACK, []):
#         trigger = cg.new_Pvariable(conf[CONF_TRIGGER_ID], var)
#         yield automation.build_automation(trigger, [], conf)

def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    yield cg.register_component(var)

    cg.add(var.set_my_required_key(config[CONF_MY_REQUIRED_KEY]))
