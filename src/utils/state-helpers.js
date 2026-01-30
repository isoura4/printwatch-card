// Bambu Lab specific states
const PRINTING_STATES = ['printing', 'running', 'pause'];
const NON_PRINTING_STATES = ['idle', 'offline', 'unknown'];
const PRINTING_PROCESS_STATES = [
  'heatbed_preheating',
  'heating_hotend',
  'checking_extruder_temperature',
  'auto_bed_leveling',
  'scanning_bed_surface',
  'inspecting_first_layer',
  'calibrating_extrusion',
  'calibrating_extrusion_flow'
];

// Moonraker specific states
const MOONRAKER_PRINTING_STATES = ['printing'];
const MOONRAKER_PAUSED_STATES = ['paused'];
const MOONRAKER_IDLE_STATES = ['standby', 'complete', 'cancelled', 'error'];

// Combined states for all integrations
const ALL_PRINTING_STATES = [...PRINTING_STATES, ...MOONRAKER_PRINTING_STATES, ...MOONRAKER_PAUSED_STATES];
const ALL_IDLE_STATES = [...NON_PRINTING_STATES, ...MOONRAKER_IDLE_STATES];

export const isPrinting = (hass, config) => {
  const currentStage = hass.states[config.current_stage_entity]?.state;
  const printStatus = hass.states[config.print_status_entity]?.state;
  
  // Early return if no valid states
  if (!printStatus && !currentStage) return false;
  
  // Check print status first (works for both Bambu Lab and Moonraker)
  if (ALL_PRINTING_STATES.includes(printStatus)) return true;
  if (ALL_IDLE_STATES.includes(printStatus)) return false;
  
  // Bambu Lab specific: Check current stage if available
  if (currentStage) {
    if (NON_PRINTING_STATES.includes(currentStage)) return false;
    if (currentStage === 'printing' || currentStage.startsWith('paused_')) return true;
    if (PRINTING_PROCESS_STATES.includes(currentStage)) return true;
  }
  
  return false;
};

export const isPaused = (hass, config) => {
  const printStatus = hass.states[config.print_status_entity]?.state;
  // Bambu Lab uses 'pause', Moonraker uses 'paused'
  return printStatus === 'pause' || printStatus === 'paused';
};

export const getAmsSlots = (hass, config) => {
  // First, check for explicit external spool configuration
  const externalSpoolEntity = config.external_spool_entity;
  
  // Check if any AMS slot entities are defined and not null
  const amsSlotEntities = [
    config.ams_slot1_entity,
    config.ams_slot2_entity,
    config.ams_slot3_entity,
    config.ams_slot4_entity,
    config.ams_slot5_entity,
    config.ams_slot6_entity,
    config.ams_slot7_entity,
    config.ams_slot8_entity,
    config.ams_slot9_entity,
    config.ams_slot10_entity,
    config.ams_slot11_entity,
    config.ams_slot12_entity,
    config.ams_slot13_entity,
    config.ams_slot14_entity,
    config.ams_slot15_entity,
    config.ams_slot16_entity
  ].filter(entity => entity != null && entity.trim() !== '');

  // If external spool is defined and has a valid state, use it
  if (externalSpoolEntity) {
    const externalSpool = hass.states[externalSpoolEntity];
    if (externalSpool?.state && externalSpool.state !== 'unknown') {
      return [{
        type: externalSpool.state || 'External Spool',
        color: externalSpool.attributes?.color || '#E0E0E0',
        empty: false,
        name: externalSpool.attributes?.name || 'External Spool',
        active: true
      }];
    }
  }

  // If no AMS slot entities are defined, return empty array
  if (amsSlotEntities.length === 0) {
    return [];
  }

  // Process AMS slots if they exist
  const processedSlots = amsSlotEntities
    .map(entity => {
      const state = hass.states[entity];
      if (!state) return null;
      
      return {
        type: state.state || 'Empty',
        color: state.attributes?.color || '#E0E0E0',
        empty: state.attributes?.empty || false,
        active: state.attributes?.active || false,
        name: state.attributes?.name || 'Unknown'
      };
    })
    .filter(Boolean);

  return processedSlots.length > 0 ? processedSlots : [];
};

const getLastPrintName = (hass, config) => {
  const printStatus = hass.states[config.print_status_entity]?.state;
  const taskName = hass.states[config.task_name_entity]?.state;
  
  // Bambu Lab uses 'idle', 'finish'; Moonraker uses 'standby', 'complete'
  const idleStates = ['idle', 'finish', 'standby', 'complete'];
  
  return idleStates.includes(printStatus) && 
         taskName && 
         !['unavailable', 'unknown', ''].includes(taskName) 
    ? taskName 
    : null;
};

export const getEntityStates = (hass, config) => {
  const getState = (entity, defaultValue = '0') => 
    hass.states[entity]?.state || defaultValue;
  
  // Helper function for parsing numeric values, returns undefined for invalid inputs
  const parseNumericValue = (entity, parser = parseInt) => {
    if (!entity) return undefined;
    const value = parser(getState(entity));
    return isNaN(value) ? undefined : value;
  };

  // Helper function to get unit of measurement from entity
  const getUnitOfMeasurement = (entity) => {
    if (!entity) return undefined;
    return hass.states[entity]?.attributes?.unit_of_measurement;
  };

  return {
    name: config.printer_name || 'Unnamed Printer',
    status: getState(config.print_status_entity, 'idle'),
    currentStage: getState(config.current_stage_entity, 'unknown'),
    taskName: getState(config.task_name_entity, 'No active print'),
    progress: parseNumericValue(config.progress_entity, parseFloat) || 0,
    currentLayer: parseNumericValue(config.current_layer_entity) || 0,
    totalLayers: parseNumericValue(config.total_layers_entity) || 0,
    remainingTime: parseNumericValue(config.remaining_time_entity) || 0,
    remainingTimeUnit: getUnitOfMeasurement(config.remaining_time_entity) || 'min',
    bedTemp: parseNumericValue(config.bed_temp_entity, parseFloat) || 0,
    nozzleTemp: parseNumericValue(config.nozzle_temp_entity, parseFloat) || 0,
    speedProfile: getState(config.speed_profile_entity, 'standard'),
    isPrinting: isPrinting(hass, config),
    isPaused: isPaused(hass, config),
    lastPrintName: getLastPrintName(hass, config),
    // Pass through the entity IDs needed for service calls
    bed_temp_entity: config.bed_temp_entity,
    nozzle_temp_entity: config.nozzle_temp_entity,
    bed_target_temp_entity: config.bed_target_temp_entity,
    nozzle_target_temp_entity: config.nozzle_target_temp_entity,
    speed_profile_entity: config.speed_profile_entity,
    chamber_light_entity: config.chamber_light_entity,
    aux_fan_entity: config.aux_fan_entity && hass.states[config.aux_fan_entity] ? config.aux_fan_entity : null,
    camera_entity: config.camera_entity,
    cover_image_entity: config.cover_image_entity,
    // Print weight/length - pass through entity IDs and values
    print_weight_entity_id: config.print_weight_entity,
    print_length_entity_id: config.print_length_entity,
    print_weight_entity: parseNumericValue(config.print_weight_entity),
    print_length_entity: parseNumericValue(config.print_length_entity),
    // Printer power switch (Moonraker/Klipper)
    printer_switch_entity: config.printer_switch_entity && hass.states[config.printer_switch_entity] ? config.printer_switch_entity : null,
    printerSwitchState: config.printer_switch_entity ? hass.states[config.printer_switch_entity]?.state : null,
    // Speed/Fan controls (Moonraker/Klipper - number entities)
    speed_factor_entity: config.speed_factor_entity && hass.states[config.speed_factor_entity] ? config.speed_factor_entity : null,
    speedFactor: parseNumericValue(config.speed_factor_entity, parseFloat),
    fan_speed_entity: config.fan_speed_entity && hass.states[config.fan_speed_entity] ? config.fan_speed_entity : null,
    fanSpeed: parseNumericValue(config.fan_speed_entity, parseFloat),
    // Sensor entities (Moonraker/Klipper)
    runout_sensor_entity: config.runout_sensor_entity && hass.states[config.runout_sensor_entity] ? config.runout_sensor_entity : null,
    runoutSensorState: config.runout_sensor_entity ? hass.states[config.runout_sensor_entity]?.state : null,
    update_available_entity: config.update_available_entity && hass.states[config.update_available_entity] ? config.update_available_entity : null,
    updateAvailableState: config.update_available_entity ? hass.states[config.update_available_entity]?.state : null
  };
};