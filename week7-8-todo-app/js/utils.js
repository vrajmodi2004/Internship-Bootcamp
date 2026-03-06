import { PRIORITY_WEIGHT, FILTERS } from './constants.js';


export const generateId = () =>
  `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const toDateString = (date = new Date()) =>
  date.toISOString().split('T')[0];

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  return dateStr === toDateString();
};

export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return dateStr < toDateString();
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};


export const createTodo = (title, opts = {}) => ({
  id:        generateId(),
  createdAt: new Date().toISOString(),
  title:     title.trim(),
  completed: false,
  important: opts.important ?? false,
  dueDate:   opts.dueDate   ?? null,
  tags:      Object.freeze(opts.tags ?? []),
  priority:  opts.priority  ?? 'medium',
  note:      opts.note      ?? '',
});


export const toggleComplete  = (todo) => ({ ...todo, completed: !todo.completed });
export const toggleImportant = (todo) => ({ ...todo, important: !todo.important });
export const updateTodo      = (todo, patch) => ({ ...todo, ...patch });
export const deleteTodo      = (todos, id)   => todos.filter(t => t.id !== id);


export const parseTags = (raw) =>
  raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export const getAllTags = (todos) => {
  const tagSet = new Set();
  todos.forEach(todo => todo.tags.forEach(tag => tagSet.add(tag)));
  return [...tagSet].sort();
};



export const applyFilter = (todos, filter, activeTag) => {
  return todos.filter(todo => {

    if (activeTag && !todo.tags.includes(activeTag)) return false;

    switch (filter) {
      case FILTERS.ACTIVE:    return !todo.completed;
      case FILTERS.COMPLETED: return  todo.completed;
      case FILTERS.TODAY:     return  isToday(todo.dueDate);
      case FILTERS.IMPORTANT: return  todo.important;
      default:                return  true;
    }
  });
};

export const sortTodos = (todos) =>
  [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.important !== b.important) return a.important ? -1 : 1;
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  });


export const computeCounts = (todos) => ({
  all:       todos.length,
  active:    todos.filter(t => !t.completed).length,
  completed: todos.filter(t =>  t.completed).length,
  today:     todos.filter(t => isToday(t.dueDate)).length,
  important: todos.filter(t => t.important).length,
});