import { html } from 'lit';
import { localize } from '../../utils/localize';

export const cameraFeedTemplate = ({ isOnline, hasError, currentStage, entityPicture, cameraEntityId, hass, onError, onLoad, rotation = 0 }) => {
  if (!isOnline || hasError) {
    return html`
      <div class="offline-message">
        <ha-icon icon="mdi:printer-off"></ha-icon>
        <span>
          ${isOnline ? localize.t('camera_unavailable') : localize.t('printer_offline')}
        </span>
      </div>
    `;
  }

  const rotationStyle = rotation ? `transform: rotate(${rotation}deg);` : '';
  
  // Check if entity is a camera (for direct video streaming)
  const stateObj = cameraEntityId && hass ? hass.states[cameraEntityId] : null;
  const isCamera = stateObj && cameraEntityId.startsWith('camera.');

  // Use ha-camera-stream for direct video streaming when entity is a camera
  if (isCamera) {
    return html`
      <div class="camera-feed">
        <div class="camera-label">${currentStage}</div>
        <ha-camera-stream
          .hass=${hass}
          .stateObj=${stateObj}
          .muted=${true}
          style="width: 100%; height: 100%; display: block; border-radius: 12px; ${rotationStyle}"
        ></ha-camera-stream>
      </div>
    `;
  }

  // Fallback to image if camera entity is not available (e.g., for image entities)
  return html`
    <div class="camera-feed">
      <div class="camera-label">${currentStage}</div>
      <img 
        src="${entityPicture}"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; ${rotationStyle}"
        alt="Camera Feed"
        @error=${onError}
        @load=${onLoad}
      />
    </div>
  `;
};