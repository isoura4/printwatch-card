/**
 * Default configuration for the PrintWatch card
 * Entity IDs should be configured by the user based on their integration
 * (Bambu Lab ha-bambulab or Moonraker Home Assistant)
 */
export const DEFAULT_CONFIG = {
  printer_name: 'My 3D Printer',
  // Core entities - should be configured by user
  print_status_entity: '',
  current_stage_entity: '',
  task_name_entity: '',
  progress_entity: '',
  current_layer_entity: '',
  total_layers_entity: '',
  remaining_time_entity: '',
  // Temperature entities
  bed_temp_entity: '',
  nozzle_temp_entity: '',
  bed_target_temp_entity: '',
  nozzle_target_temp_entity: '',
  // Speed profile (Bambu Lab specific)
  speed_profile_entity: '',
  // AMS entities (Bambu Lab specific)
  active_tray_index_entity: '',
  ams_slot1_entity: '',
  ams_slot2_entity: '',
  ams_slot3_entity: '',
  ams_slot4_entity: '',
  // Camera/Image entities
  camera_entity: '',
  cover_image_entity: '',
  // Control button entities
  pause_button_entity: '',
  resume_button_entity: '',
  stop_button_entity: '',
  // Light/Fan entities
  chamber_light_entity: '',
  aux_fan_entity: '',
  // Online status (Bambu Lab specific)
  online_entity: '',
  // Print info entities
  print_weight_entity: '',
  print_length_entity: '',
  // Printer power switch (Moonraker/Klipper)
  printer_switch_entity: '',
  // Speed/Fan controls (Moonraker/Klipper - number entities)
  speed_factor_entity: '',
  fan_speed_entity: '',
  // Sensor entities (Moonraker/Klipper)
  runout_sensor_entity: '',
  update_available_entity: '',
  // Camera rotation (0, 90, 180, 270 degrees)
  camera_rotation: 0
};

/**
 * Default camera update interval in milliseconds
 */
export const DEFAULT_CAMERA_REFRESH_RATE = 1000;