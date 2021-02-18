import esphome.codegen as cg
import esphome.config_validation as cv
from esphome import automation
from esphome.components.output import FloatOutput
from esphome.const import CONF_ID, CONF_OUTPUT, CONF_TRIGGER_ID

CODEOWNERS = ['@glmnet']
CONF_RTTTL = 'uhtest01'
CONF_ON_FINISHED_PLAYBACK = 'on_finished_playback'

uhtest01_ns = cg.esphome_ns.namespace('uhtest01')

Uhtest01 = uhtest01_ns .class_('Uhtest01', cg.Component)
PlayAction = uhtest01_ns.class_('PlayAction', automation.Action)
StopAction = uhtest01_ns.class_('StopAction', automation.Action)
FinishedPlaybackTrigger = uhtest01_ns.class_('FinishedPlaybackTrigger',
                                          automation.Trigger.template())
IsPlayingCondition = uhtest01_ns.class_('IsPlayingCondition', automation.Condition)

MULTI_CONF = True

CONFIG_SCHEMA = cv.Schema({
    cv.GenerateID(CONF_ID): cv.declare_id(Uhtest01),
    cv.Required(CONF_OUTPUT): cv.use_id(FloatOutput),
    cv.Optional(CONF_ON_FINISHED_PLAYBACK): automation.validate_automation({
        cv.GenerateID(CONF_TRIGGER_ID): cv.declare_id(FinishedPlaybackTrigger),
    }),
}).extend(cv.COMPONENT_SCHEMA)


def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    yield cg.register_component(var, config)

    out = yield cg.get_variable(config[CONF_OUTPUT])
    cg.add(var.set_output(out))

    for conf in config.get(CONF_ON_FINISHED_PLAYBACK, []):
        trigger = cg.new_Pvariable(conf[CONF_TRIGGER_ID], var)
        yield automation.build_automation(trigger, [], conf)


@automation.register_action('uhtest01.play', PlayAction, cv.maybe_simple_value({
    cv.GenerateID(CONF_ID): cv.use_id(Uhtest01),
    cv.Required(CONF_RTTTL): cv.templatable(cv.string)
}, key=CONF_RTTTL))
def uhtest01_play_to_code(config, action_id, template_arg, args):
    paren = yield cg.get_variable(config[CONF_ID])
    var = cg.new_Pvariable(action_id, template_arg, paren)
    template_ = yield cg.templatable(config[CONF_RTTTL], args, cg.std_string)
    cg.add(var.set_value(template_))
    yield var


@automation.register_action('uhtest01.stop', StopAction, cv.Schema({
    cv.GenerateID(): cv.use_id(Uhtest01),
}))
def uhtest01_stop_to_code(config, action_id, template_arg, args):
    var = cg.new_Pvariable(action_id, template_arg)
    yield cg.register_parented(var, config[CONF_ID])
    yield var


@automation.register_condition('uhtest01.is_playing', IsPlayingCondition, cv.Schema({
    cv.GenerateID(): cv.use_id(Uhtest01),
}))
def uhtest01_is_playing_to_code(config, condition_id, template_arg, args):
    var = cg.new_Pvariable(condition_id, template_arg)
    yield cg.register_parented(var, config[CONF_ID])
    yield var
