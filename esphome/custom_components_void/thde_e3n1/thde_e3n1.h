#pragma once

#include "esphome/core/component.h"
#include "esphome/core/esphal.h"
#include "esphome/components/thermostat_de/thermostat_de.h"

namespace esphome {
namespace thde_e3n1 {

// enum THDE_E3N1StepMode {
//   THDE_E3N1_STEP_MODE_FULL_STEP,
//   THDE_E3N1_STEP_MODE_HALF_STEP,
//   THDE_E3N1_STEP_MODE_WAVE_DRIVE,
// };

class THDE_E3N1 : public thermostat_de::Thermostat_de, public Component {
 public:
  void set_pin_boost_button(GPIOPin *pin_boost_button) { pin_boost_button_ = pin_boost_button; }
  void set_pin_rotary_encoder01(GPIOPin *pin_rotary_encoder01) { pin_rotary_encoder01_ = pin_rotary_encoder01; }
  void set_pin_rotary_encoder02(GPIOPin *pin_rotary_encoder02) { pin_rotary_encoder02_ = pin_rotary_encoder02; }
  // void set_pin_d(GPIOPin *pin_d) { pin_d_ = pin_d; }

  void setup() override;
  void loop() override;
  void dump_config() override;
  float get_setup_priority() const override { return setup_priority::HARDWARE; }
  void set_sleep_when_done(bool sleep_when_done) { this->sleep_when_done_ = sleep_when_done; }
  // void set_step_mode(THDE_E3N1StepMode step_mode) { this->step_mode_ = step_mode; }

 protected:
  void write_step_(int32_t step);

  bool sleep_when_done_{false};
  GPIOPin *pin_boost_button_;
  GPIOPin *pin_rotary_encoder01_;
  GPIOPin *pin_rotary_encoder02_;
  // GPIOPin *pin_d_;
  // THDE_E3N1StepMode step_mode_{THDE_E3N1_STEP_MODE_FULL_STEP};
  HighFrequencyLoopRequester high_freq_;
  int32_t current_uln_pos_{0};
};

}  // namespace thde_e3n1
}  // namespace esphome