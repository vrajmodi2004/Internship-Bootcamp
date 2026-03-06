
export const FILTERS = Object.freeze({
  ALL:       'all',
  TODAY:     'today',
  IMPORTANT: 'important',
  ACTIVE:    'active',
  COMPLETED: 'completed',
});

export const PRIORITY = Object.freeze({
  HIGH:   'high',
  MEDIUM: 'medium',
  LOW:    'low',
});

export const PRIORITY_WEIGHT = Object.freeze({
  high:   0,
  medium: 1,
  low:    2,
});

export const STORAGE_KEY = 'taskflow-todos';