This is the README file for the files touch_button_Ax_[short|long|double].yaml

Attention 
---------
All automations related to touch buttons are configured as part of the device configuration.

Naming conventions
------------------
 - The digit after the capitalized A describes the GPIO pin of the MCP23017 device.
 - Actions based on clicking:
    * short: Triggers opto coupler #1 in order to toggle state of the light bar between off and high intensity.
    * long: No idea what a double click should trigger.
    * double: Triggers opto coupler #1 in order to change state the light bar between to off.