import { html } from 'lit';
import { localize } from '../../utils/localize';
import { formatDuration } from '../../utils/formatters';

export const headerTemplate = (entities, controls) => {
  // Check if chamber light entity is configured and exists
  const hasLight = entities.chamber_light_entity && controls.lightState !== undefined;
  // Check if printer switch entity is configured
  const hasPrinterSwitch = entities.printer_switch_entity;
  // Check if update available entity is configured and has update
  const hasUpdate = entities.update_available_entity && entities.updateAvailableState === 'on';
  
  return html`
  <div class="header">
    <div>
      <div class="printer-name">
        ${entities.name}
        ${hasUpdate ? html`
          <ha-icon 
            icon="mdi:update" 
            class="update-indicator"
            title="${localize.t('indicators.update_available')}"
          ></ha-icon>
        ` : ''}
      </div>
      <div class="status">
        ${localize.localize(`entity.sensor.state.${entities.status}`)}
        ${entities.isPrinting ? html`
          <span class="progress-text">
            ${Math.round(entities.progress)}% | 
            ${localize.t('print.layer')}: ${entities.currentLayer}/${entities.totalLayers}
          </span>
        ` : ''}
        ${entities.runout_sensor_entity && entities.runoutSensorState === 'on' ? html`
          <span class="runout-warning" title="${localize.t('indicators.runout_detected')}">
            <ha-icon icon="mdi:alert"></ha-icon>
          </span>
        ` : ''}
      </div>
      ${entities.isPrinting ? html`
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${entities.progress}%"></div>
        </div>
        <div class="layer-info">
          ${localize.t('time.left')}: ${formatDuration(entities.remainingTime)}
        </div>
      ` : ''}
    </div>
    <div class="header-controls">
      ${hasPrinterSwitch ? html`
        <button 
          class="icon-button ${controls.printerSwitchState === 'on' ? 'active' : ''}" 
          @click=${controls.onPrinterSwitchToggle}
          title="${localize.t('controls.printer_power')}"
        >
          <ha-icon icon="mdi:power"></ha-icon>
        </button>
      ` : ''}
      ${hasLight ? html`
        <button 
          class="icon-button ${controls.lightState === 'on' ? 'active' : ''}" 
          @click=${controls.onLightToggle}
        >
          <ha-icon icon="mdi:lightbulb"></ha-icon>
        </button>
      ` : ''}
      ${entities.aux_fan_entity ? html`
        <button 
          class="icon-button ${controls.fanState === 'on' ? 'active' : ''}"
          @click=${controls.onFanToggle}
        >
          <ha-icon icon="mdi:fan"></ha-icon>
        </button>
      ` : ''}
    </div>
  </div>
`;
};