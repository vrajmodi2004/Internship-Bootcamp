import { actions, getSnapshot } from './store.js';
import { formatDate, isOverdue, isToday, parseTags, toDateString } from './utils.js';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

const NAV_ITEMS = [
  { id: 'all',       label: 'All Tasks',  icon: '' },
  { id: 'today',     label: 'Today',     icon: ''  },
  { id: 'important', label: 'Important',  icon: ''  },
  { id: 'active',    label: 'Active',     icon: ''  },
  { id: 'completed', label: 'Completed',  icon: ''  },
];


export const renderSidebar = ({ filter, activeTag, counts, allTags }) => {
  const nav = document.getElementById('nav-items');
  nav.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-item ${filter === item.id && !activeTag ? 'active' : ''}"
            data-filter="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
      <span class="nav-count">${counts[item.id]}</span>
    </button>
  `).join('');

  const tagsSection = document.getElementById('tags-section');
  if (allTags.length === 0) {
    tagsSection.innerHTML = '';
  } else {
    tagsSection.innerHTML = `
      <div class="tags-header">TAGS</div>
      ${allTags.map(tag => `
        <button class="tag-item ${activeTag === tag ? 'active' : ''}" data-tag="${tag}">
          <span class="tag-dot"></span>
          <span>#${tag}</span>
        </button>
      `).join('')}
    `;
  }

  const brand = document.querySelector('.sidebar-brand');
  if (brand && !brand._brandBound) {
    brand.style.cursor = 'pointer';
    brand.title = 'Go to All Tasks';
    brand.addEventListener('click', () => actions.setFilter('all'));
    brand._brandBound = true;
  }

 
  nav.querySelectorAll('.nav-item').forEach(btn =>
    btn.addEventListener('click', () => actions.setFilter(btn.dataset.filter))
  );
  tagsSection.querySelectorAll('.tag-item').forEach(btn =>
    btn.addEventListener('click', () => actions.setActiveTag(btn.dataset.tag))
  );
};


export const renderHeader = ({ filter, activeTag, visibleTodos, counts }) => {
  const titles = {
    all: 'All Tasks', today: ' Today', important: 'Important',
    active: 'Active', completed: 'Completed',
  };

  const title = activeTag ? `#${activeTag}` : (titles[filter] ?? 'Tasks');

  document.getElementById('page-title').textContent = title;
  document.getElementById('task-count').textContent =
    `${visibleTodos.length} task${visibleTodos.length !== 1 ? 's' : ''}`;
};


export const renderAddTaskVisibility = ({ filter, activeTag }) => {
  const addCard = document.getElementById('add-todo-card');
  const shouldShow = filter === 'all' && !activeTag;
  addCard.style.display = shouldShow ? 'block' : 'none';

  if (!shouldShow) {
    const expandEl = document.getElementById('add-extra');
    if (expandEl) expandEl.style.display = 'none';
    const input = document.getElementById('add-input');
    if (input) input.value = '';
  }
};


export const renderTodoList = ({ visibleTodos, filter }) => {
  const container = document.getElementById('todo-list');

  if (visibleTodos.length === 0) {
    const emptyMsg = 'Nothing here yet';
    const emptySub = 'Add a task above to get started';

    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">${emptyMsg}</p>
        <p class="empty-sub">${emptySub}</p>
      </div>`;
    return;
  }

  container.innerHTML = visibleTodos.map(todo => {
    const overdueFlag = !todo.completed && isOverdue(todo.dueDate);
    const todayFlag   = isToday(todo.dueDate);

    return `
    <div class="todo-item ${todo.completed ? 'completed' : ''} ${overdueFlag ? 'overdue' : ''}"
         data-id="${todo.id}">
      <div class="todo-row">
        <button class="check-btn ${todo.completed ? 'checked' : ''}" data-action="toggle">
          ${todo.completed ? '✓' : ''}
        </button>
        <span class="priority-dot" style="background:${PRIORITY_COLORS[todo.priority]}"
              title="${todo.priority} priority"></span>
        <span class="todo-title" data-action="edit-title">${escHtml(todo.title)}</span>
        ${todo.dueDate ? `
          <span class="due-badge ${overdueFlag ? 'overdue-badge' : ''} ${todayFlag ? 'today-badge' : ''}">
            ${overdueFlag ? '⚠️ ' : '📅 '}${formatDate(todo.dueDate)}
          </span>` : ''}
        ${todo.tags.map(tag => `<span class="tag-pill">#${tag}</span>`).join('')}
        <div class="todo-actions">
          <button class="star-btn ${todo.important ? 'starred' : ''}" data-action="star" title="${todo.important ? 'Unstar' : 'Star'}">⭐</button>
          <button class="detail-btn" data-action="detail" title="Details">…</button>
          <button class="delete-btn" data-action="delete" title="Delete">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const completedCount = visibleTodos.filter(t => t.completed).length;
  if (completedCount > 0 && filter !== 'completed') {
    container.insertAdjacentHTML('beforeend', `
      <div class="clear-completed-row">
        <button id="clear-completed-btn">
          Clear ${completedCount} completed task${completedCount !== 1 ? 's' : ''}
        </button>
      </div>`);
    document.getElementById('clear-completed-btn')
      .addEventListener('click', () => actions.clearCompleted());
  }

  container.querySelectorAll('.todo-item').forEach(item => {
    const id = item.dataset.id;

    item.querySelector('[data-action="toggle"]')
      .addEventListener('click', () => actions.toggleTodo(id));

    item.querySelector('[data-action="star"]')
      .addEventListener('click', () => actions.starTodo(id));

    item.querySelector('[data-action="delete"]')
      .addEventListener('click', () => actions.removeTodo(id));

    item.querySelector('[data-action="detail"]')
      .addEventListener('click', () => toggleDetailPanel(item, id));

    item.querySelector('[data-action="edit-title"]')
      .addEventListener('dblclick', () => startInlineEdit(item, id));
  });
};


const toggleDetailPanel = (itemEl, id) => {
  const existing = itemEl.querySelector('.todo-detail');
  if (existing) { existing.remove(); return; }

  const snap = getSnapshot();
  const todo = snap.todos.find(t => t.id === id);
  if (!todo) return;

  const panel = document.createElement('div');
  panel.className = 'todo-detail';
  panel.innerHTML = `
    <div class="detail-row">
      <label>Note</label>
      <input class="detail-input" id="detail-note-${id}"
             placeholder="Add a note..." value="${escHtml(todo.note)}">
    </div>
    <div class="detail-row">
      <label>Tags</label>
      <input class="detail-input" id="detail-tags-${id}"
             placeholder="work, personal..." value="${todo.tags.join(', ')}">
    </div>
    <div class="detail-row">
      <label>Due Date</label>
      <input class="detail-input" id="detail-due-${id}"
             type="date" value="${todo.dueDate || ''}" min="${toDateString()}">
    </div>
    <div class="detail-row">
      <label>Priority</label>
      <select class="detail-input" id="detail-priority-${id}">
        <option value="high"   ${todo.priority==='high'   ? 'selected':''}>🔴 High</option>
        <option value="medium" ${todo.priority==='medium' ? 'selected':''}>🟡 Medium</option>
        <option value="low"    ${todo.priority==='low'    ? 'selected':''}>🟢 Low</option>
      </select>
    </div>
    <div class="detail-actions">
      <button class="btn-primary btn-sm" id="detail-save-${id}">Save</button>
    </div>
  `;
  itemEl.appendChild(panel);

  document.getElementById(`detail-save-${id}`).addEventListener('click', () => {
    actions.editTodo(id, {
      note:     document.getElementById(`detail-note-${id}`).value,
      tags:     parseTags(document.getElementById(`detail-tags-${id}`).value),
      dueDate:  document.getElementById(`detail-due-${id}`).value || null,
      priority: document.getElementById(`detail-priority-${id}`).value,
    });
  });
};


const startInlineEdit = (itemEl, id) => {
  const titleEl = itemEl.querySelector('.todo-title');
  const original = titleEl.textContent;
  titleEl.contentEditable = 'true';
  titleEl.focus();
  const range = document.createRange();
  range.selectNodeContents(titleEl);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  const save = () => {
    titleEl.contentEditable = 'false';
    const newTitle = titleEl.textContent.trim();
    if (newTitle && newTitle !== original) actions.editTodo(id, { title: newTitle });
    else titleEl.textContent = original;
  };

  titleEl.addEventListener('blur', save, { once: true });
  titleEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
    if (e.key === 'Escape') { titleEl.textContent = original; titleEl.blur(); }
  });
};


export const initAddForm = () => {
  const input     = document.getElementById('add-input');
  const addBtn    = document.getElementById('add-btn');
  const expandEl  = document.getElementById('add-extra');
  const submitBtn = document.getElementById('add-submit');
  const cancelBtn = document.getElementById('add-cancel');

  const expand = () => {
    expandEl.style.display = 'flex';
    input.focus();
  };

  const collapse = () => {
    expandEl.style.display = 'none';
    clearForm();
  };

  const clearForm = () => {
    input.value = '';
    document.getElementById('add-duedate').value  = '';
    document.getElementById('add-priority').value = 'medium';
    document.getElementById('add-tags').value     = '';
    document.getElementById('add-note').value     = '';
  };

  const submit = () => {
    const title = input.value.trim();
    if (!title) {
      input.focus();
      input.style.borderBottom = '2px solid #ef4444';
      setTimeout(() => { input.style.borderBottom = ''; }, 1000);
      return;
    }
    
    const formData = {
      dueDate:  document.getElementById('add-duedate').value  || null,
      priority: document.getElementById('add-priority').value,
      tags:     parseTags(document.getElementById('add-tags').value),
      note:     document.getElementById('add-note').value,
    };
    
    collapse();
    
    actions.addTodo(title, formData);
  };

  addBtn.addEventListener('click', expand);
  input.addEventListener('focus', expand);
  submitBtn.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') collapse();
  });
  cancelBtn.addEventListener('click', collapse);
  document.getElementById('add-duedate').min = toDateString();
};




export const render = (snapshot) => {
  renderSidebar(snapshot);
  renderHeader(snapshot);
  renderAddTaskVisibility(snapshot);
  renderTodoList(snapshot);
};


const escHtml = (str) =>
  String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
             .replace(/"/g,'&quot;').replace(/'/g,'&#39;');