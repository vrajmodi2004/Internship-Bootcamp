import { persistence } from './persistence.js';
import {
  createTodo, toggleComplete, toggleImportant,
  updateTodo, deleteTodo,
  applyFilter, sortTodos, computeCounts, getAllTags,
} from './utils.js';
import { FILTERS } from './constants.js';


let state = {
  todos:       [],
  filter:      FILTERS.ALL,
  activeTag:   null,
};

let listeners = [];

// Initialize with persisted data
export const initStore = async () => {
  state.todos = await persistence.load();
  notify();
};

export const subscribe   = (fn) => { listeners.push(fn); };
export const unsubscribe = (fn) => { listeners = listeners.filter(l => l !== fn); };

const notify = () => {
  persistence.save(state.todos);
  listeners.forEach(fn => fn(getSnapshot()));
};


export const getSnapshot = () => {
  const { todos, filter, activeTag } = state;
  return {
    todos,
    filter,
    activeTag,
    visibleTodos: sortTodos(applyFilter(todos, filter, activeTag)),
    counts:       computeCounts(todos),
    allTags:      getAllTags(todos),
  };
};


export const actions = {
  addTodo(title, opts = {}) {
    if (!title.trim()) return;
    state = { ...state, todos: [createTodo(title, opts), ...state.todos] };
    notify();
  },

  removeTodo(id) {
    state = { ...state, todos: deleteTodo(state.todos, id) };
    notify();
  },

  toggleTodo(id) {
    state = { ...state, todos: state.todos.map(t => t.id === id ? toggleComplete(t) : t) };
    notify();
  },

  starTodo(id) {
    state = { ...state, todos: state.todos.map(t => t.id === id ? toggleImportant(t) : t) };
    notify();
  },

  editTodo(id, patch) {
    state = { ...state, todos: state.todos.map(t => t.id === id ? updateTodo(t, patch) : t) };
    notify();
  },

  clearCompleted() {
    state = { ...state, todos: state.todos.filter(t => !t.completed) };
    notify();
  },

  setFilter(filter) {
    state = { ...state, filter, activeTag: null };
    notify();
  },

  setActiveTag(tag) {
    state = { ...state, activeTag: state.activeTag === tag ? null : tag, filter: FILTERS.ALL };
    notify();
  },
};