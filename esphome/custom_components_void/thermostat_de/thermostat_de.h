#pragma once

#include "esphome/core/component.h"
#include "esphome/core/automation.h"
#include "esphome/components/thermostat_de/thermostat_de.h"

namespace esphome {
namespace thermostat_de {

#define LOG_THERMOSTAT_DE(this) \
  ESP_LOGCONFIG(TAG, "  Acceleration: %.0f steps/s^2", this->acceleration_); \
  ESP_LOGCONFIG(TAG, "  Deceleration: %.0f steps/s^2", this->deceleration_);

class Thermostat_de {
 public:
  void set_target(int32_t steps) { this->target_position = steps; }
  void report_position(int32_t steps) { this->current_position = steps; }
  void set_acceleration(float acceleration) { this->acceleration_ = acceleration; }
  void set_deceleration(float deceleration) { this->deceleration_ = deceleration; }
  virtual void on_update_speed() {}
  bool has_reached_target() { return this->current_position == this->target_position; }

  int32_t current_position{0};
  int32_t target_position{0};

 protected:
  void calculate_speed_(uint32_t now);
  int32_t should_step_();

  float acceleration_{1e6f};
  float deceleration_{1e6f};
  float current_speed_{0.0f};
  // float max_speed_{1e6f};
  uint32_t last_calculation_{0};
  uint32_t last_step_{0};
};

template<typename... Ts> class SetTargetAction : public Action<Ts...> {
 public:
  explicit SetTargetAction(Thermostat_de *parent) : parent_(parent) {}

  TEMPLATABLE_VALUE(int32_t, target)

  void play(Ts... x) override { this->parent_->set_target(this->target_.value(x...)); }

 protected:
  Thermostat_de *parent_;
};

template<typename... Ts> class ReportPositionAction : public Action<Ts...> {
 public:
  explicit ReportPositionAction(Thermostat_de *parent) : parent_(parent) {}

  TEMPLATABLE_VALUE(int32_t, position)

  void play(Ts... x) override { this->parent_->report_position(this->position_.value(x...)); }

 protected:
  Thermostat_de *parent_;
};

template<typename... Ts> class SetSpeedAction : public Action<Ts...> {
 public:
  explicit SetSpeedAction(Thermostat_de *parent) : parent_(parent) {}

  TEMPLATABLE_VALUE(float, speed);

  void play(Ts... x) override {
    float speed = this->speed_.value(x...);
    this->parent_->on_update_speed();
  }

 protected:
  Thermostat_de *parent_;
};

}  // namespace thermostat_de
}  // namespace esphome