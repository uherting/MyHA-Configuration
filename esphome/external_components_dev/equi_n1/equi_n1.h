#pragma once

#include "esphome/core/component.h"
#include "esphome/core/esphal.h"
#include "esphome/components/thermostat_uh/thermostat_uh.h"

namespace esphome {
namespace equi_n1 {

enum EQUI_N1StepMode {
  EQUI_N1_STEP_MODE_FULL_STEP,
  EQUI_N1_STEP_MODE_HALF_STEP,
  EQUI_N1_STEP_MODE_WAVE_DRIVE,
};

class EQUI_N1 : public thermostat_uh::Thermostat_uh, public Component {
 public:
  void set_push_button(GPIOPin *push_button) { push_button_ = push_button; }
  void set_rotary_encoder01(GPIOPin *rotary_encoder01) { rotary_encoder01_ = rotary_encoder01; }
  void set_rotary_encoder02(GPIOPin *rotary_encoder02) { rotary_encoder02_ = rotary_encoder02; }
  // void set_pin_d(GPIOPin *pin_d) { pin_d_ = pin_d; }

  void setup() override;
  void loop() override;
  void dump_config() override;
  float get_setup_priority() const override { return setup_priority::HARDWARE; }
  void set_sleep_when_done(bool sleep_when_done) { this->sleep_when_done_ = sleep_when_done; }
  void set_step_mode(EQUI_N1StepMode step_mode) { this->step_mode_ = step_mode; }

 protected:
  void write_step_(int32_t step);

  bool sleep_when_done_{false};
  GPIOPin *push_button_;
  GPIOPin *rotary_encoder01_;
  GPIOPin *rotary_encoder02_;
  // GPIOPin *pin_d_;
  EQUI_N1StepMode step_mode_{EQUI_N1_STEP_MODE_FULL_STEP};
  HighFrequencyLoopRequester high_freq_;
  int32_t current_uln_pos_{0};
};

}  // namespace equi_n1
}  // namespace esphome
