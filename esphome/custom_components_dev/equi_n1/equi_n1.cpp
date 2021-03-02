#include "equi_n1.h"
#include "esphome/core/log.h"

namespace esphome {
namespace equi_n1 {

static const char *TAG = "equi_n1.thermostat_uh";

void EQUI_N1::setup() {
  this->pin_a_->setup();
  this->pin_b_->setup();
  this->pin_c_->setup();
  // this->pin_d_->setup();
  this->loop();
}
void EQUI_N1::loop() {
  bool at_target = this->has_reached_target();
  if (at_target) {
    this->high_freq_.stop();

    if (this->sleep_when_done_) {
      this->pin_a_->digital_write(false);
      this->pin_b_->digital_write(false);
      this->pin_c_->digital_write(false);
      // this->pin_d_->digital_write(false);
      // do not write pos
      return;
    }
  } else {
    this->high_freq_.start();

    int dir = this->should_step_();
    this->current_uln_pos_ += dir;
  }

  this->write_step_(this->current_uln_pos_);
}
void EQUI_N1::dump_config() {
  ESP_LOGCONFIG(TAG, "EQUI_N1:");
  LOG_PIN("  Pin A: ", this->pin_a_);
  LOG_PIN("  Pin B: ", this->pin_b_);
  LOG_PIN("  Pin C: ", this->pin_c_);
  // LOG_PIN("  Pin D: ", this->pin_d_);
  ESP_LOGCONFIG(TAG, "  Sleep when done: %s", YESNO(this->sleep_when_done_));
  const char *step_mode_s = "";
  switch (this->step_mode_) {
    case EQUI_N1_STEP_MODE_FULL_STEP:
      step_mode_s = "FULL STEP";
      break;
    case EQUI_N1_STEP_MODE_HALF_STEP:
      step_mode_s = "HALF STEP";
      break;
    case EQUI_N1_STEP_MODE_WAVE_DRIVE:
      step_mode_s = "WAVE DRIVE";
      break;
  }
  ESP_LOGCONFIG(TAG, "  Step Mode: %s", step_mode_s);
}
void EQUI_N1::write_step_(int32_t step) {
  int32_t n = this->step_mode_ == EQUI_N1_STEP_MODE_HALF_STEP ? 8 : 4;
  auto i = static_cast<uint32_t>((step % n + n) % n);
  uint8_t res = 0;

  switch (this->step_mode_) {
    case EQUI_N1_STEP_MODE_FULL_STEP: {
      // AB, BC, CD, DA
      res |= 1 << i;
      res |= 1 << ((i + 1) % 4);
      break;
    }
    case EQUI_N1_STEP_MODE_HALF_STEP: {
      // A, AB, B, BC, C, CD, D, DA
      res |= 1 << (i >> 1);
      res |= 1 << (((i + 1) >> 1) & 0x3);
      break;
    }
    case EQUI_N1_STEP_MODE_WAVE_DRIVE: {
      // A, B, C, D
      res |= 1 << i;
      break;
    }
  }

  this->pin_a_->digital_write((res >> 0) & 1);
  this->pin_b_->digital_write((res >> 1) & 1);
  this->pin_c_->digital_write((res >> 2) & 1);
  // this->pin_d_->digital_write((res >> 3) & 1);
}

}  // namespace equi_n1
}  // namespace esphome
