/**
 * THE VAULT - Global Configuration Constants
 */

export const OPERATIONAL_CONFIG = {
  LABOR_THRESHOLD_PCT: 30,
  DEFAULT_EVENT_HOUR: 19,
  INTENSITY_MODIFIER: 5, // How much each event level adds to walk-ins
};

export const PREDICTION_MODIFIERS = {
  RAIN_GENERIC: 0.85,
  RAIN_RESERVATIONS: 0.95,
  RAIN_WALKINS: 0.7,
  RAIN_PATIO: 0.2,
};

export const BRAND_THEME = {
  PRIMARY: 'orange-600',
  ACCENT: 'orange-500',
};