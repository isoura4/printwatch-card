// src/components/printwatch-card.js
import { LitElement, html } from 'lit';
import { cardTemplate } from '../templates/card-template';
import { cardStyles } from '../styles/card-styles';
import { formatDuration, formatEndTime } from '../utils/formatters';
import { isPrinting, isPaused, getAmsSlots, getEntityStates } from '../utils/state-helpers';
import { DEFAULT_CONFIG, DEFAULT_CAMERA_REFRESH_RATE } from '../constants/config';
import { localize } from '../utils/localize';

class PrintWatchCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _lastCameraUpdate: { type: Number },
      _cameraUpdateInterval: { type: Number },
      _cameraError: { type: Boolean },
      _dialogConfig: { state: true },
      _confirmDialog: { state: true }
    };
  }

  static get styles() {
    return cardStyles;
  }

  constructor() {
    super();
    this._lastCameraUpdate = 0;
    this._cameraUpdateInterval = DEFAULT_CAMERA_REFRESH_RATE;
    this._cameraError = false;
    this._dialogConfig = { open: false };
    this._confirmDialog = { open: false };
    this.formatters = {
      formatDuration,
      formatEndTime
    };
  }

  setConfig(config) {
    // Use default printer name if not provided or empty
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    if (!finalConfig.printer_name || finalConfig.printer_name.trim() === '') {
      finalConfig.printer_name = DEFAULT_CONFIG.printer_name;
    }
    this.config = finalConfig;
    this._cameraUpdateInterval = config.camera_refresh_rate || DEFAULT_CAMERA_REFRESH_RATE;
  }

  isOnline() {
    // If online_entity is configured, use it as the primary check
    if (this.config.online_entity) {
      const onlineEntity = this.hass?.states[this.config.online_entity];
      return onlineEntity?.state === 'on';
    }
    
    // For setups without online_entity (like Moonraker):
    // 1. Check if camera entity exists and has a valid picture
    const cameraEntity = this.hass?.states[this.config.camera_entity];
    if (cameraEntity?.attributes?.entity_picture && cameraEntity.state !== 'unavailable') {
      return true;
    }
    
    // 2. Check if print status entity exists and is not 'unavailable'
    const printStatusEntity = this.hass?.states[this.config.print_status_entity];
    if (printStatusEntity?.state && printStatusEntity.state !== 'unavailable') {
      return true;
    }
    
    // 3. Assume offline if configured entities don't indicate an online state
    return false;
  }

  shouldUpdateCamera() {
    if (!this.isOnline()) {
      return false;
    }

    const now = Date.now();
    return now - this._lastCameraUpdate > this._cameraUpdateInterval;
  }

  handleImageError() {
    this._cameraError = true;
    this.requestUpdate();
  }

  handleImageLoad() {
    this._cameraError = false;
  }

  _toggleLight() {
    const lightEntity = this.hass.states[this.config.chamber_light_entity];
    if (!lightEntity) return;

    const service = lightEntity.state === 'on' ? 'turn_off' : 'turn_on';
    this.hass.callService('light', service, {
      entity_id: this.config.chamber_light_entity,
    });
  }

  _toggleFan() {
    const fanEntity = this.hass.states[this.config.aux_fan_entity];
    if (!fanEntity) return;

    const service = fanEntity.state === 'on' ? 'turn_off' : 'turn_on';
    this.hass.callService('fan', service, {
      entity_id: this.config.aux_fan_entity,
    });
  }

  _togglePrinterSwitch() {
    const switchEntity = this.hass.states[this.config.printer_switch_entity];
    if (!switchEntity) return;

    const service = switchEntity.state === 'on' ? 'turn_off' : 'turn_on';
    this.hass.callService('switch', service, {
      entity_id: this.config.printer_switch_entity,
    });
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('hass')) {
      if (this.shouldUpdateCamera()) {
        this._updateCameraFeed();
      }
    }
  }

  _updateCameraFeed() {
    if (!this.isOnline()) {
      return;
    }

    this._lastCameraUpdate = Date.now();
    
    const timestamp = new Date().getTime();
    const cameraImg = this.shadowRoot?.querySelector('.camera-feed img');
    if (cameraImg) {
      const cameraEntity = this.hass.states[this.config.camera_entity];
      if (cameraEntity?.attributes?.entity_picture) {
        cameraImg.src = `${cameraEntity.attributes.entity_picture}&t=${timestamp}`;
      }
    }

    const coverImg = this.shadowRoot?.querySelector('.preview-image img');
    if (coverImg) {
      const coverEntity = this.hass.states[this.config.cover_image_entity];
      if (coverEntity?.attributes?.entity_picture) {
        coverImg.src = `${coverEntity.attributes.entity_picture}&t=${timestamp}`;
      }
    }
  }

  handlePauseDialog() {
    this._confirmDialog = {
      open: true,
      type: 'pause',
      title: localize.t('dialogs.pause.title'),
      message: localize.t('dialogs.pause.message'),
      onConfirm: () => {
        const entity = isPaused(this.hass, this.config) 
          ? this.config.resume_button_entity 
          : this.config.pause_button_entity;
        
        this.hass.callService('button', 'press', {
          entity_id: entity
        });
        this._confirmDialog = { open: false };
      },
      onCancel: () => {
        this._confirmDialog = { open: false };
      }
    };
    this.requestUpdate();
  }

  handleStopDialog() {
    this._confirmDialog = {
      open: true,
      type: 'stop',
      title: localize.t('dialogs.stop.title'),
      message: localize.t('dialogs.stop.message'),
      onConfirm: () => {
        this.hass.callService('button', 'press', {
          entity_id: this.config.stop_button_entity
        });
        this._confirmDialog = { open: false };
      },
      onCancel: () => {
        this._confirmDialog = { open: false };
      }
    };
    this.requestUpdate();
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const entities = getEntityStates(this.hass, this.config);
    const amsSlots = getAmsSlots(this.hass, this.config);
    
    const setDialogConfig = (config) => {
      this._dialogConfig = config;
      this.requestUpdate();
    };

    return cardTemplate({
      entities,
      hass: this.hass,
      amsSlots,
      formatters: this.formatters,
      _toggleLight: () => this._toggleLight(),
      _toggleFan: () => this._toggleFan(),
      _togglePrinterSwitch: () => this._togglePrinterSwitch(),
      _cameraError: this._cameraError,
      isOnline: this.isOnline(),
      handleImageError: () => this.handleImageError(),
      handleImageLoad: () => this.handleImageLoad(),
      dialogConfig: this._dialogConfig,
      confirmDialog: this._confirmDialog,
      setDialogConfig,
      handlePauseDialog: () => this.handlePauseDialog(),
      handleStopDialog: () => this.handleStopDialog(),
    });
  }

  // This is used by Home Assistant for card size calculation
  getCardSize() {
    return 6;
  }

  /**
   * Returns the custom element used for editing the card configuration
   * This enables the visual editor in Home Assistant
   */
  static getConfigElement() {
    return document.createElement('printwatch-card-editor');
  }

  /**
   * Returns a stub configuration for the card
   * This is used when the card is first added via the UI
   */
  static getStubConfig() {
    return {
      ...DEFAULT_CONFIG,
      printer_name: 'My 3D Printer',
      camera_refresh_rate: DEFAULT_CAMERA_REFRESH_RATE
    };
  }
}

customElements.define('printwatch-card', PrintWatchCard);

export default PrintWatchCard;