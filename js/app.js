/* Собранный Хозяин v2 — App Logic */
(function () {
  'use strict';

  var DAYS_KEY = 'sobrannyi.v2.days';
  var PROTO_KEY = 'sobrannyi.v2.protocols';

  var contentIdeas = [
    { title: "Честное предпринимательство", text: "Сегодня снова увидел, как маленькая деталь ломает весь сервис. Гость не всегда понимает, что именно не так. Но он чувствует небрежность. Для меня сервис — это не улыбка на входе. Это система уважения к человеку. Поэтому мы будем исправлять не только ошибку, но и процесс, который её допустил." },
    { title: "Хозяин пространства", text: "Баня — это не про температуру. Это про состояние, которое создаётся светом, запахом, звуком, температурой воды и людьми. Когда всё на своих местах — гость чувствует: здесь о нём позаботились. Детали решают всё." },
    { title: "Мужская зрелость", text: "Предприниматель часто ломается не от работы, а от хаоса. От постоянного переключения, от незавершённых задач, от желания всем угодить. Сила начинается с того, что ты защищаешь своё состояние и говоришь «нет» тому, что размазывает фокус." },
    { title: "Банная культура и восстановление", text: "Холодная вода после пара — это не просто «потерпеть». Это перезагрузка нервной системы. В этот момент тело понимает: я в безопасности. Я могу расслабиться. Многие ищут восстановление в таблетках. А оно начинается с простых ритуалов." },
    { title: "Жизнь предпринимателя в Таиланде", text: "Бизнес в другой стране — это не про то, как быстро заработать. Это про то, как выстроить отношения с людьми, которые думают иначе. Уважение к местным правилам, терпение и готовность учиться — вот что делает тебя хозяином, а не туристом с деньгами." },
    { title: "Собранность", text: "Я понял одну вещь: статус — это не занятость. Статус — это управляемость. Когда вокруг всё спокойно и понятно, даже если дел много — это и есть собранный хозяин." },
    { title: "Сила без хамства", text: "Требовательность — не жестокость. Это уважение к бизнесу, гостям, команде и сотруднику. Когда требовательности нет — сильные тянут больше, слабые привыкают к поблажкам, а собственник перегружается." },
    { title: "Розница за 7000 км: Гавана", text: "У меня есть сеть табачных точек в Орле — за тысячи километров от Пхукета. Управлять этим можно только одним способом: система важнее присутствия. Если бизнес держится на том, что ты лично каждый день там — это не бизнес, это работа. Хозяин строит структуру, которая работает без него в комнате." },
    { title: "Продавать конкурентам — это не слабость", text: "Premium Water Hub поставляет воду и веники бань, с которыми мы формально конкурируем. Многие удивляются. А я вижу это иначе: рынок бань на Пхукете растёт от того, что растёт качество у всех. Голубой океан — это не отсутствие конкурентов, это умение зарабатывать на самом росте рынка, а не только на выигрыше конкретной битвы." },
    { title: "Выйти вовремя — тоже решение хозяина", text: "Я вышел из RBC Condo. Не потому что не получилось, а потому что понял: не каждый актив стоит моего внимания и капитала. Хозяин пространства — это не про «держаться за всё». Это про то, чтобы честно спросить себя: это всё ещё моё дело, или уже просто привычка?" },
    { title: "Гостеприимство — это не про баню", text: "HUG Coffee and Kitchen не имеет отношения к банной культуре, но живёт по тем же законам: деталь решает, атмосфера считывается за 10 секунд, а сервис — это система уважения, а не улыбка на входе. Гостеприимство — это отдельная компетенция, которая переносится между форматами." },
    { title: "Дисциплина без зрителей", text: "Настоящая собранность видна не на переговорах, а в 6 утра, когда никто не проверяет. Дисциплина, которую ты держишь только при свидетелях, — это не характер, это театр. Я строю привычки, которые не требуют зрителя." }
  ];

  // ---------- utils ----------
  // Локальная календарная дата устройства, НЕ UTC — на Пхукете (UTC+7)
  // toISOString() сдвигал бы границу суток на 7 часов вперёд от реальной
  // полуночи и путал бы утренний ритуал каждый день между 00:00 и 07:00.
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
  }
  function $(id) { return document.getElementById(id); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function loadDays() {
    try { return JSON.parse(localStorage.getItem(DAYS_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveDays(days) { localStorage.setItem(DAYS_KEY, JSON.stringify(days)); }

  function blankDay() {
    return {
      ritualDone: false,
      scales: { body: 5, head: 5, spirit: 5 },
      mainTask: { text: '', done: false },
      anchors: [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }],
      closed: false,
      journal: null
    };
  }

  function ensureToday() {
    var days = loadDays();
    var key = todayISO();
    if (!days[key]) { days[key] = blankDay(); saveDays(days); }
    return days[key];
  }

  function updateToday(mut) {
    var days = loadDays();
    var key = todayISO();
    var day = days[key] || blankDay();
    mut(day);
    days[key] = day;
    saveDays(days);
    return day;
  }

  function scoreInterp(total, max) {
    var ratio = total / max;
    if (ratio >= 0.8) return { text: 'Отличное состояние. Можно решать сложные задачи и вести переговоры.', cls: 'success' };
    if (ratio >= 0.6) return { text: 'Нормальный рабочий день. Избегай лишнего хаоса.', cls: 'warning' };
    if (ratio >= 0.4) return { text: 'День упрощать. Меньше решений, больше восстановления.', cls: 'orange' };
    return { text: 'Не геройствовать. Только обязательное + восстановление.', cls: 'danger' };
  }

  function toast(msg) {
    var root = $('toast-root');
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s';
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 300);
    }, 2000);
  }

  function confirmDialog(msg, okLabel) {
    return new Promise(function (resolve) {
      var root = $('confirm-root');
      root.hidden = false;
      root.innerHTML =
        '<div class="confirm-box">' +
        '<div class="confirm-msg"></div>' +
        '<div class="confirm-actions">' +
        '<button class="btn btn-ghost" data-a="cancel">Отмена</button>' +
        '<button class="btn btn-primary" data-a="ok"></button>' +
        '</div></div>';
      root.querySelector('.confirm-msg').textContent = msg;
      root.querySelector('[data-a="ok"]').textContent = okLabel || 'Да';
      function done(v) { root.hidden = true; root.innerHTML = ''; resolve(v); }
      root.querySelector('[data-a="cancel"]').onclick = function () { done(false); };
      root.querySelector('[data-a="ok"]').onclick = function () { done(true); };
    });
  }

  // ---------- navigation ----------
  var HOME_SCREENS = { today: 1, more: 1 };

  function showScreen(id) {
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.dataset.screen === id); });
    $$('.bottom-nav-btn').forEach(function (b) {
      if (HOME_SCREENS[id]) b.classList.toggle('active', b.dataset.goto === id);
    });
    window.scrollTo(0, 0);
  }

  function wireGoto() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-goto]');
      if (!el) return;
      var target = el.dataset.goto;
      if (target === 'today') { enterApp(); return; }
      showScreen(target);
    });
  }

  // ---------- morning ritual ----------
  function wireRitual() {
    $('gap-next').addEventListener('click', function () { showScreen('scales'); });

    var sliders = ['body', 'head', 'spirit'];
    function updateScaleTotal() {
      var total = 0;
      sliders.forEach(function (k) {
        var v = +$('scale-' + k).value;
        total += v;
        $('scale-' + k + '-val').textContent = v;
      });
      $('scale-total').textContent = total;
      var interp = scoreInterp(total, 30);
      var el = $('scale-interp');
      el.textContent = interp.text;
      el.style.color = 'var(--' + interp.cls + ')';
    }
    sliders.forEach(function (k) { $('scale-' + k).addEventListener('input', updateScaleTotal); });
    updateScaleTotal();

    $('scales-next').addEventListener('click', function () {
      var scales = {
        body: +$('scale-body').value,
        head: +$('scale-head').value,
        spirit: +$('scale-spirit').value
      };
      updateToday(function (d) { d.scales = scales; });
      showScreen('main-task');
    });

    $('main-task-next').addEventListener('click', function () {
      var text = $('main-task-input').value.trim();
      if (!text) {
        $('main-task-hint').textContent = 'Выбери одно — иначе весь день расплывётся.';
        return;
      }
      $('main-task-hint').textContent = '';
      updateToday(function (d) { d.mainTask = { text: text, done: false }; });
      showScreen('anchors');
    });

    $('anchors-done').addEventListener('click', function () {
      var anchors = [0, 1, 2].map(function (i) {
        return { text: $('anchor-' + i).value.trim(), done: false };
      });
      updateToday(function (d) { d.anchors = anchors; d.ritualDone = true; });
      renderToday();
      showScreen('today');
    });
  }

  // ---------- today status ----------
  function renderToday() {
    var day = ensureToday();
    $('today-date').textContent = fmtDate(todayISO());

    var total = day.scales.body + day.scales.head + day.scales.spirit;
    $('today-score').textContent = total;
    var interp = scoreInterp(total, 30);
    var interpEl = $('today-interp');
    interpEl.textContent = interp.text;
    interpEl.style.color = 'var(--' + interp.cls + ')';

    $('today-main-text').textContent = day.mainTask.text || '—';
    $('today-main-check').checked = day.mainTask.done;
    $('today-main-row').classList.toggle('done', day.mainTask.done);

    $$('.today-anchor-check').forEach(function (cb) {
      var i = +cb.dataset.i;
      var a = day.anchors[i] || { text: '', done: false };
      var row = cb.closest('.check-row');
      if (!a.text) { row.style.display = 'none'; return; }
      row.style.display = '';
      cb.checked = a.done;
      var span = document.querySelector('[data-anchor-text="' + i + '"]');
      span.textContent = a.text;
      row.classList.toggle('done', a.done);
    });

    $('today-close-btn').hidden = !!day.closed;
    $('today-closed-card').hidden = !day.closed;

    if (day.journal) {
      $('close-main').value = day.journal.main || '';
      $('close-drain').value = day.journal.drain || '';
      $('close-tomorrow').value = day.journal.tomorrow || '';
      $('close-release').value = day.journal.release || '';
      if (day.closed) {
        $('closed-j-main').textContent = day.journal.main || '—';
        $('closed-j-drain').textContent = day.journal.drain || '—';
        $('closed-j-tomorrow').textContent = day.journal.tomorrow || '—';
        $('closed-j-release').textContent = day.journal.release || '—';
      }
    }
  }

  function wireTodayChecks() {
    $('today-main-check').addEventListener('change', function (e) {
      updateToday(function (d) { d.mainTask.done = e.target.checked; });
      renderToday();
    });
    $$('.today-anchor-check').forEach(function (cb) {
      cb.addEventListener('change', function (e) {
        var i = +cb.dataset.i;
        updateToday(function (d) { d.anchors[i].done = e.target.checked; });
        renderToday();
      });
    });
    $('today-close-btn').addEventListener('click', function () { showScreen('close'); });
    $('today-edit-close-btn').addEventListener('click', function () { showScreen('close'); });
  }

  // ---------- evening close ----------
  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function wireClose() {
    function currentJournal() {
      return {
        main: $('close-main').value.trim(),
        drain: $('close-drain').value.trim(),
        tomorrow: $('close-tomorrow').value.trim(),
        release: $('close-release').value.trim(),
        ts: new Date().toISOString()
      };
    }
    // Автосохранение черновика — уход со экрана (случайный тап на "← Сегодня")
    // не должен стирать написанное.
    var saveDraft = debounce(function () {
      updateToday(function (d) { d.journal = currentJournal(); });
    }, 400);
    ['close-main', 'close-drain', 'close-tomorrow', 'close-release'].forEach(function (id) {
      $(id).addEventListener('input', saveDraft);
    });

    $('close-save').addEventListener('click', function () {
      updateToday(function (d) { d.journal = currentJournal(); d.closed = true; });
      toast('День закрыт.');
      renderToday();
      showScreen('today');
    });
  }

  // ---------- речь ----------
  function wireSpeech() {
    var idx = -1;
    function show() {
      idx = Math.floor(Math.random() * contentIdeas.length);
      var idea = contentIdeas[idx];
      $('speech-title').textContent = idea.title;
      $('speech-text').textContent = idea.text;
      $('speech-box').hidden = false;
      $('speech-copy').hidden = false;
    }
    $('speech-next').addEventListener('click', show);
    $('speech-copy').addEventListener('click', function () {
      var idea = contentIdeas[idx];
      if (!idea) return;
      navigator.clipboard.writeText(idea.title + '\n\n' + idea.text).then(function () {
        toast('Идея скопирована');
      }).catch(function () {});
    });
  }

  // ---------- протоколы ----------
  function loadProtocols() {
    try { return JSON.parse(localStorage.getItem(PROTO_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveProtocols(list) { localStorage.setItem(PROTO_KEY, JSON.stringify(list)); }

  function renderProtoHistory() {
    var list = loadProtocols();
    var root = $('proto-history');
    if (!list.length) { root.innerHTML = ''; return; }
    root.innerHTML = '<div class="card-kicker" style="margin:1.25rem 0 0.5rem">Недавние</div>' +
      list.slice(0, 10).map(function (p, i) {
        return '<div class="history-row"><span>' + escapeHtml(p.text) + '</span>' +
          '<button class="history-del" data-del-proto="' + i + '">✕</button></div>';
      }).join('');
    $$('[data-del-proto]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        confirmDialog('Удалить эту формулировку?', 'Удалить').then(function (ok) {
          if (!ok) return;
          var i = +btn.dataset.delProto;
          var l = loadProtocols();
          l.splice(i, 1);
          saveProtocols(l);
          renderProtoHistory();
        });
      });
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function wireProtocols() {
    $('proto-generate').addEventListener('click', function () {
      var what = $('proto-what').value.trim();
      var who = $('proto-who').value.trim();
      var deadline = $('proto-deadline').value.trim();
      var result = $('proto-result').value.trim();
      var consequence = $('proto-consequence').value.trim();

      if (!what || !who) {
        $('proto-hint').textContent = 'Заполни хотя бы «Что сделать» и «Кто отвечает».';
        return;
      }
      $('proto-hint').textContent = '';

      var text = 'Нужно ' + what + '. Ответственный — ' + who + '. Готовый результат: ' +
        (result || 'чётко определённый результат') + '.' +
        (deadline ? ' Срок: ' + deadline + '.' : '') + ' ' +
        (consequence || 'Контроль: фотоотчёт / статус в чате.');

      var out = $('proto-output');
      out.hidden = false;
      out.innerHTML = '<div class="card-kicker">Готовая формулировка</div><div>' + escapeHtml(text) + '</div>';

      navigator.clipboard.writeText(text).catch(function () {});
      toast('Задача сформирована и скопирована');

      var list = loadProtocols();
      list.unshift({ text: text, ts: new Date().toISOString() });
      if (list.length > 30) list = list.slice(0, 30);
      saveProtocols(list);
      renderProtoHistory();
    });
  }

  // ---------- фото-трек (IndexedDB) ----------
  var PHOTO_DB_NAME = 'sobrannyi-photos';
  var _photoDBPromise = null;

  function openPhotoDB() {
    if (_photoDBPromise) return _photoDBPromise;
    _photoDBPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('no indexeddb')); return; }
      var req = indexedDB.open(PHOTO_DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore('photos', { keyPath: 'date' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { _photoDBPromise = null; reject(req.error); };
    });
    return _photoDBPromise;
  }

  function savePhoto(date, blob) {
    return openPhotoDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('photos', 'readwrite');
        tx.objectStore('photos').put({ date: date, blob: blob, ts: Date.now() });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getAllPhotos() {
    return openPhotoDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('photos', 'readonly');
        var req = tx.objectStore('photos').getAll();
        req.onsuccess = function () {
          resolve(req.result.sort(function (a, b) { return b.date.localeCompare(a.date); }));
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function deletePhoto(date) {
    return openPhotoDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('photos', 'readwrite');
        tx.objectStore('photos').delete(date);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function resizeToBlob(file, maxSize) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (blob) { resolve(blob); }, 'image/jpeg', 0.72);
      };
      img.onerror = function (err) { URL.revokeObjectURL(url); reject(err); };
      img.src = url;
    });
  }

  var activePhotoUrls = [];

  function renderPhotoGrid() {
    getAllPhotos().then(function (photos) {
      activePhotoUrls.forEach(function (u) { URL.revokeObjectURL(u); });
      activePhotoUrls = [];
      var grid = $('photo-grid');
      grid.innerHTML = '';
      photos.forEach(function (p) {
        var cell = document.createElement('div');
        cell.className = 'photo-cell';
        var img = document.createElement('img');
        var src = URL.createObjectURL(p.blob);
        activePhotoUrls.push(src);
        img.src = src;
        var dateEl = document.createElement('div');
        dateEl.className = 'photo-date';
        dateEl.textContent = p.date;
        var del = document.createElement('button');
        del.className = 'photo-del';
        del.textContent = '✕';
        del.addEventListener('click', function () {
          confirmDialog('Удалить фото за ' + p.date + '?', 'Удалить').then(function (ok) {
            if (!ok) return;
            deletePhoto(p.date).then(renderPhotoGrid);
          });
        });
        cell.appendChild(img);
        cell.appendChild(dateEl);
        cell.appendChild(del);
        grid.appendChild(cell);
      });
    }).catch(function () {
      $('photo-grid').innerHTML = '<div class="text-muted" style="padding:1rem 0">Фото-хранилище недоступно в этом браузере.</div>';
    });
  }

  function wirePhotos() {
    $('photo-input').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      getAllPhotos().then(function (photos) {
        var exists = photos.some(function (p) { return p.date === todayISO(); });
        if (!exists) return true;
        return confirmDialog('Заменить сегодняшнее фото новым?', 'Заменить');
      }).then(function (ok) {
        if (!ok) { e.target.value = ''; return; }
        return resizeToBlob(file, 1000).then(function (blob) {
          return savePhoto(todayISO(), blob);
        }).then(function () {
          toast('Фото сохранено');
          renderPhotoGrid();
          e.target.value = '';
        });
      });
    });
    renderPhotoGrid();
  }

  // ---------- справочник ----------
  function wireReference() {
    $('ref-search').addEventListener('input', function (e) {
      var term = e.target.value.toLowerCase().trim();
      $$('.ref-item').forEach(function (item) {
        var match = !term || item.textContent.toLowerCase().indexOf(term) !== -1;
        item.classList.toggle('filtered-out', !match);
      });
    });
  }

  // ---------- история ----------
  function renderHistory() {
    var days = loadDays();
    var keys = Object.keys(days).filter(function (k) { return days[k].closed; }).sort().reverse();
    var root = $('history-list');
    if (!keys.length) {
      root.innerHTML = '<div class="text-muted" style="padding:2rem 0;text-align:center">Пока нет закрытых дней.</div>';
      return;
    }
    root.innerHTML = keys.map(function (k) {
      var d = days[k];
      var total = d.scales.body + d.scales.head + d.scales.spirit;
      var j = d.journal || {};
      return '<div class="history-item">' +
        '<div class="history-row" data-expand="' + k + '">' +
        '<span>' + k + ' — ' + total + '/30' +
        (j.main ? ' · ' + escapeHtml(j.main.slice(0, 40)) : '') + '</span>' +
        '<button class="history-del" data-del-day="' + k + '">✕</button></div>' +
        '<div class="history-detail card" data-detail="' + k + '" hidden>' +
        '<p><b>Главное:</b> ' + escapeHtml(j.main || '—') + '</p>' +
        '<p><b>Что вымотало:</b> ' + escapeHtml(j.drain || '—') + '</p>' +
        '<p><b>Переношу на завтра:</b> ' + escapeHtml(j.tomorrow || '—') + '</p>' +
        '<p><b>Отпускаю:</b> ' + escapeHtml(j.release || '—') + '</p>' +
        '</div></div>';
    }).join('');
    $$('[data-expand]', root).forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('.history-del')) return;
        var detail = root.querySelector('[data-detail="' + row.dataset.expand + '"]');
        detail.hidden = !detail.hidden;
      });
    });
    $$('[data-del-day]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.delDay;
        var isToday = key === todayISO();
        var msg = isToday
          ? 'Убрать закрытие за сегодня? Ритуал и якоря останутся, вечерний журнал очистится.'
          : 'Удалить запись за ' + key + '?';
        confirmDialog(msg, 'Удалить').then(function (ok) {
          if (!ok) return;
          var d = loadDays();
          if (isToday) {
            if (d[key]) { d[key].closed = false; d[key].journal = null; }
          } else {
            delete d[key];
          }
          saveDays(d);
          renderHistory();
        });
      });
    });
  }

  // ---------- экспорт ----------
  function wireExport() {
    $('export-btn').addEventListener('click', function () {
      var data = {
        exportedAt: new Date().toISOString(),
        days: loadDays(),
        protocols: loadProtocols()
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sobrannyi-hozyain-' + todayISO() + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast('Файл выгружен');
    });
  }

  // ---------- more screen hook ----------
  function wireMoreHooks() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-goto]');
      if (!el) return;
      if (el.dataset.goto === 'history') renderHistory();
    });
  }

  // ---------- telegram-логин (гейт спит, пока не задеплоен /api/*) ----------
  function checkAuth() {
    return fetch('/api/me', { credentials: 'same-origin' })
      .then(function (res) {
        if (res.status === 200) return true;   // валидная сессия — пускаем
        if (res.status === 401) return false;  // бэкенд есть, сессии нет — показать гейт
        return true;                            // любой другой статус — не блокировать
      })
      .catch(function () { return true; });     // бэкенда ещё нет — не блокировать
  }

  function renderTelegramWidget() {
    var box = $('telegram-login-box');
    if (!box || box.dataset.rendered) return;
    box.dataset.rendered = '1';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.setAttribute('data-telegram-login', 'zima_app_bot'); // TODO: подтвердить с Алексеем — этот бот уже занят task.zima.spa, см. deploy/telegram-login.md
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-userpic', 'false');
    s.setAttribute('data-onauth', 'onTelegramAuth(user)');
    s.setAttribute('data-request-access', 'write');
    box.appendChild(s);
  }

  window.onTelegramAuth = function (user) {
    fetch('/api/telegram-auth', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).then(function (res) {
      if (res.ok) { location.reload(); return; }
      if (res.status === 403) {
        $('login-hint').textContent = 'Этот аккаунт уже занят другим Telegram-пользователем.';
      } else {
        $('login-hint').textContent = 'Не получилось войти. Попробуй ещё раз.';
      }
    }).catch(function () {
      $('login-hint').textContent = 'Не получилось войти. Попробуй ещё раз.';
    });
  };

  // ---------- service worker ----------
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  // ---------- init ----------
  function enterApp() {
    var day = ensureToday();
    if (!day.ritualDone) {
      showScreen('gap');
    } else {
      renderToday();
      showScreen('today');
    }
  }

  function init() {
    registerServiceWorker();
    wireGoto();
    wireRitual();
    wireTodayChecks();
    wireClose();
    wireSpeech();
    wireProtocols();
    wirePhotos();
    wireReference();
    wireExport();
    wireMoreHooks();
    renderProtoHistory();

    checkAuth().then(function (ok) {
      if (ok) {
        enterApp();
      } else {
        renderTelegramWidget();
        showScreen('login');
      }
    });

    console.log('%c[Собранный Хозяин v2] Загружено', 'color:#888');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
