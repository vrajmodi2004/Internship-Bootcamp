
import { persistence } from '../js/persistence.js';
import { STORAGE_KEY } from '../js/constants.js';

let store = {};
global.localStorage = {
  getItem:    (key)        => store[key] ?? null,
  setItem:    (key, val)   => { store[key] = val; },
  removeItem: (key)        => { delete store[key]; },
  clear:      ()           => { store = {}; },
};

let passed = 0, failed = 0;
const results = [];

const test = (desc, fn) => {
  store = {};
  try { fn(); passed++; results.push({ ok: true, desc }); }
  catch (e) { failed++; results.push({ ok: false, desc, error: e.message }); }
};

const assertEqual = (a, b) => {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa !== sb) throw new Error(`Expected ${sb} got ${sa}`);
};
const assert = (v, msg = 'Assertion failed') => { if (!v) throw new Error(msg); };

const mockTodo = {
  id: 'p-1', createdAt: '2024-01-01T00:00:00.000Z', title: 'Persisted task',
  completed: false, important: false, dueDate: null,
  tags: ['test'], priority: 'low', note: '',
};


test('load returns empty array when storage is empty', () => {
  assertEqual(persistence.load(), []);
});

test('load returns saved todos', () => {
  persistence.save([mockTodo]);
  const loaded = persistence.load();
  assertEqual(loaded.length, 1);
  assertEqual(loaded[0].id, 'p-1');
  assertEqual(loaded[0].tags, ['test']);
});

test('load returns empty array on invalid JSON', () => {
  localStorage.setItem(STORAGE_KEY, 'not-json');
  assertEqual(persistence.load(), []);
});

test('load returns empty array if stored value is not an array', () => {
  localStorage.setItem(STORAGE_KEY, '{"not":"array"}');
  assertEqual(persistence.load(), []);
});

test('save persists multiple todos', () => {
  const t2 = { ...mockTodo, id: 'p-2', title: 'Second' };
  persistence.save([mockTodo, t2]);
  assertEqual(persistence.load().length, 2);
});

test('save overwrites previous data', () => {
  persistence.save([mockTodo]);
  persistence.save([]);
  assertEqual(persistence.load(), []);
});

test('clear removes all stored todos', () => {
  persistence.save([mockTodo]);
  persistence.clear();
  assertEqual(persistence.load(), []);
});

test('save and load preserves todo shape', () => {
  persistence.save([mockTodo]);
  const loaded = persistence.load()[0];
  assertEqual(loaded.title,     mockTodo.title);
  assertEqual(loaded.priority,  mockTodo.priority);
  assertEqual(loaded.completed, mockTodo.completed);
  assertEqual(loaded.tags,      mockTodo.tags);
});


console.log('\n══════════════════════════════════════════');
console.log('       Persistence – Test Results         ');
console.log('══════════════════════════════════════════');
results.forEach(r =>
  console.log(`  ${r.ok ? '✅' : '❌'} ${r.desc}${r.error ? `\n     → ${r.error}` : ''}`)
);
console.log('══════════════════════════════════════════');
console.log(`  Total: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}`);
const pct = Math.round((passed / (passed + failed)) * 100);
console.log(`  Pass Rate: ${pct}%${pct >= 70 ? '  ✅' : '  ❌'}`);
console.log('══════════════════════════════════════════\n');

if (failed > 0) process.exit(1);