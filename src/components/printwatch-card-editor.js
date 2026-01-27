// src/components/printwatch-card-editor.js
import { LitElement, html, css } from 'lit';
import { DEFAULT_CONFIG } from '../constants/config';

/**
 * Visual editor for PrintWatch Card configuration
 * This allows users to configure the card using a form UI instead of YAML
 */
class PrintWatchCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object, state: true }
    };
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-row label {
        font-weight: 500;
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .section-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
        margin-top: 16px;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      .section-title:first-child {
        margin-top: 0;
      }
      ha-textfield {
        width: 100%;
      }
      ha-selector {
        width: 100%;
      }
    `;
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const configKey = target.configKey;
    const value = target.value;

    if (this._config[configKey] === value) {
      return;
    }

    const newConfig = { ...this._config };
    if (value === '' || value === undefined) {
      delete newConfig[configKey];
    } else {
      newConfig[configKey] = value;
    }

    // Fire config-changed event to notify Home Assistant
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _numberValueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const configKey = target.configKey;
    const value = parseInt(target.value, 10);

    if (this._config[configKey] === value) {
      return;
    }

    const newConfig = { ...this._config };
    if (isNaN(value)) {
      delete newConfig[configKey];
    } else {
      newConfig[configKey] = value;
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _renderEntityPicker(configKey, label, domain = null) {
    const selector = domain 
      ? { entity: { domain } }
      : { entity: {} };
    
    return html`
      <div class="form-row">
        <ha-selector
          .hass=${this.hass}
          .label=${label}
          .selector=${selector}
          .value=${this._config[configKey] || ''}
          .configKey=${configKey}
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>
    `;
  }

  _renderTextField(configKey, label, placeholder = '') {
    return html`
      <div class="form-row">
        <ha-textfield
          .label=${label}
          .value=${this._config[configKey] || ''}
          .placeholder=${placeholder}
          .configKey=${configKey}
          @input=${this._valueChanged}
        ></ha-textfield>
      </div>
    `;
  }

  _renderNumberField(configKey, label, min = 0, max = 10000, step = 1) {
    return html`
      <div class="form-row">
        <ha-textfield
          type="number"
          .label=${label}
          .value=${this._config[configKey] || ''}
          .min=${min}
          .max=${max}
          .step=${step}
          .configKey=${configKey}
          @input=${this._numberValueChanged}
        ></ha-textfield>
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="form">
        <!-- General Settings -->
        <div class="section-title">General</div>
        ${this._renderTextField('printer_name', 'Printer Name', 'My 3D Printer')}
        ${this._renderNumberField('camera_refresh_rate', 'Camera Refresh Rate (ms)', 100, 30000, 100)}
        
        <!-- Status Entities -->
        <div class="section-title">Status Entities</div>
        ${this._renderEntityPicker('print_status_entity', 'Print Status', 'sensor')}
        ${this._renderEntityPicker('current_stage_entity', 'Current Stage (optional)', 'sensor')}
        ${this._renderEntityPicker('task_name_entity', 'Task/Filename', 'sensor')}
        ${this._renderEntityPicker('progress_entity', 'Progress', 'sensor')}
        ${this._renderEntityPicker('current_layer_entity', 'Current Layer', 'sensor')}
        ${this._renderEntityPicker('total_layers_entity', 'Total Layers', 'sensor')}
        ${this._renderEntityPicker('remaining_time_entity', 'Remaining Time', 'sensor')}

        <!-- Temperature Entities -->
        <div class="section-title">Temperature Entities</div>
        ${this._renderEntityPicker('bed_temp_entity', 'Bed Temperature', 'sensor')}
        ${this._renderEntityPicker('nozzle_temp_entity', 'Nozzle Temperature', 'sensor')}
        ${this._renderEntityPicker('bed_target_temp_entity', 'Bed Target Temperature', 'sensor')}
        ${this._renderEntityPicker('nozzle_target_temp_entity', 'Nozzle Target Temperature', 'sensor')}

        <!-- Camera/Image Entities -->
        <div class="section-title">Camera & Images</div>
        ${this._renderEntityPicker('camera_entity', 'Camera', 'camera')}
        ${this._renderEntityPicker('cover_image_entity', 'Cover/Thumbnail Image', 'camera')}

        <!-- Control Button Entities -->
        <div class="section-title">Control Buttons</div>
        ${this._renderEntityPicker('pause_button_entity', 'Pause Button', 'button')}
        ${this._renderEntityPicker('resume_button_entity', 'Resume Button', 'button')}
        ${this._renderEntityPicker('stop_button_entity', 'Stop/Cancel Button', 'button')}

        <!-- Optional Entities -->
        <div class="section-title">Optional (Bambu Lab / Advanced)</div>
        ${this._renderEntityPicker('online_entity', 'Online Status', 'binary_sensor')}
        ${this._renderEntityPicker('speed_profile_entity', 'Speed Profile', 'sensor')}
        ${this._renderEntityPicker('chamber_light_entity', 'Chamber Light', 'light')}
        ${this._renderEntityPicker('aux_fan_entity', 'Aux Fan', 'fan')}
        ${this._renderEntityPicker('print_weight_entity', 'Print Weight', 'sensor')}
        ${this._renderEntityPicker('print_length_entity', 'Print Length', 'sensor')}

        <!-- AMS Slots (Bambu Lab specific) -->
        <div class="section-title">AMS Slots (Bambu Lab)</div>
        ${this._renderEntityPicker('active_tray_index_entity', 'Active Tray Index', 'sensor')}
        ${this._renderEntityPicker('external_spool_entity', 'External Spool', 'sensor')}
        ${this._renderEntityPicker('ams_slot1_entity', 'AMS Slot 1', 'sensor')}
        ${this._renderEntityPicker('ams_slot2_entity', 'AMS Slot 2', 'sensor')}
        ${this._renderEntityPicker('ams_slot3_entity', 'AMS Slot 3', 'sensor')}
        ${this._renderEntityPicker('ams_slot4_entity', 'AMS Slot 4', 'sensor')}
        ${this._renderEntityPicker('ams_slot5_entity', 'AMS Slot 5', 'sensor')}
        ${this._renderEntityPicker('ams_slot6_entity', 'AMS Slot 6', 'sensor')}
        ${this._renderEntityPicker('ams_slot7_entity', 'AMS Slot 7', 'sensor')}
        ${this._renderEntityPicker('ams_slot8_entity', 'AMS Slot 8', 'sensor')}
        ${this._renderEntityPicker('ams_slot9_entity', 'AMS Slot 9', 'sensor')}
        ${this._renderEntityPicker('ams_slot10_entity', 'AMS Slot 10', 'sensor')}
        ${this._renderEntityPicker('ams_slot11_entity', 'AMS Slot 11', 'sensor')}
        ${this._renderEntityPicker('ams_slot12_entity', 'AMS Slot 12', 'sensor')}
        ${this._renderEntityPicker('ams_slot13_entity', 'AMS Slot 13', 'sensor')}
        ${this._renderEntityPicker('ams_slot14_entity', 'AMS Slot 14', 'sensor')}
        ${this._renderEntityPicker('ams_slot15_entity', 'AMS Slot 15', 'sensor')}
        ${this._renderEntityPicker('ams_slot16_entity', 'AMS Slot 16', 'sensor')}
      </div>
    `;
  }
}

customElements.define('printwatch-card-editor', PrintWatchCardEditor);

export default PrintWatchCardEditor;
