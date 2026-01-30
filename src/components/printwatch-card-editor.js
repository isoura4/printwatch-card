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
      _config: { type: Object, state: true },
      _expandedSections: { type: Object, state: true },
      _amsSlotCount: { type: Number, state: true }
    };
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px 0;
      }
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .entity-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .entity-row ha-selector {
        flex: 1;
      }
      .remove-button {
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .remove-button:hover {
        color: var(--error-color);
      }
      .form-row label {
        font-weight: 500;
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .section {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        cursor: pointer;
        user-select: none;
      }
      .section-header:hover {
        background: var(--primary-background-color);
      }
      .section-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-title ha-icon {
        --mdc-icon-size: 20px;
        transition: transform 0.2s ease;
      }
      .section-title ha-icon.expanded {
        transform: rotate(90deg);
      }
      .section-content {
        display: none;
        padding: 16px;
        flex-direction: column;
        gap: 12px;
      }
      .section-content.expanded {
        display: flex;
      }
      .add-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        background: transparent;
        color: var(--primary-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      .add-button:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .add-button ha-icon {
        --mdc-icon-size: 20px;
      }
      ha-textfield {
        width: 100%;
      }
      ha-selector {
        width: 100%;
      }
      .optional-badge {
        font-size: 10px;
        padding: 2px 6px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-weight: normal;
        text-transform: uppercase;
      }
      .ams-slots-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ams-slot-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ams-slot-row ha-selector {
        flex: 1;
      }
    `;
  }

  constructor() {
    super();
    this._expandedSections = {
      general: true,
      status: false,
      temperature: false,
      camera: false,
      controls: false,
      optional: false,
      moonraker: false,
      ams: false
    };
    this._amsSlotCount = 4; // Start with 4 slots by default
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    // Count existing AMS slots
    this._amsSlotCount = this._countConfiguredAmsSlots();
  }

  _countConfiguredAmsSlots() {
    let count = 0;
    for (let i = 1; i <= 16; i++) {
      const key = `ams_slot${i}_entity`;
      if (this._config[key] && this._config[key].trim() !== '') {
        count = i;
      }
    }
    // Return at least 4 slots or the highest configured slot
    return Math.max(4, count);
  }

  _toggleSection(section) {
    this._expandedSections = {
      ...this._expandedSections,
      [section]: !this._expandedSections[section]
    };
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const configKey = target.configKey;
    // ha-selector components fire value-changed with ev.detail.value
    // ha-textfield uses ev.target.value via input event
    // Note: DOM input events have ev.detail as null, so we need to check for both null and undefined
    const value = ev.detail?.value !== undefined ? ev.detail.value : target.value;

    if (this._config[configKey] === value) {
      return;
    }

    const newConfig = { ...this._config };
    if (value === '' || value === undefined) {
      delete newConfig[configKey];
    } else {
      newConfig[configKey] = value;
    }

    // Update internal config state to reflect changes in UI
    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _removeEntity(configKey) {
    if (!this._config) {
      return;
    }

    const newConfig = { ...this._config };
    delete newConfig[configKey];

    // Update internal config state to reflect changes in UI
    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _fireConfigChanged(newConfig) {
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

    // Update internal config state to reflect changes in UI
    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _addAmsSlot() {
    if (this._amsSlotCount < 16) {
      this._amsSlotCount = this._amsSlotCount + 1;
    }
  }

  _removeAmsSlot(slotIndex) {
    const configKey = `ams_slot${slotIndex}_entity`;
    const newConfig = { ...this._config };
    delete newConfig[configKey];
    
    // Shift remaining slots down
    for (let i = slotIndex; i < 16; i++) {
      const currentKey = `ams_slot${i + 1}_entity`;
      const targetKey = `ams_slot${i}_entity`;
      if (newConfig[currentKey]) {
        newConfig[targetKey] = newConfig[currentKey];
        delete newConfig[currentKey];
      }
    }
    
    this._amsSlotCount = Math.max(4, this._amsSlotCount - 1);
    // Update internal config state to reflect changes in UI
    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _renderEntityPicker(configKey, label, domain = null, optional = false) {
    // Support both single domain string and array of domains
    let entitySelector;
    if (domain) {
      if (Array.isArray(domain)) {
        entitySelector = { entity: { domain: domain } };
      } else {
        entitySelector = { entity: { domain: domain } };
      }
    } else {
      entitySelector = { entity: {} };
    }
    
    const hasValue = this._config[configKey] && this._config[configKey].trim() !== '';
    
    return html`
      <div class="form-row">
        <div class="entity-row">
          <ha-selector
            .hass=${this.hass}
            .label=${label}${optional ? ' (optional)' : ''}
            .selector=${entitySelector}
            .value=${this._config[configKey] || ''}
            .configKey=${configKey}
            @value-changed=${this._valueChanged}
          ></ha-selector>
          ${hasValue ? html`
            <ha-icon-button
              class="remove-button"
              @click=${() => this._removeEntity(configKey)}
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
            >
            </ha-icon-button>
          ` : ''}
        </div>
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

  _renderSelectField(configKey, label, options) {
    return html`
      <div class="form-row">
        <ha-selector
          .hass=${this.hass}
          .label=${label}
          .selector=${{ select: { options: options, mode: 'dropdown' } }}
          .value=${this._config[configKey] !== undefined ? String(this._config[configKey]) : options[0].value}
          .configKey=${configKey}
          @value-changed=${this._selectValueChanged}
        ></ha-selector>
      </div>
    `;
  }

  _selectValueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const configKey = target.configKey;
    const value = ev.detail?.value;

    // Convert to number if the value is numeric
    const numValue = parseInt(value, 10);
    const finalValue = isNaN(numValue) ? value : numValue;

    if (this._config[configKey] === finalValue) {
      return;
    }

    const newConfig = { ...this._config };
    newConfig[configKey] = finalValue;

    this._config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _renderSection(id, title, content, badge = null) {
    const isExpanded = this._expandedSections[id];
    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection(id)}>
          <div class="section-title">
            <ha-icon 
              icon="mdi:chevron-right"
              class=${isExpanded ? 'expanded' : ''}
            ></ha-icon>
            ${title}
            ${badge ? html`<span class="optional-badge">${badge}</span>` : ''}
          </div>
        </div>
        <div class="section-content ${isExpanded ? 'expanded' : ''}">
          ${content}
        </div>
      </div>
    `;
  }

  _renderAmsSlots() {
    const slots = [];
    for (let i = 1; i <= this._amsSlotCount; i++) {
      const configKey = `ams_slot${i}_entity`;
      const hasValue = this._config[configKey] && this._config[configKey].trim() !== '';
      
      slots.push(html`
        <div class="ams-slot-row">
          <ha-selector
            .hass=${this.hass}
            .label=${'AMS Slot ' + i}
            .selector=${{ entity: { domain: 'sensor' } }}
            .value=${this._config[configKey] || ''}
            .configKey=${configKey}
            @value-changed=${this._valueChanged}
          ></ha-selector>
          <ha-icon-button
            class="remove-button"
            @click=${() => this._removeAmsSlot(i)}
            .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
          >
          </ha-icon-button>
        </div>
      `);
    }
    
    return html`
      <div class="ams-slots-container">
        ${this._renderEntityPicker('active_tray_index_entity', 'Active Tray Index', 'sensor', true)}
        ${this._renderEntityPicker('external_spool_entity', 'External Spool', 'sensor', true)}
        ${slots}
        ${this._amsSlotCount < 16 ? html`
          <button class="add-button" @click=${this._addAmsSlot}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add AMS Slot
          </button>
        ` : ''}
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
        ${this._renderSection('general', 'General', html`
          ${this._renderTextField('printer_name', 'Printer Name', 'My 3D Printer')}
        `)}
        
        <!-- Status Entities -->
        ${this._renderSection('status', 'Status Entities', html`
          ${this._renderEntityPicker('print_status_entity', 'Print Status', 'sensor')}
          ${this._renderEntityPicker('current_stage_entity', 'Current Stage', 'sensor', true)}
          ${this._renderEntityPicker('task_name_entity', 'Task/Filename', 'sensor')}
          ${this._renderEntityPicker('progress_entity', 'Progress', 'sensor')}
          ${this._renderEntityPicker('current_layer_entity', 'Current Layer', 'sensor')}
          ${this._renderEntityPicker('total_layers_entity', 'Total Layers', 'sensor')}
          ${this._renderEntityPicker('remaining_time_entity', 'Remaining Time', 'sensor')}
        `)}

        <!-- Temperature Entities -->
        ${this._renderSection('temperature', 'Temperature Entities', html`
          ${this._renderEntityPicker('bed_temp_entity', 'Bed Temperature', 'sensor')}
          ${this._renderEntityPicker('nozzle_temp_entity', 'Nozzle Temperature', 'sensor')}
          ${this._renderEntityPicker('bed_target_temp_entity', 'Bed Target Temperature', ['sensor', 'number'], true)}
          ${this._renderEntityPicker('nozzle_target_temp_entity', 'Nozzle Target Temperature', ['sensor', 'number'], true)}
        `)}

        <!-- Camera/Image Entities -->
        ${this._renderSection('camera', 'Camera & Images', html`
          ${this._renderEntityPicker('camera_entity', 'Camera', ['camera', 'image'])}
          ${this._renderEntityPicker('cover_image_entity', 'Cover/Thumbnail Image', ['camera', 'image'], true)}
          ${this._renderSelectField('camera_rotation', 'Camera Rotation', [
            { value: '0', label: '0°' },
            { value: '90', label: '90°' },
            { value: '180', label: '180°' },
            { value: '270', label: '270°' }
          ])}
        `)}

        <!-- Control Button Entities -->
        ${this._renderSection('controls', 'Control Buttons', html`
          ${this._renderEntityPicker('pause_button_entity', 'Pause Button', 'button')}
          ${this._renderEntityPicker('resume_button_entity', 'Resume Button', 'button')}
          ${this._renderEntityPicker('stop_button_entity', 'Stop/Cancel Button', 'button')}
        `)}

        <!-- Optional Entities -->
        ${this._renderSection('optional', 'Optional (Bambu Lab / Advanced)', html`
          ${this._renderEntityPicker('online_entity', 'Online Status', 'binary_sensor', true)}
          ${this._renderEntityPicker('speed_profile_entity', 'Speed Profile (Bambu Lab)', 'select', true)}
          ${this._renderEntityPicker('chamber_light_entity', 'Chamber Light', 'light', true)}
          ${this._renderEntityPicker('aux_fan_entity', 'Aux Fan', 'fan', true)}
          ${this._renderEntityPicker('print_weight_entity', 'Print Weight', 'sensor', true)}
          ${this._renderEntityPicker('print_length_entity', 'Print Length', 'sensor', true)}
        `, 'Optional')}

        <!-- Moonraker/Klipper Entities -->
        ${this._renderSection('moonraker', 'Moonraker/Klipper Controls', html`
          ${this._renderEntityPicker('printer_switch_entity', 'Printer Power Switch', 'switch', true)}
          ${this._renderEntityPicker('speed_factor_entity', 'Speed Factor', 'number', true)}
          ${this._renderEntityPicker('fan_speed_entity', 'Fan Speed', 'number', true)}
          ${this._renderEntityPicker('runout_sensor_entity', 'Filament Runout Sensor', 'binary_sensor', true)}
          ${this._renderEntityPicker('update_available_entity', 'Firmware Update Available', 'binary_sensor', true)}
        `, 'Optional')}

        <!-- AMS Slots (Bambu Lab specific) -->
        ${this._renderSection('ams', 'AMS Slots (Bambu Lab)', this._renderAmsSlots(), 'Optional')}
      </div>
    `;
  }
}

customElements.define('printwatch-card-editor', PrintWatchCardEditor);

export default PrintWatchCardEditor;
