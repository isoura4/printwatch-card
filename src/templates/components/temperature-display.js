import { html } from 'lit';
import { localize } from '../../utils/localize';
import { formatTemperature } from '../../utils/formatters';
import { temperatureDialogTemplate } from './temperature-controls';

export const temperatureDisplayTemplate = (entities, hass, dialogConfig = {}, setDialogConfig) => {
  const handleControlClick = (type, currentValue, entityId) => {
    // Don't open dialog if entity is not configured
    if (!entityId) return;
    
    let config = {
      open: true,
      type,
      currentValue,
      entityId,
      onClose: () => setDialogConfig({ open: false })
    };

    switch (type) {
      case 'bed':
        config = {
          ...config,
          title: localize.t('temperatures.bed_target'),
          min: 0,
          max: 120
        };
        break;
      case 'nozzle':
        config = {
          ...config,
          title: localize.t('temperatures.nozzle_target'),
          min: 0,
          max: 320
        };
        break;
      case 'speed':
        config = {
          ...config,
          title: localize.t('temperatures.speed_profile')
        };
        break;
      case 'speed_factor':
        config = {
          ...config,
          title: localize.t('temperatures.speed_factor'),
          min: hass.states[entityId]?.attributes?.min || 0,
          max: hass.states[entityId]?.attributes?.max || 200,
          step: hass.states[entityId]?.attributes?.step || 1,
          unit: hass.states[entityId]?.attributes?.unit_of_measurement || '%'
        };
        break;
      case 'fan_speed':
        config = {
          ...config,
          title: localize.t('temperatures.fan_speed'),
          min: hass.states[entityId]?.attributes?.min || 0,
          max: hass.states[entityId]?.attributes?.max || 100,
          step: hass.states[entityId]?.attributes?.step || 1,
          unit: hass.states[entityId]?.attributes?.unit_of_measurement || '%'
        };
        break;
    }

    setDialogConfig(config);
  };

  // Get temperature units from sensors
  const bedTempUnit = hass.states[entities.bed_temp_entity]?.attributes?.unit_of_measurement || '°C';
  const nozzleTempUnit = hass.states[entities.nozzle_temp_entity]?.attributes?.unit_of_measurement || '°C';

  // Check if speed profile entity is configured and exists (Bambu Lab)
  const hasSpeedProfile = entities.speed_profile_entity && 
    hass.states[entities.speed_profile_entity];

  // Check if speed factor entity is configured and exists (Moonraker/Klipper)
  const hasSpeedFactor = entities.speed_factor_entity && 
    hass.states[entities.speed_factor_entity];

  // Check if fan speed entity is configured and exists (Moonraker/Klipper)
  const hasFanSpeed = entities.fan_speed_entity && 
    hass.states[entities.fan_speed_entity];

  // Get speed factor unit
  const speedFactorUnit = hass.states[entities.speed_factor_entity]?.attributes?.unit_of_measurement || '%';
  // Get fan speed unit
  const fanSpeedUnit = hass.states[entities.fan_speed_entity]?.attributes?.unit_of_measurement || '%';

  return html`
    <div class="temperatures">
      <div 
        class="temp-item" 
        @click=${() => handleControlClick('bed', entities.bedTemp, entities.bed_target_temp_entity)}
      >
        <div class="temp-value">
          ${formatTemperature(entities.bedTemp, bedTempUnit)}
        </div>
        <div>${localize.t('temperatures.bed')}</div>
      </div>

      <div 
        class="temp-item"
        @click=${() => handleControlClick('nozzle', entities.nozzleTemp, entities.nozzle_target_temp_entity)}
      >
        <div class="temp-value">
          ${formatTemperature(entities.nozzleTemp, nozzleTempUnit)}
        </div>
        <div>${localize.t('temperatures.nozzle')}</div>
      </div>

      ${hasSpeedProfile ? html`
        <div 
          class="temp-item"
          @click=${() => handleControlClick('speed', hass.states[entities.speed_profile_entity]?.state || 'standard', entities.speed_profile_entity)}
        >
          <div class="temp-value">
            ${(hass.states[entities.speed_profile_entity]?.state || 'standard').charAt(0).toUpperCase() + 
              (hass.states[entities.speed_profile_entity]?.state || 'standard').slice(1)}
          </div>
          <div>${localize.t('temperatures.speed')}</div>
        </div>
      ` : ''}

      ${hasSpeedFactor ? html`
        <div 
          class="temp-item"
          @click=${() => handleControlClick('speed_factor', entities.speedFactor, entities.speed_factor_entity)}
        >
          <div class="temp-value">
            ${entities.speedFactor !== undefined ? `${Math.round(entities.speedFactor)}${speedFactorUnit}` : '-'}
          </div>
          <div>${localize.t('temperatures.speed_factor')}</div>
        </div>
      ` : ''}

      ${hasFanSpeed ? html`
        <div 
          class="temp-item"
          @click=${() => handleControlClick('fan_speed', entities.fanSpeed, entities.fan_speed_entity)}
        >
          <div class="temp-value">
            ${entities.fanSpeed !== undefined ? `${Math.round(entities.fanSpeed)}${fanSpeedUnit}` : '-'}
          </div>
          <div>${localize.t('temperatures.fan_speed')}</div>
        </div>
      ` : ''}
    </div>

    ${temperatureDialogTemplate(dialogConfig, hass)}
  `;
};