// src/templates/components/print-status.js
import { html } from 'lit';
import { localize } from '../../utils/localize';

export const printStatusTemplate = (entities, config) => {
  if (!entities || !config || !config.hass) return html``;

  if (!entities.isPrinting) {
    return html`
      <div class="not-printing">
        <div class="message">${localize.t('not_printing')}</div>
        ${entities.lastPrintName ? html`
          <div class="last-print">
            ${localize.t('last_print', { name: entities.lastPrintName })}
          </div>
        ` : ''}
      </div>
    `;
  }

  const hasCoverImage = entities.cover_image_entity && 
    config.hass.states[entities.cover_image_entity]?.attributes?.entity_picture;

  // Check if print length/weight entities are configured and have valid values
  const hasPrintLength = entities.print_length_entity_id && 
    entities.print_length_entity !== undefined && 
    !isNaN(entities.print_length_entity);
  const hasPrintWeight = entities.print_weight_entity_id && 
    entities.print_weight_entity !== undefined && 
    !isNaN(entities.print_weight_entity);

  return html`
    <div class="print-status">
      <div class="print-preview">
        ${hasCoverImage ? html`
          <div class="preview-image">
            <img 
              src="${config.hass.states[entities.cover_image_entity].attributes.entity_picture}" 
              alt="Print Preview"
              @error=${config.onImageError}
            />
          </div>
        ` : ''}
        <div class="print-details">
          <h3>${entities.taskName}</h3>
          <div class="print-stats">
            ${hasPrintLength ? html`
              ${localize.t('print.length')}: ${entities.print_length_entity} 
              ${config.hass.states[entities.print_length_entity_id]?.attributes?.unit_of_measurement || ''}${hasPrintWeight ? ' | ' : ''}
            ` : ''}
            ${hasPrintWeight ? html`
              ${localize.t('print.weight')}: ${entities.print_weight_entity} 
              ${config.hass.states[entities.print_weight_entity_id]?.attributes?.unit_of_measurement || ''}
            ` : ''}
          </div>

          <div class="controls">
            <button 
              class="btn btn-pause" 
              @click=${config.onPause}
            >
              ${entities.isPaused ? 
                localize.t('controls.resume') : 
                localize.t('controls.pause')}
            </button>
            <button 
              class="btn btn-stop"
              @click=${config.onStop}
            >
              ${localize.t('controls.stop')}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};