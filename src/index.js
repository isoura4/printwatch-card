import PrintWatchCard from './components/printwatch-card';
import PrintWatchCardEditor from './components/printwatch-card-editor';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Ensure global availability of Lit core functions
window.LitElement = LitElement;
window.html = html;
window.css = css;

// Add version and build timestamp to window for debugging
window.PRINTWATCH_VERSION = process.env.VERSION;
window.PRINTWATCH_BUILD_TIME = process.env.BUILD_TIMESTAMP;

// Ensure the elements are registered
if (!customElements.get('printwatch-card')) {
  customElements.define('printwatch-card', PrintWatchCard);
}

if (!customElements.get('printwatch-card-editor')) {
  customElements.define('printwatch-card-editor', PrintWatchCardEditor);
}

// Register card with Home Assistant's card picker
// This makes the card findable when searching for cards in the dashboard
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'printwatch-card',
  name: 'PrintWatch Card',
  description: 'A card for monitoring 3D printers (Bambu Lab, Moonraker/Klipper)',
  preview: true,
  documentationURL: 'https://github.com/isoura4/printwatch-card'
});

// Export for potential reuse
export { 
  PrintWatchCard,
  PrintWatchCardEditor,
  html,
  css,
  LitElement
};