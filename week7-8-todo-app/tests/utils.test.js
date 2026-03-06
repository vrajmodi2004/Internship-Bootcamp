
import {
  generateId, toDateString, isToday, isOverdue, formatDate,
  createTodo, toggleComplete, toggleImportant, updateTodo, deleteTodo,
  parseTags, getAllTags, applyFilter, sortTodos, computeCounts,
} from '../js/utils.js';


let passed = 0, failed = 0;
const results = [];

const test = (description, fn) => {
  try {
    fn();
    passed++;
    results.push({ ok: true, description });
  } catch (err) {
    failed++;
    results.push({ ok: false, description, error: err.message });
  }
};

const assert = (condition, msg = 'Assertion failed') => {
  if (!condition) throw new Error(msg);
};

const assertEqual = (a, b) => {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa !== sb) throw new Error(`Expected ${sb} but got ${sa}`);
};

const assertNotEqual = (a, b) => {
  if (JSON.stringify(a) === JSON.stringify(b))
    throw new Error(`Expected values to differ, but both are ${JSON.stringify(a)}`);
};


const makeTodo = (overrides = {}) => ({
  id: 'test-id',
  createdAt: new Date().toISOString(),
  title: 'Test task',
  completed: false,
  important: false,
  dueDate: null,
  tags: [],
  priority: 'medium',
  note: '',
  ...overrides,
});


test('generateId returns a non-empty string', () => {
  assert(typeof generateId() === 'string');
  assert(generateId().length > 0);
});

test('generateId generates unique IDs', () => {
  const ids = new Set(Array.from({ length: 100 }, generateId));
  assertEqual(ids.size, 100);
});


test('toDateString returns YYYY-MM-DD format', () => {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(toDateString()));
});

test('toDateString formats a specific date', () => {
  assertEqual(toDateString(new Date('2024-06-15')), '2024-06-15');
});


test('isToday returns true for today', () => {
  assert(isToday(toDateString()));
});

test('isToday returns false for null', () => {
  assert(!isToday(null));
});

test('isToday returns false for past date', () => {
  assert(!isToday('2000-01-01'));
});

test('isToday returns false for future date', () => {
  assert(!isToday('2099-12-31'));
});


test('isOverdue returns false for null', () => {
  assert(!isOverdue(null));
});

test('isOverdue returns true for a past date', () => {
  assert(isOverdue('2000-01-01'));
});

test('isOverdue returns false for today', () => {
  assert(!isOverdue(toDateString()));
});

test('isOverdue returns false for future date', () => {
  assert(!isOverdue('2099-01-01'));
});

test('formatDate returns empty string for null', () => {
  assertEqual(formatDate(null), '');
});

test('formatDate returns readable string', () => {
  const result = formatDate('2024-06-15');
  assert(result.includes('Jun'));
  assert(result.includes('15'));
});



test('createTodo trims title whitespace', () => {
  assertEqual(createTodo('  hello  ').title, 'hello');
});

test('createTodo sets correct defaults', () => {
  const t = createTodo('Task');
  assertEqual(t.completed, false);
  assertEqual(t.important, false);
  assertEqual(t.dueDate, null);
  assertEqual(t.priority, 'medium');
  assertEqual(t.note, '');
  assert(Array.isArray(t.tags));
  assertEqual(t.tags.length, 0);
});

test('createTodo accepts option overrides', () => {
  const t = createTodo('Task', {
    priority: 'high', dueDate: '2099-12-31',
    tags: ['work'], important: true, note: 'A note',
  });
  assertEqual(t.priority, 'high');
  assertEqual(t.dueDate, '2099-12-31');
  assertEqual([...t.tags], ['work']);
  assertEqual(t.important, true);
  assertEqual(t.note, 'A note');
});

test('createTodo generates unique IDs', () => {
  assertNotEqual(createTodo('A').id, createTodo('B').id);
});



test('toggleComplete marks incomplete as complete', () => {
  assertEqual(toggleComplete(makeTodo({ completed: false })).completed, true);
});

test('toggleComplete marks complete as incomplete', () => {
  assertEqual(toggleComplete(makeTodo({ completed: true })).completed, false);
});

test('toggleComplete does not mutate original', () => {
  const t = makeTodo({ completed: false });
  toggleComplete(t);
  assertEqual(t.completed, false);
});


test('toggleImportant flips false to true', () => {
  assertEqual(toggleImportant(makeTodo({ important: false })).important, true);
});

test('toggleImportant flips true to false', () => {
  assertEqual(toggleImportant(makeTodo({ important: true })).important, false);
});


test('updateTodo applies partial patch', () => {
  const t = makeTodo({ title: 'Old', note: 'N' });
  const u = updateTodo(t, { title: 'New' });
  assertEqual(u.title, 'New');
  assertEqual(u.note, 'N');
});

test('updateTodo does not mutate original', () => {
  const t = makeTodo({ title: 'Old' });
  updateTodo(t, { title: 'New' });
  assertEqual(t.title, 'Old');
});


test('deleteTodo removes the matching id', () => {
  const todos = [makeTodo({ id: 'a' }), makeTodo({ id: 'b' }), makeTodo({ id: 'c' })];
  const result = deleteTodo(todos, 'b');
  assertEqual(result.length, 2);
  assertEqual(result.map(t => t.id), ['a', 'c']);
});

test('deleteTodo is no-op when id not found', () => {
  assertEqual(deleteTodo([makeTodo({ id: 'a' })], 'z').length, 1);
});

test('deleteTodo does not mutate original array', () => {
  const todos = [makeTodo({ id: 'a' })];
  deleteTodo(todos, 'a');
  assertEqual(todos.length, 1);
});


test('parseTags splits on commas', () => {
  assertEqual(parseTags('work, personal'), ['work', 'personal']);
});

test('parseTags lowercases tags', () => {
  assertEqual(parseTags('Work,PERSONAL'), ['work', 'personal']);
});

test('parseTags filters empty segments', () => {
  assertEqual(parseTags(',,'), []);
});

test('parseTags handles single tag', () => {
  assertEqual(parseTags('home'), ['home']);
});

test('parseTags trims whitespace', () => {
  assertEqual(parseTags('  a , b  '), ['a', 'b']);
});


test('getAllTags collects unique tags (uses Set)', () => {
  const todos = [
    makeTodo({ tags: ['work', 'urgent'] }),
    makeTodo({ tags: ['work', 'home'] }),
  ];
  const tags = getAllTags(todos);
  assert(tags.includes('work'));
  assert(tags.includes('urgent'));
  assert(tags.includes('home'));
  assertEqual(new Set(tags).size, tags.length); // uniqueness
});

test('getAllTags returns sorted array', () => {
  assertEqual(getAllTags([makeTodo({ tags: ['z', 'a', 'm'] })]), ['a', 'm', 'z']);
});

test('getAllTags returns empty array when no tags', () => {
  assertEqual(getAllTags([makeTodo()]), []);
});

const countTodos = [
  makeTodo({ completed: false, important: true,  dueDate: toDateString() }),
  makeTodo({ completed: true,  important: false, dueDate: null }),
  makeTodo({ completed: false, important: false, dueDate: null }),
];

test('computeCounts - all',       () => assertEqual(computeCounts(countTodos).all,       3));
test('computeCounts - active',    () => assertEqual(computeCounts(countTodos).active,    2));
test('computeCounts - completed', () => assertEqual(computeCounts(countTodos).completed, 1));
test('computeCounts - today',     () => assertEqual(computeCounts(countTodos).today,     1));
test('computeCounts - important', () => assertEqual(computeCounts(countTodos).important, 1));


const filterTodos = [
  makeTodo({ id: '1', completed: false, important: true,  dueDate: toDateString(), tags: ['work'] }),
  makeTodo({ id: '2', completed: true,  important: false, dueDate: null,           tags: ['home'] }),
  makeTodo({ id: '3', completed: false, important: false, dueDate: null,           tags: ['work'] }),
];

test('applyFilter - all returns all', () => {
  assertEqual(applyFilter(filterTodos, 'all', null, '').length, 3);
});

test('applyFilter - active returns only incomplete', () => {
  assert(applyFilter(filterTodos, 'active', null, '').every(t => !t.completed));
});

test('applyFilter - completed returns only complete', () => {
  assert(applyFilter(filterTodos, 'completed', null, '').every(t => t.completed));
});

test('applyFilter - today returns due today', () => {
  const r = applyFilter(filterTodos, 'today', null, '');
  assertEqual(r.length, 1);
  assertEqual(r[0].id, '1');
});

test('applyFilter - important returns starred', () => {
  const r = applyFilter(filterTodos, 'important', null, '');
  assertEqual(r.length, 1);
  assertEqual(r[0].id, '1');
});

test('applyFilter - activeTag filters by tag', () => {
  const r = applyFilter(filterTodos, 'all', 'work', '');
  assertEqual(r.length, 2);
  assert(r.every(t => t.tags.includes('work')));
});

test('applyFilter - searchQuery filters by title (case-insensitive)', () => {
  const todos = [makeTodo({ title: 'Buy milk' }), makeTodo({ title: 'Read book' })];
  assertEqual(applyFilter(todos, 'all', null, 'milk').length, 1);
  assertEqual(applyFilter(todos, 'all', null, 'MILK').length, 1);
});

test('applyFilter - searchQuery filters by tag', () => {
  const todos = [makeTodo({ tags: ['urgent'] }), makeTodo({ tags: ['home'] })];
  assertEqual(applyFilter(todos, 'all', null, 'urgent').length, 1);
});



test('sortTodos puts incomplete before completed', () => {
  const todos = [makeTodo({ completed: true }), makeTodo({ completed: false })];
  assertEqual(sortTodos(todos)[0].completed, false);
});

test('sortTodos puts important before non-important', () => {
  const todos = [
    makeTodo({ completed: false, important: false }),
    makeTodo({ completed: false, important: true }),
  ];
  assertEqual(sortTodos(todos)[0].important, true);
});

test('sortTodos orders by priority: high > medium > low', () => {
  const todos = [
    makeTodo({ completed: false, important: false, priority: 'low' }),
    makeTodo({ completed: false, important: false, priority: 'high' }),
    makeTodo({ completed: false, important: false, priority: 'medium' }),
  ];
  const sorted = sortTodos(todos);
  assertEqual(sorted[0].priority, 'high');
  assertEqual(sorted[1].priority, 'medium');
  assertEqual(sorted[2].priority, 'low');
});

test('sortTodos does not mutate original array', () => {
  const todos = [makeTodo({ completed: true }), makeTodo({ completed: false })];
  sortTodos(todos);
  assertEqual(todos[0].completed, true);
});



console.log('\n══════════════════════════════════════════');
console.log('         TaskFlow – Test Results           ');
console.log('══════════════════════════════════════════');
results.forEach(r => {
  console.log(`  ${r.ok ? '✅' : '❌'} ${r.description}${r.error ? `\n     → ${r.error}` : ''}`);
});
console.log('══════════════════════════════════════════');
console.log(`  Total: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}`);

const coverage = Math.round((passed / (passed + failed)) * 100);
console.log(`  Pass Rate: ${coverage}%${coverage >= 70 ? '  ✅ (≥ 70% target met)' : '  ❌ (below 70% target)'}`);
console.log('══════════════════════════════════════════\n');

if (failed > 0) process.exit(1);