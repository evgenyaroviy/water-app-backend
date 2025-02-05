export const WATER_CONSTANTS = {
  MIN_WATER_AMOUNT: 1,
  MAX_WATER_AMOUNT: 5000,
  DEFAULT_DAILY_NORM: 2000,
  MIN_DAILY_NORM: 1,
  MAX_DAILY_NORM: 15000,
};

export const TIME_FORMATS = {
  MONTH_FORMAT: 'YYYY-MM',
  TIME_FORMAT: 'HH:mm:ss',
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WATER_MESSAGES = {
  INVALID_DAILY_NORM: `Daily norm should be between ${WATER_CONSTANTS.MIN_DAILY_NORM} and ${WATER_CONSTANTS.MAX_DAILY_NORM} milliliters`,
  UPDATE_SUCCESS: 'Daily norm updated successfully',
  USER_NOT_FOUND: 'User not found',
};
