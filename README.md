# PrintWatch Card

A feature-rich Home Assistant card for monitoring and controlling your 3D printer. Get real-time updates on print progress, temperatures, material status, and more with a sleek, user-friendly interface.

**Supported Integrations:**
- [Bambu Lab (ha-bambulab)](https://github.com/greghesp/ha-bambulab) - P1S, X1C, and other Bambu Lab printers
- [Moonraker Home Assistant](https://github.com/marcolivierarsenault/moonraker-home-assistant) - Klipper/Moonraker-based printers (Voron, Ender, etc.)

### Light Mode 
![PrintWatch Card Screenshot](assets/light-mode-min.png)

### Dark Mode
![PrintWatch Dark Mode](assets/dark-mode-min.png)  

### German Example
![PrintWatch Nord](assets/german.png)

## Features

- 🎥 Live camera feed with configurable refresh rate
- 📊 Print progress tracking with layer count and estimated completion time
- 🎨 AMS/Material status visualization including current filament (Bambu Lab only)
- 💡 Quick controls for chamber light and auxiliary fan
- ⏯️ Print control buttons (pause/resume/stop) with [confirmation dialogs](assets/pause.png)
- 🎛️ Speed profile monitoring and control (Bambu Lab only)
- ⚡ Local API (LAN Mode)
- 🌑 Native Theme support
- 🌡️ Real-time temperature monitoring and control for bed and nozzle
- 📷 G-Code preview image / Thumbnail
- 🏷️ Display print weight and length details
- 🌍 Localization support (initial translations in German, more contributions welcome!)

## Prerequisites

- Home Assistant
- One of the following integrations:
  - **Bambu Lab**: [ha-bambulab](https://github.com/greghesp/ha-bambulab) plugin with image sensor toggle turned on
  - **Moonraker/Klipper**: [moonraker-home-assistant](https://github.com/marcolivierarsenault/moonraker-home-assistant) integration
- Required entities set up (see Configuration section)

![Image Screenshot](assets/image-toggle.png)


## Installation

### HACS (Recommended) - Awaiting approval from HACS, follow manual

1. Open HACS in Home Assistant
2. Click on "Frontend" section
3. Click the "+ Explore & Download Repositories" button
4. Search for "PrintWatch Card"
5. Click "Download"
6. Restart Home Assistant

### Manual Installation

1. Navigate to HACS
2. Tap 3 buttons in top right and select custom repositories
3. Paste `https://github.com/drkpxl/printwatch-card` and select `dashboard`
4. Save
5. Select printwatch-card in HACS listing and click download
6. Navigate to settings and install card if needed there.
7. Restart Home Assistant
8. Clear Browser cache if using previous version

## Configuration

Add the card to your dashboard with the configuration for your printer integration:

### Bambu Lab Configuration (ha-bambulab)

```yaml
type: custom:printwatch-card
printer_name: P1S
camera_refresh_rate: 1000  # Refresh rate in milliseconds (1 second)
camera_rotation: 0  # Rotate camera feed (0, 90, 180, or 270 degrees)
print_status_entity: sensor.p1s_print_status
current_stage_entity: sensor.p1s_current_stage
task_name_entity: sensor.p1s_task_name
progress_entity: sensor.p1s_print_progress
current_layer_entity: sensor.p1s_current_layer
total_layers_entity: sensor.p1s_total_layer_count
remaining_time_entity: sensor.p1s_remaining_time
bed_temp_entity: sensor.p1s_bed_temperature
nozzle_temp_entity: sensor.p1s_nozzle_temperature
bed_target_temp_entity: number.p1s_bed_target_temperature
nozzle_target_temp_entity: number.p1s_nozzle_target_temperature
speed_profile_entity: select.p1s_printing_speed
ams_slot1_entity: sensor.p1s_ams_tray_1
ams_slot2_entity: sensor.p1s_ams_tray_2
ams_slot3_entity: sensor.p1s_ams_tray_3
ams_slot4_entity: sensor.p1s_ams_tray_4
camera_entity: image.p1s_camera
cover_image_entity: image.p1s_cover_image
pause_button_entity: button.p1s_pause_printing
resume_button_entity: button.p1s_resume_printing
stop_button_entity: button.p1s_stop_printing
chamber_light_entity: light.p1s_chamber_light
aux_fan_entity: fan.p1s_aux_fan
print_weight_entity: sensor.p1s_print_weight
print_length_entity: sensor.p1s_print_length
```

### Moonraker/Klipper Configuration (moonraker-home-assistant)

Replace `<printer>` with your printer's name as configured in the Moonraker integration (e.g., `voron`, `ender3`).

```yaml
type: custom:printwatch-card
printer_name: Voron
camera_refresh_rate: 1000  # Refresh rate in milliseconds (1 second)
camera_rotation: 0  # Rotate camera feed (0, 90, 180, or 270 degrees)
print_status_entity: sensor.<printer>_current_print_state
task_name_entity: sensor.<printer>_filename
progress_entity: sensor.<printer>_progress
current_layer_entity: sensor.<printer>_current_layer
total_layers_entity: sensor.<printer>_total_layer
remaining_time_entity: sensor.<printer>_print_time_left
bed_temp_entity: sensor.<printer>_bed_temperature
nozzle_temp_entity: sensor.<printer>_extruder_temperature
bed_target_temp_entity: number.<printer>_bed_target
nozzle_target_temp_entity: number.<printer>_extruder_target
camera_entity: camera.<printer>_webcam
cover_image_entity: camera.<printer>_thumbnail
pause_button_entity: button.<printer>_pause_print
resume_button_entity: button.<printer>_resume_print
stop_button_entity: button.<printer>_cancel_print
# Optional: Printer power control
# printer_switch_entity: switch.<printer>_printer
# Optional: Speed and fan control (number entities)
# speed_factor_entity: number.<printer>_speed_factor
# fan_speed_entity: number.<printer>_fan_speed
# Optional: Sensors
# runout_sensor_entity: binary_sensor.<printer>_runoutsensor
# update_available_entity: binary_sensor.<printer>_update_available
# Optional: LED light control (if configured in Klipper)
# chamber_light_entity: light.<printer>_neopixel_strip
```

**Note:** Entity names may vary depending on your Moonraker/Klipper configuration. Use Home Assistant's Developer Tools to find the correct entity names for your setup.

**Moonraker-specific notes:**
- AMS slots are not available (Bambu Lab specific feature)
- Speed profile (select entity) is Bambu Lab specific; use `speed_factor_entity` for Moonraker/Klipper
- Printer power switch allows turning the printer on/off
- Filament runout sensor shows a warning indicator when triggered
- Update available indicator shows when firmware updates are available


## Troubleshooting

### Common Issues

1. **Card not appearing**
   - Check that all required entities exist and are correctly named
   - Verify resources are properly loaded in HA

2. **Camera feed not updating**
   - Ensure camera entity is properly configured
   - Check that image updates are enabled in HA
   - You must toggle on "use image sensor camera" in the ha-bambulab plugin

![Image Screenshot](assets/image-toggle.png)

3. **Controls not working**
   - Verify that your user has proper permissions for the entities
   - Check that button entities are available and not in an error state

4. **G-Code preview not appearing**
   - For Bambu Lab: Ensure you have the latest version of the HA Bambu Lab plugin and enable G-Code preview in the plugin settings
   - For Moonraker: Make sure your slicer is configured to generate thumbnails and they are properly served by Moonraker

5. **Localization issues**
   - Some translations are AI-generated; if you notice errors, consider submitting improvements!

6. **Moonraker: Printer always shows offline**
   - The card doesn't require an `online_entity` for Moonraker. If your print status entity exists and has a valid state, the printer is considered online.
   - Check that your `print_status_entity` is correctly configured and returning valid states like "standby", "printing", "paused", etc.


## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

If you're having issues, please:
1. Check the Troubleshooting section above
2. Search existing [GitHub issues](https://github.com/yourusername/printwatch-card/issues)
3. Create a new issue if your problem isn't already reported

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Greg Hesp](https://github.com/greghesp/ha-bambulab), creator of [ha-bambulab](https://github.com/greghesp/ha-bambulab) - Bambu Lab integration
- [Marco-Olivier Arsenault](https://github.com/marcolivierarsenault/moonraker-home-assistant), creator of [moonraker-home-assistant](https://github.com/marcolivierarsenault/moonraker-home-assistant) - Moonraker/Klipper integration
- Thanks to all 3D printer enthusiasts who provided feedback and testing
- Inspired by the great Home Assistant community

---

If you find this useful I am addicted to good coffee.

<a href="https://www.buymeacoffee.com/drkpxl" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 160px !important;" ></a>
