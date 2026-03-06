import { subscribe, getSnapshot } from './store.js';
import { render, initAddForm } from './ui.js';

initAddForm();

subscribe(render);

render(getSnapshot());