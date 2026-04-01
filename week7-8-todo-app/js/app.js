import { subscribe, getSnapshot, initStore } from './store.js';
import { render, initAddForm } from './ui.js';

initAddForm();

subscribe(render);

initStore().then(() => {
  render(getSnapshot());
});