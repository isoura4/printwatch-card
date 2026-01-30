/**
 * Format remaining time duration into human readable format
 * @param {number} value - Duration value
 * @param {string} unit - Unit of measurement ('s', 'min', 'h', 'd', or undefined for minutes)
 * @param {object} options - Formatting options
 * @returns {string} Formatted duration string
 */
export const formatDuration = (value, unit = 'min', options = {}) => {
  const {
    showComplete = true,
    completeText = 'Complete'
  } = options;

  if (!value || value <= 0) {
    return showComplete ? completeText : '0m';
  }

  // Convert everything to seconds first
  let totalSeconds;
  switch (unit) {
    case 's':
    case 'sec':
    case 'seconds':
      totalSeconds = value;
      break;
    case 'min':
    case 'minutes':
      totalSeconds = value * 60;
      break;
    case 'h':
    case 'hours':
      totalSeconds = value * 3600;
      break;
    case 'd':
    case 'days':
      totalSeconds = value * 86400;
      break;
    default:
      // Default to minutes for backward compatibility
      totalSeconds = value * 60;
  }

  // Calculate days, hours, minutes, seconds
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  // Build the formatted string
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 && days === 0 && hours === 0) parts.push(`${secs}s`);

  // If no parts, return 0m or complete
  if (parts.length === 0) {
    return showComplete ? completeText : '0m';
  }

  return parts.join(' ');
};

/**
 * Calculate and format the end time based on remaining time
 * @param {number} remainingValue - Remaining time value
 * @param {string} unit - Unit of measurement ('s', 'min', 'h', 'd', or undefined for minutes)
 * @param {object} hass - Home Assistant instance
 * @returns {string} Formatted end time
 */
export const formatEndTime = (remainingValue, unit = 'min', hass) => {
  if (!remainingValue || remainingValue <= 0 || !hass) {
    return '---';
  }

  // Convert to milliseconds based on unit
  let remainingMs;
  switch (unit) {
    case 's':
    case 'sec':
    case 'seconds':
      remainingMs = remainingValue * 1000;
      break;
    case 'min':
    case 'minutes':
      remainingMs = remainingValue * 60000;
      break;
    case 'h':
    case 'hours':
      remainingMs = remainingValue * 3600000;
      break;
    case 'd':
    case 'days':
      remainingMs = remainingValue * 86400000;
      break;
    default:
      // Default to minutes for backward compatibility
      remainingMs = remainingValue * 60000;
  }

  try {
    const endTime = new Date(Date.now() + remainingMs);
    const timeFormat = {
      hour: hass.locale.hour_24 ? '2-digit' : 'numeric',
      minute: '2-digit',
      hour12: !hass.locale.hour_24
    };

    return new Intl.DateTimeFormat(hass.locale.language, timeFormat)
      .format(endTime)
      .toLowerCase()
      .replace(/\s/g, '');
  } catch (error) {
    console.warn('Error formatting end time:', error);
    return '---';
  }
};

/**
 * Format a temperature value with unit
 * @param {number|string} value - Temperature value
 * @param {string} unit - Temperature unit
 * @returns {string} Formatted temperature
 */
export const formatTemperature = (value, unit) => {
  const temp = parseFloat(value);
  if (isNaN(temp)) return '---';
  return `${temp.toFixed(0)}${unit}`;
};