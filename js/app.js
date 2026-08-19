/* Собранный Хозяин — App Logic */

const contentIdeas = [
  {
    title: "Честное предпринимательство",
    text: "Сегодня снова увидел, как маленькая деталь ломает весь сервис. Гость не всегда понимает, что именно не так. Но он чувствует небрежность. Для меня сервис — это не улыбка на входе. Это система уважения к человеку. Поэтому мы будем исправлять не только ошибку, а процесс, который её допустил."
  },
  {
    title: "Хозяин пространства",
    text: "Баня — это не про температуру. Это про состояние, которое создаётся светом, запахом, звуком, температурой воды и людьми. Когда всё на своих местах — гость чувствует: здесь о нём позаботились. Детали решают всё."
  },
  {
    title: "Мужская зрелость",
    text: "Предприниматель часто ломается не от работы, а от хаоса. От постоянного переключения, от незавершённых задач, от желания всем угодить. Сила начинается с того, что ты защищаешь своё состояние и говоришь «нет» тому, что размазывает фокус."
  },
  {
    title: "Банная культура и восстановление",
    text: "Холодная вода после пара — это не просто «потерпеть». Это перезагрузка нервной системы. В этот момент тело понимает: я в безопасности. Я могу расслабиться. Многие ищут восстановление в таблетках. А оно начинается с простых ритуалов."
  },
  {
    title: "Жизнь предпринимателя в Таиланде",
    text: "Бизнес в другой стране — это не про то, как быстро заработать. Это про то, как выстроить отношения с людьми, которые думают иначе. Уважение к местным правилам, терпение и готовность учиться — вот что делает тебя хозяином, а не туристом с деньгами."
  },
  {
    title: "Собранность",
    text: "Я понял одну вещь: статус — это не занятость. Статус — это управляемость. Когда вокруг всё спокойно и понятно, даже если дел много — это и есть собранный хозяин."
  },
  {
    title: "Сила без хамства",
    text: "Требовательность — не жестокость. Это уважение к бизнесу, гостям, команде и сотруднику. Когда требовательности нет — сильные тянут больше, слабые привыкают к поблажкам, а собственник перегружается."
  },
  {
    title: "Розница за 7000 км: Гавана",
    text: "У меня есть сеть табачных точек в Орле — за тысячи километров от Пхукета. Управлять этим можно только одним способом: система важнее присутствия. Если бизнес держится на том, что ты лично каждый день там — это не бизнес, это работа. Хозяин строит структуру, которая работает без него в комнате."
  },
  {
    title: "Продавать конкурентам — это не слабость",
    text: "Premium Water Hub поставляет воду и веники бань, с которыми мы формально конкурируем. Многие удивляются. А я вижу это иначе: рынок бань на Пхукете растёт от того, что растёт качество у всех. Голубой океан — это не отсутствие конкурентов, это умение зарабатывать на самом росте рынка, а не только на выигрыше конкретной битвы."
  },
  {
    title: "Выйти вовремя — тоже решение хозяина",
    text: "Я вышел из RBC Condo. Не потому что не получилось, а потому что понял: не каждый актив стоит моего внимания и капитала. Хозяин пространства — это не про «держаться за всё». Это про то, чтобы честно спросить себя: это всё ещё моё дело, или уже просто привычка?"
  },
  {
    title: "Гостеприимство — это не про баню",
    text: "HUG Coffee and Kitchen не имеет отношения к банной культуре, но живёт по тем же законам: деталь решает, атмосфера считывается за 10 секунд, а сервис — это система уважения, а не улыбка на входе. Гостеприимство — это отдельная компетенция, которая переносится между форматами."
  },
  {
    title: "Дисциплина без зрителей",
    text: "Настоящая собранность видна не на переговорах, а в 6 утра, когда никто не проверяет. Дисциплина, которую ты держишь только при свидетелях, — это не характер, это театр. Я строю привычки, которые не требуют зрителя."
  }
];

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === id) item.classList.add('active');
  });

  if (id === 'tracker') loadStateHistory();
  if (id === 'reference') {
    const search = document.getElementById('ref-search');
    if (search) search.value = '';
    filterReference();
  }
}

function updateStateScore() {
  const ids = ['sleep', 'body', 'mood', 'clarity', 'nerves'];
  let total = 0;
  ids.forEach(id => {
    const val = parseInt(document.getElementById(id).value, 10);
    total += val;
    document.getElementById(id + '-val').textContent = val;
  });
  document.getElementById('total-score').textContent = total;

  const interp = document.getElementById('state-interp');
  if (total >= 40) {
    interp.textContent = 'Отличное состояние. Можно решать сложные задачи и вести переговоры.';
    interp.style.color = 'var(--success)';
  } else if (total >= 30) {
    interp.textContent = 'Нормальный рабочий день. Избегай лишнего хаоса.';
    interp.style.color = 'var(--warning)';
  } else if (total >= 20) {
    interp.textContent = 'День упрощать. Меньше решений, больше восстановления.';
    interp.style.color = '#fb923c';
  } else {
    interp.textContent = 'Не геройствовать. Только обязательное + восстановление.';
    interp.style.color = 'var(--danger)';
  }
}

function saveDailyState() {
  const date = new Date().toISOString().slice(0, 10);
  const entry = {
    date,
    sleep: +document.getElementById('sleep').value,
    body: +document.getElementById('body').value,
    mood: +document.getElementById('mood').value,
    clarity: +document.getElementById('clarity').value,
    nerves: +document.getElementById('nerves').value,
    total: +document.getElementById('total-score').textContent,
    ts: new Date().toISOString()
  };

  let history = JSON.parse(localStorage.getItem('stateHistory') || '[]');
  history = history.filter(h => h.date !== date);
  history.unshift(entry);
  if (history.length > 30) history = history.slice(0, 30);
  localStorage.setItem('stateHistory', JSON.stringify(history));
  showToast('Состояние сохранено');
  if (document.getElementById('tracker').classList.contains('active')) loadStateHistory();
}

function loadStateHistory() {
  const container = document.getElementById('state-history');
  if (!container) return;
  const history = JSON.parse(localStorage.getItem('stateHistory') || '[]');

  if (history.length === 0) {
    container.innerHTML = '<div class="text-muted text-sm" style="padding:2rem;text-align:center">Пока нет записей. Оцени состояние на Дашборде и сохрани.</div>';
    return;
  }

  container.innerHTML = history.map((e, i) => {
    let cls = 'text-danger';
    let label = 'Низко';
    if (e.total >= 40) { cls = 'text-success'; label = 'Отлично'; }
    else if (e.total >= 30) { cls = 'text-warning'; label = 'Хорошо'; }
    else if (e.total >= 20) { cls = 'text-orange'; label = 'Средне'; }

    return `
      <div class="flex justify-between items-center" style="background:#0a0a0a;padding:0.75rem 1rem;border-radius:0.75rem;margin-bottom:0.5rem">
        <div class="flex gap-3 items-center">
          <span class="text-xs text-muted" style="width:85px">${e.date}</span>
          <span style="font-weight:600;font-size:1.1rem">${e.total}</span>
          <span class="text-xs text-muted">/50</span>
        </div>
        <div class="flex gap-2 items-center">
          <span class="text-xs ${cls}">${label}</span>
          <button onclick="deleteHistoryEntry(${i})" class="btn-ghost" style="padding:0.2rem 0.5rem;font-size:0.7rem">✕</button>
        </div>
      </div>`;
  }).join('');
}

function deleteHistoryEntry(index) {
  let history = JSON.parse(localStorage.getItem('stateHistory') || '[]');
  history.splice(index, 1);
  localStorage.setItem('stateHistory', JSON.stringify(history));
  loadStateHistory();
}

function clearHistory() {
  if (confirm('Очистить всю историю состояний?')) {
    localStorage.removeItem('stateHistory');
    loadStateHistory();
  }
}

function generateTask(e) {
  e.preventDefault();
  const what = document.getElementById('task-what').value.trim();
  const who = document.getElementById('task-who').value.trim();
  const deadline = document.getElementById('task-deadline').value.trim();
  const result = document.getElementById('task-result').value.trim();
  const consequence = document.getElementById('task-consequence').value.trim();

  if (!what || !who) {
    alert('Заполни хотя бы «Что сделать» и «Кто отвечает»');
    return;
  }

  const text = `Нужно ${what}. Ответственный — ${who}. Готовый результат: ${result || 'чётко определённый результат'}. ${deadline ? 'Срок: ' + deadline + '.' : ''} ${consequence || 'Контроль: фотоотчёт / статус в чате.'}`;

  const out = document.getElementById('task-output');
  out.innerHTML = `
    <div class="premium text-sm mb-2">ГОТОВАЯ ФОРМУЛИРОВКА:</div>
    <div class="text-sm">${text}</div>
    <div class="text-xs premium mt-2">Скопировано в буфер</div>`;
  out.style.display = 'block';

  navigator.clipboard.writeText(text).catch(() => {});
  showToast('Задача сформирована и скопирована');
}

function generateContentIdea(index) {
  const idea = contentIdeas[index] || contentIdeas[Math.floor(Math.random() * contentIdeas.length)];
  document.getElementById('idea-title').textContent = idea.title;
  document.getElementById('idea-text').textContent = idea.text;
  document.getElementById('idea-box').style.display = 'block';
  window.currentIdea = idea.text;
}

function copyIdea() {
  if (window.currentIdea) {
    navigator.clipboard.writeText(window.currentIdea).then(() => showToast('Идея скопирована'));
  }
}

function saveJournal(e) {
  e.preventDefault();
  const entry = {
    date: new Date().toISOString().slice(0, 10),
    main: document.getElementById('j-main').value.trim(),
    drain: document.getElementById('j-drain').value.trim(),
    tomorrow: document.getElementById('j-tomorrow').value.trim(),
    release: document.getElementById('j-release').value.trim(),
    ts: new Date().toISOString()
  };

  let journals = JSON.parse(localStorage.getItem('journalEntries') || '[]');
  journals = journals.filter(j => j.date !== entry.date);
  journals.unshift(entry);
  localStorage.setItem('journalEntries', JSON.stringify(journals));

  showToast('День закрыт. Молодец.');
  document.getElementById('journal-form').reset();
}

function filterReference() {
  const term = (document.getElementById('ref-search')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.ref-item').forEach(item => {
    item.style.display = !term || item.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>✓</span> <span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

function quickAction(type) {
  if (type === 'thought') {
    showSection('content');
    setTimeout(() => generateContentIdea(Math.floor(Math.random() * contentIdeas.length)), 200);
  }
  if (type === 'journal') showSection('tracker');
}

function init() {
  // State sliders
  ['sleep', 'body', 'mood', 'clarity', 'nerves'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateStateScore);
  });
  updateStateScore();

  // Restore today's state if exists
  const today = new Date().toISOString().slice(0, 10);
  const history = JSON.parse(localStorage.getItem('stateHistory') || '[]');
  const todayEntry = history.find(h => h.date === today);
  if (todayEntry) {
    document.getElementById('sleep').value = todayEntry.sleep;
    document.getElementById('body').value = todayEntry.body;
    document.getElementById('mood').value = todayEntry.mood;
    document.getElementById('clarity').value = todayEntry.clarity;
    document.getElementById('nerves').value = todayEntry.nerves;
    updateStateScore();
  }

  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => showSection(item.dataset.section));
  });

  console.log('%c[Собранный Хозяин] Приложение загружено', 'color:#888');
}

document.addEventListener('DOMContentLoaded', init);