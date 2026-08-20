# Copilot Instructions for MyHA-Configuration

## Repository Overview

This is a comprehensive Home Assistant configuration repository for a multi-location smart home setup. The codebase consists of Home Assistant YAML configurations, custom Python components, AppDaemon automations, ESPHome device configs, Node-RED flows, and various automation/scripting solutions.

## Architecture & Components

### Core Configuration Structure
- **`configuration.yaml`** - Main Home Assistant entry point using `default_config` with extended settings
- **`conf/`** - Modular configuration split across subdirectories:
  - `automations/` - HA automation rules in YAML
  - `scripts/` - HA script definitions (YAML with Python-like sequences)
  - `sensors/` - Template and derived sensors
  - `binary_sensors/`, `switches/`, `groups/`, `templates/` - Entity definitions
  - `notify.yaml`, `mqtt/`, `telegram_bot.yaml` - Integration configs

### Automation & Scripting Layers
1. **Home Assistant Automations** (`conf/automations/`) - High-level event-triggered workflows
2. **Home Assistant Scripts** (`conf/scripts/`) - Reusable action sequences (often call other scripts)
3. **AppDaemon** (`appdaemon/apps/`) - Python-based stateful apps with persistent state and complex logic
4. **PyScript** (`pyscript/`) - Python code executed directly within HA context
5. **Python Scripts** (`python_scripts/`) - Simple Python utilities called from automations
6. **Node-RED** (`node-red/`) - Visual flow-based automations (minimal use, mostly flows.json)
7. **Shell Scripts** (`shell_scripts/`) - System-level scripts for device integration and utilities

### Hardware Integration
- **ESPHome** (`esphome/`) - Firmware configs for ESP32/ESP8266 devices with displays, sensors, and UIs
  - Device configs use multi-character location codes (e.g., `l2kitchen11`, `l9lorry01d`)
  - Includes display configs, font definitions, and external component references
- **Zigbee2MQTT** - Managed via Node-RED and HA integrations
- **Custom Components** (`custom_components/`) - ~40+ third-party HA integrations (HACS-managed)

### Blueprint Repository
- **`blueprints/`** - Reusable automation/script/template definitions for import into other HA instances
- **`blueprints_unused/`** - Archived blueprints (not actively deployed)

## Key Conventions

### Naming Patterns
- **Location prefixes** - Multi-character codes indicate physical locations:
  - `l2` = Level 2 (e.g., l2kitchen, l2lounge, l2bedroom)
  - `l9` = Garage area (e.g., l9lorry01d, l9esp32cam01)
  - `gh` = Guest house
  - `uh` = Main user home
- **Entity naming** - Follows HA conventions with location prefixes:
  - `binary_sensor.cam_rworld1_motion`
  - `switch.zb_auto_off_l2_kitchen_dishwasher`
  - Automation file names often match entity names or trigger devices
- **Unused/Inactive patterns** - Deprecated or inactive items go to `*_unused` or `*_inactive` directories rather than being deleted:
  - `automations_unused/`, `blueprints_unused/`, `pyscript_inactive/`
  - This preserves history and allows easy re-enablement

### YAML & Automation Patterns
- **Comment blocks** - Use extensive header/separator comments:
  ```yaml
  # ############################################################
  # Description of the automation
  # ############################################################
  ```
- **Section organization** - Within automations, use comments to delineate:
  - `# --------------------- TRIGGER ---------------------`
  - `# -------------------- CONDITIONS -------------------`
  - `# --------------------- ACTIONS ---------------------`
- **Script chaining** - Scripts often call other scripts in sequence (e.g., notification scripts are reused across automations)
- **Cooldown entities** - Use `input_boolean` entities for cooldown logic to prevent rapid re-triggering
- **Secrets management** - Sensitive data stored in `secrets.yaml` with `!secret` YAML tag

### AppDaemon & Python Conventions
- Base class: `hass.Hass` (AppDaemon HASS API)
- Entry point: `initialize()` method
- Logging: `self.log()` for all output
- Config file: `appdaemon/appdaemon.yaml`
- Apps typically maintain state and handle complex timing logic

### Custom Component Patterns
- Each custom component in `custom_components/<name>/` follows standard HA structure
- Large component example: `ha_washdata/` with ML analysis capabilities, multiple domains (binary_sensor, button, etc.)
- Entry point: `__init__.py` with async setup functions
- Configuration: `config_flow.py` for UI configuration
- Constants: `const.py` for all configuration parameters

## File Organization Guidelines

### When Adding New Automations
1. Create a descriptive `.yaml` file in `conf/automations/`
2. Use location prefix + trigger/entity name for filename (e.g., `zb_charger_uh_on.yaml`)
3. Include full comment headers with purpose
4. Use standard section comments (TRIGGER/CONDITIONS/ACTIONS)
5. Reuse existing scripts (check `conf/scripts/`) before creating new ones

### When Adding New Scripts
1. Create in `conf/scripts/` with descriptive name
2. Include `alias`, `icon`, and `description` fields
3. Define `fields` section for any input parameters with descriptions
4. Group related scripts (e.g., all Telegram notification scripts share common pattern)

### When Disabling Features
1. Move to `*_unused/` or `*_inactive/` directory with parent directory structure preserved
2. Never delete - preserve history and metadata
3. Update comments to note why disabled

### Custom Component Development
1. Follow HA integration structure with `__init__.py`, `manifest.json`, etc.
2. Use async/await patterns for HA integration
3. Store component-specific configs in their own subdirectories
4. Reference HA architecture docs for multi-domain support

## Validation & Testing Approach

**No automated test runners are configured in this repository.** Validation is manual:
- YAML configs are validated by HA on startup (check `home-assistant.log` for errors)
- AppDaemon errors appear in HA logs and AppDaemon-specific logs
- ESPHome configs can be validated with `esphome compile <device>.yaml`
- Custom components follow HA validation on first load

**Development Workflow:**
1. Make changes to config files
2. Trigger HA reload (via Developer Tools or automation)
3. Check `home-assistant.log.1` and current logs for errors
4. For AppDaemon changes: restart AppDaemon service
5. For custom components: restart HA core

## Important Context

- **Multi-location smart home** - Configurations span multiple physical locations (main house, guest house, garage)
- **Long-running setup** - This is a mature, production Home Assistant instance with years of accumulated automations
- **Mixed automation languages** - Prefer HA automations and scripts for new features (simpler, YAML-based); use AppDaemon for complex stateful logic
- **Custom component diversity** - Includes ML components, custom sensors, advanced thermostat control, and specialized integrations
- **Extensive logging** - Many automations include notification/logging steps for debugging and user feedback
- **Device discovery** - ESPHome devices auto-discovered by Home Assistant on network

## Common Tasks

### Adding a New IoT Device
1. If ESP32/ESP8266: Create device YAML in `esphome/conf/` with location-based naming
2. Configure device displays, sensors, binary_sensors in ESPHome YAML
3. HA auto-discovers via mDNS on network
4. Create HA automations/scripts to handle device events

### Creating Notification Flows
- Central notification scripts exist in `conf/scripts/` (e.g., `tg_send_txt`, `tg_send_file`)
- Reuse these from automations by calling with appropriate parameters
- Reduces duplication and keeps notification logic centralized

### Debugging Automations
- Check entity state changes in HA Developer Tools
- Look at `home-assistant.log` for automation execution
- Use `action: service: logger.log` in automations to add debug output
- AppDaemon debug output goes to its dedicated log

## Secrets & Configuration
- Never commit credentials; use `secrets.yaml` with `!secret key_name` references
- `.storage/` directory is git-ignored (holds HA runtime state)
- `.cache/`, `.google.token`, and other runtime files are ignored
- Active `.gitignore` is at repository root

## GitHub Integration (MCP Server)

The repository is integrated with GitHub and can be accessed directly via MCP tools for:

### Current Repository Status
- **Owner:** uherting
- **Repository:** MyHA-Configuration
- **Branches:** master (default), espnow_packet_transport_improvement_l9lorry01x (feature)
- **Open Issues:** 2 (l2kitchen12 validation, espnow packet transport sensors)
- **Recent Commits:** Regular HACS/ZB snapshots with feature PRs

### Available GitHub MCP Tools
Use these tools to query GitHub directly when working on tasks:

- **list_commits** - Analyze recent changes, understand what was modified
- **list_issues** / **search_issues** - Check existing issues before creating new ones
- **list_pull_requests** - Review what changes are in flight
- **issue_read** - Get full issue details including discussion
- **pull_request_read** - Review PR details, commits, and changes
- **get_commit** - Examine specific changes with full diff
- **get_file_contents** - Read files directly from GitHub (useful for remote validation)
- **search_code** - Find usage patterns across the codebase
- **actions_list** / **actions_get** - Check workflow runs if CI/CD is configured

### Workflow Examples
1. **Before adding new automations** - Search for similar existing automations (e.g., `search_code` for "zb_charger")
2. **When encountering errors** - Check issues (#56: l2kitchen12 validation, #55: espnow sensors)
3. **For device configuration changes** - Verify against recent ESPHome commits and PRs
4. **Document context** - Link issues/commits in commit messages or PR descriptions for traceability
