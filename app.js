// =====================================================================
//  Тренажёр «Калькулятор»: движок
// =====================================================================

const TEACHER = /teacher/i.test(location.search + location.hash);
const IDX = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));
const STORE = 'calc-trainer-v1';
const PROMPT = 'PS C:\\Users\\Ученик\\Desktop\\calculator>';

const S = { cur: 0, done: false, name: '', login: 'student', typed: {} };
const UI = { menu: null, folderDraft: false, openDialog: false, trust: false, picked: null, newFile: false, termMenu: false, termErr: [], lastDoc: '', tries: 0, testTimer: null };

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const step = () => STEPS[S.cur];
const isDone = (i) => i < S.cur || (i === S.cur && S.done);
const doneId = (id) => isDone(IDX[id]);
const sub = (s) => String(s).replace(/\{login\}/g, S.login);

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (d) Object.assign(S, d);
  } catch (e) { /* без сохранения тоже работаем */ }
  if (S.cur >= STEPS.length) S.cur = STEPS.length - 1;
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* ничего */ }
}

// ───────────── Файлы проекта ─────────────
function fileCreated(name) {
  const st = STEPS.find((s) => s.kind === 'newfile' && s.file === name);
  return st ? doneId(st.id) : false;
}
function blockText(b) {
  let text = null;
  for (const [id, t] of b.v) if (doneId(id)) text = t;
  return text;
}
function oldText(b) {
  // текст блока до текущего шага (для замены строки)
  let text = null;
  for (const [id, t] of b.v) if (IDX[id] < S.cur) text = t;
  return text;
}
const indent = (text, n) => text.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
function buildFile(name) {
  return FILES[name].map((b) => { const t = blockText(b); return t === null ? null : indent(t, b.i); })
    .filter((t) => t !== null).join('\n');
}
function createdFiles() {
  return STEPS.filter((s) => s.kind === 'newfile' && doneId(s.id)).map((s) => s.file);
}
function activeFile() {
  const st = step();
  if (st.file && (st.kind !== 'newfile' || S.done)) return st.file;
  for (let i = S.cur - 1; i >= 0; i--) if (STEPS[i].file) return STEPS[i].file;
  return null;
}

// ───────────── Подсветка кода ─────────────
function highlight(code, file) {
  const ext = (file || '').split('.').pop();
  const rules = {
    html: /(<!--[\s\S]*?-->)|(<\/?[!\w-]+)|(\s[\w-]+)(?==)|("[^"]*"|'[^']*')|(\/?>)/g,
    css: /(\/\*[\s\S]*?\*\/)|(^[^{}\n:]+(?=\s*\{))|([\w-]+)(?=\s*:)|("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,6}\b|\b\d+(?:px|fr|%)?)/gm,
    js: /(\/\/.*)|(\b(?:let|function|if|else|return)\b)|([\w]+)(?=\()|("[^"]*"|'[^']*')|(\b\d+\b)/g,
    md: /(^#.*)|(^\s*[-*] )|(\*\*[^*]+\*\*)|()|()/gm,
  };
  const cls = {
    html: ['cm', 'tag', 'attr', 'str', 'tag'],
    css: ['cm', 'sel', 'prop', 'str', 'num'],
    js: ['cm', 'kw', 'fn', 'str', 'num'],
    md: ['tag', 'kw', 'str', '', ''],
  };
  const re = rules[ext];
  if (!re) return esc(code);
  let out = '', last = 0, m;
  re.lastIndex = 0;
  while ((m = re.exec(code))) {
    if (m[0] === '') { re.lastIndex++; continue; }
    out += esc(code.slice(last, m.index));
    const g = m.slice(1).findIndex((x) => x !== undefined);
    out += `<span class="hl-${cls[ext][g]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

// ───────────── Проверка набранного кода ─────────────
function norm(s) {
  return s.replace(/[«»“”„]/g, "'").replace(/"/g, "'").replace(/÷/g, '/').replace(/×/g, '*').replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ').replace(/ ?([{}();,:=<>+*\/\[\]-]) ?/g, '$1').trim();
}
const count = (s, re) => (s.match(re) || []).length;

function diagnose(got, want) {
  if (!got.trim()) return 'Набери образец в жёлтом поле.';
  const g = norm(got), w = norm(want);
  if (g === w) return null;
  const cyrGot = count(got, /[а-яё]/gi), cyrWant = count(want, /[а-яё]/gi);
  if (cyrGot > cyrWant) return 'Похоже, часть кода набрана русскими буквами. Переключи раскладку (Alt+Shift) и проверь слова.';
  if (g.toLowerCase() === w.toLowerCase()) return 'Почти! Проверь большие и маленькие буквы — для компьютера это разные буквы.';
  if (count(got, /['"«»]/g) % 2) return 'Одна кавычка не закрыта. Кавычки всегда парные.';
  for (const [o, c, name] of [['<', '>', 'угловые скобки < >'], ['{', '}', 'фигурные скобки { }'], ['(', ')', 'круглые скобки ( )']]) {
    if (count(want, new RegExp('\\' + o, 'g')) !== count(got, new RegExp('\\' + o, 'g')) ||
        count(want, new RegExp('\\' + c, 'g')) !== count(got, new RegExp('\\' + c, 'g'))) {
      return `Проверь ${name}: их должно быть столько же, сколько в образце.`;
    }
  }
  if (count(got, /;/g) < count(want, /;/g)) return 'Не хватает точки с запятой ; в конце строки.';
  let i = 0;
  while (i < g.length && g[i] === w[i]) i++;
  const from = Math.max(0, i - 12);
  return `Сравни с образцом вот здесь:<br><code>…${esc(w.slice(from, i))}<mark>${esc(w.slice(i, i + 6) || ' ')}</mark>…</code> — образец<br><code>…${esc(g.slice(from, i))}<mark class="bad">${esc(g.slice(i, i + 6) || ' ')}</mark>…</code> — у тебя`;
}

// ───────────── Предпросмотр сайта ─────────────
function siteDoc() {
  if (!fileCreated('index.html')) return '';
  let html = buildFile('index.html');
  html = html.replace(/<link rel="stylesheet" href="style\.css">/, `<style>${buildFile('style.css')}</style>`);
  html = html.replace(/<script src="script\.js"><\/script>/, `<script>${buildFile('script.js')}<\/script>`);
  return html;
}
function siteTitle() {
  const m = buildFile('index.html').match(/<title>(.*?)<\/title>/);
  return m ? m[1] : 'index.html';
}

// ───────────── Отрисовка ─────────────
function render() {
  renderHeader();
  renderLeft();
  renderScene();
  save();
}

function renderHeader() {
  const st = step();
  $('#stages').innerHTML = STAGES.map((sg) => {
    const ids = STEPS.map((s, i) => [s, i]).filter(([s]) => s.stage === sg.id);
    const passed = ids.filter(([, i]) => isDone(i)).length;
    const cls = sg.id === st.stage ? 'cur' : passed === ids.length ? 'ok' : '';
    const dots = TEACHER ? `<span class="tdots">${ids.map(([s, i]) => `<button data-jump="${i}" class="${i === S.cur ? 'on' : isDone(i) ? 'ok' : ''}" title="${esc(s.title)}"></button>`).join('')}</span>` : '';
    return `<div class="stage ${cls}"><b>${esc(sg.name)}</b><span class="cnt">${passed}/${ids.length}</span>${dots}</div>`;
  }).join('');
  $('#playerName').textContent = S.name;
  document.querySelectorAll('[data-jump]').forEach((b) => b.onclick = () => jump(+b.dataset.jump));
}

function renderLeft() {
  const st = step();
  const total = STEPS.length;
  $('#stepNo').textContent = `Шаг ${S.cur + 1} из ${total} · ${st.title}`;
  $('#bubble').innerHTML = S.done ? esc(st.win || '') : esc(sub(st.say));
  const sample = st.type && ['code', 'cmd', 'emmet'].includes(st.kind);
  $('#sample').classList.toggle('hidden', !sample || S.done);
  if (sample) $('#sampleCode').innerHTML = highlight(sub(st.type), st.kind === 'cmd' ? '' : st.file);
  $('#feedback').innerHTML = '';
  $('#feedback').className = 'feedback';
  const canCheck = st.kind === 'code' && !S.done;
  $('#checkBtn').classList.toggle('hidden', !canCheck);
  $('#nextBtn').classList.toggle('hidden', !S.done || st.kind === 'finish');
  $('#diplomaBtn').classList.toggle('hidden', st.kind !== 'finish');
  $('#keyHint').innerHTML = keyHint(st);
  const tn = $('#teacherNote');
  tn.classList.toggle('hidden', !TEACHER);
  if (TEACHER) {
    tn.innerHTML = `<div class="tn-head">Для преподавателя</div><p>${esc(st.t || '')}</p>` +
      (S.done ? '' : '<button class="link" id="solveBtn">Подставить ответ</button>') +
      ' <a class="link" href="metodichka.html" target="_blank">Методичка</a>';
    const sb = $('#solveBtn');
    if (sb) sb.onclick = teacherSolve;
  }
}

function keyHint(st) {
  if (S.done) return st.kind === 'finish' ? '' : 'Enter — дальше';
  if (st.kind === 'code') return st.type.includes('\n') ? 'Ctrl+Enter — проверить · Tab — отступ' : 'Enter — проверить';
  if (st.kind === 'cmd') return 'Набери команду в терминале внизу и нажми Enter';
  return '';
}

function feedback(html, ok) {
  const f = $('#feedback');
  f.innerHTML = html;
  f.className = 'feedback ' + (ok ? 'ok' : 'bad');
}

// ───────────── Сцены ─────────────
function renderScene() {
  const st = step();
  clearInterval(UI.testTimer);
  const scene = $('#scene');
  scene.className = 'scene scene-' + st.scene;
  if (st.scene === 'desktop') return renderDesktop(scene);
  if (st.scene === 'github') return renderGithub(scene);
  if (st.scene === 'repo') return renderRepo(scene);
  renderVscode(scene);
}

// ---------- Рабочий стол ----------
function renderDesktop(scene) {
  const folderDone = doneId('folder');
  scene.innerHTML = `
    <div class="desktop" id="desk">
      <div class="dicon"><div class="ic-bin"></div><span>Корзина</span></div>
      <div class="dicon"><div class="ic-pc"></div><span>Этот компьютер</span></div>
      ${folderDone ? '<div class="dicon"><div class="ic-folder"></div><span>calculator</span></div>' : ''}
      ${UI.folderDraft ? '<div class="dicon"><div class="ic-folder"></div><input id="folderName" value="Новая папка" spellcheck="false"></div>' : ''}
      ${!folderDone && !UI.folderDraft ? '<div class="desk-hint">правая кнопка мыши на пустом месте</div>' : ''}
      <div class="ctx hidden" id="ctx"></div>
    </div>
    <div class="taskbar"><span class="win"></span><span class="tb-app"></span><span class="tb-app"></span><span class="clock">10:30</span></div>`;
  const desk = $('#desk');
  desk.oncontextmenu = (e) => {
    e.preventDefault();
    if (folderDone || UI.folderDraft) return;
    const r = desk.getBoundingClientRect();
    showCtx(e.clientX - r.left, e.clientY - r.top);
  };
  desk.onclick = (e) => { if (!e.target.closest('.ctx')) $('#ctx').classList.add('hidden'); };
  const inp = $('#folderName');
  if (inp) {
    inp.focus(); inp.select();
    inp.onkeydown = (e) => {
      if (e.key !== 'Enter') return;
      const v = inp.value.trim();
      if (v === 'calculator') { UI.folderDraft = false; succeed(); }
      else if (v.toLowerCase() === 'calculator') feedback('Имя пишем маленькими буквами: <code>calculator</code>.');
      else if (/[а-яё]/i.test(v)) feedback('Имя папки — латиницей (английскими буквами): <code>calculator</code>.');
      else feedback('Папка должна называться <code>calculator</code>.');
    };
  }
}
function showCtx(x, y) {
  const ctx = $('#ctx');
  ctx.innerHTML = `
    <div class="ci dim">Вид</div><div class="ci dim">Сортировка</div><div class="ci dim">Обновить</div><hr>
    <div class="ci sub" id="ctxNew">Создать <span>›</span>
      <div class="ctx sub-menu">
        <div class="ci" id="ctxFolder">Папку</div><div class="ci dim">Ярлык</div><div class="ci dim">Текстовый документ</div>
      </div>
    </div><hr><div class="ci dim">Персонализация</div>`;
  ctx.style.left = Math.min(x, ctx.parentElement.clientWidth - 200) + 'px';
  ctx.style.top = Math.min(y, ctx.parentElement.clientHeight - 220) + 'px';
  ctx.classList.remove('hidden');
  $('#ctxNew').onclick = (e) => { e.stopPropagation(); $('#ctxNew').classList.add('open'); };
  $('#ctxFolder').onclick = (e) => {
    e.stopPropagation();
    UI.folderDraft = true;
    renderDesktop($('#scene'));
  };
}

// ---------- VS Code ----------
function renderVscode(scene) {
  const st = step();
  const opened = doneId('open');
  scene.innerHTML = `
    <div class="win vscode">
      <div class="vs-title"><span class="vs-logo"></span>${opened ? esc((activeFile() ? activeFile() + ' — ' : '') + 'calculator') : 'Добро пожаловать'} — Visual Studio Code</div>
      <div class="vs-menu">
        <span>Файл</span><span>Правка</span><span>Выделение</span><span>Вид</span><span>Переход</span><span>Выполнить</span>
        <span class="term-menu ${st.kind === 'terminal' && !S.done ? 'pulse' : ''}" id="termMenu">Терминал
          <div class="dropdown ${UI.termMenu ? '' : 'hidden'}"><div class="ci" id="newTerm">Создать терминал <i>Ctrl+Shift+\`</i></div><div class="ci dim">Разделить терминал</div></div>
        </span><span>Справка</span>
      </div>
      <div class="vs-body">${opened ? vsWorkbench() : vsWelcome()}</div>
    </div>
    <div class="win browser">
      <div class="br-tabs"><div class="br-tab">${esc(fileCreated('index.html') ? siteTitle() : 'Новая вкладка')}</div></div>
      <div class="br-bar"><span class="br-nav">‹ › ↻</span><div class="br-addr">${fileCreated('index.html') ? 'C:/Users/Ученик/Desktop/calculator/index.html' : ''}</div></div>
      <div class="br-page">${fileCreated('index.html') ? '<iframe id="preview" title="Твой сайт"></iframe>' : '<div class="br-empty">Здесь будет твой сайт</div>'}</div>
    </div>`;

  // меню «Терминал»
  $('#termMenu').onclick = (e) => {
    if (e.target.closest('#newTerm')) {
      UI.termMenu = false;
      if (st.kind === 'terminal' && !S.done) return succeed();
      return renderScene();
    }
    UI.termMenu = !UI.termMenu;
    $('#termMenu .dropdown').classList.toggle('hidden', !UI.termMenu);
  };

  if (!opened) return bindWelcome();
  bindWorkbench();
  updatePreview();
}

function vsWelcome() {
  return `
    <div class="welcome-vs">
      <h2>Visual Studio Code</h2>
      <p class="muted">Редактирование с изменениями</p>
      <h3>Запуск</h3>
      <div class="vs-link dim">Создать файл…</div>
      <div class="vs-link dim">Открыть файл…</div>
      <div class="vs-link ${step().kind === 'open' ? 'pulse' : ''}" id="openFolder">Открыть папку…</div>
    </div>
    ${UI.openDialog ? `
      <div class="dialog">
        <div class="dlg-title">Открыть папку</div>
        <div class="dlg-body">
          <div class="dlg-side"><div class="on">Рабочий стол</div><div>Документы</div><div>Загрузки</div></div>
          <div class="dlg-list">
            ${['calculator', 'Домашка', 'Фото', 'Игры'].map((n) => `<div class="dlg-item ${UI.picked === n ? 'sel' : ''}" data-pick="${n}"><span class="ic-folder sm"></span>${n}</div>`).join('')}
          </div>
        </div>
        <div class="dlg-foot"><span>Папка: <b>${esc(UI.picked || '')}</b></span><button id="pickBtn" ${UI.picked ? '' : 'disabled'}>Выбор папки</button><button id="cancelBtn">Отмена</button></div>
      </div>` : ''}
    ${UI.trust ? `
      <div class="dialog trust">
        <div class="dlg-body col"><b>Доверяете ли вы авторам файлов в этой папке?</b>
        <p>Это ваша папка calculator.</p>
        <div><button id="trustYes" class="primary">Да, я доверяю авторам</button> <button id="trustNo">Нет, я не доверяю авторам</button></div></div>
      </div>` : ''}`;
}
function bindWelcome() {
  const of = $('#openFolder');
  if (of) of.onclick = () => { if (step().kind === 'open') { UI.openDialog = true; renderScene(); } };
  document.querySelectorAll('[data-pick]').forEach((el) => el.onclick = () => { UI.picked = el.dataset.pick; renderScene(); });
  const pb = $('#pickBtn');
  if (pb) pb.onclick = () => {
    if (UI.picked !== 'calculator') return feedback('Нам нужна папка <code>calculator</code> — та, что мы создали.');
    UI.openDialog = false; UI.trust = true; renderScene();
  };
  const cb = $('#cancelBtn');
  if (cb) cb.onclick = () => { UI.openDialog = false; renderScene(); };
  const ty = $('#trustYes');
  if (ty) ty.onclick = () => { UI.trust = false; succeed(); };
  const tn = $('#trustNo');
  if (tn) tn.onclick = () => feedback('Это твоя папка, ей можно доверять. Нажми «Да».');
}

function vsWorkbench() {
  const st = step();
  const files = createdFiles().slice().sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const act = activeFile();
  const newFileMode = st.kind === 'newfile' && !S.done;
  const termOpen = doneId('terminal');
  return `
    <div class="vs-activity"><i class="a-files on"></i><i class="a-search"></i><i class="a-git"></i></div>
    <div class="vs-side">
      <div class="side-title">ПРОВОДНИК</div>
      <div class="folder-row">∨ CALCULATOR
        <span class="tools"><button class="tool-newfile ${newFileMode ? 'pulse' : ''}" id="newFileBtn" title="Новый файл"></button><button class="tool-newdir" title="Новая папка"></button></span>
      </div>
      ${files.map((f) => `<div class="file-row ${f === act ? 'on' : ''}">${fileIcon(f)}${esc(f)}</div>`).join('')}
      ${UI.newFile ? `<div class="file-row edit">${fileIcon('')}<input id="newFileName" spellcheck="false"></div>` : ''}
    </div>
    <div class="vs-main">
      <div class="vs-tabs">${files.length ? createdFiles().map((f) => `<div class="vs-tab ${f === act ? 'on' : ''}">${fileIcon(f)}${esc(f)}</div>`).join('') : ''}</div>
      <div class="editor" id="editor">${act ? editorHtml(act) : '<div class="editor-empty">Создай файл слева — значок «Новый файл»</div>'}</div>
      ${termOpen ? terminalHtml() : ''}
    </div>`;
}
function fileIcon(f) {
  const ext = f.split('.').pop();
  const map = { html: ['&lt;&gt;', 'fi-html'], css: ['#', 'fi-css'], js: ['JS', 'fi-js'], md: ['i', 'fi-md'] };
  const [t, c] = map[ext] || ['·', 'fi-none'];
  return `<span class="fi ${c}">${t}</span>`;
}

function editorHtml(file) {
  const st = step();
  const typing = ['code', 'emmet'].includes(st.kind) && st.file === file && !S.done;
  const rows = [];
  for (const b of FILES[file]) {
    const isTarget = typing && b.id === st.block;
    const text = isTarget ? oldText(b) : blockText(b);
    if (isTarget) {
      if (text !== null) indent(text, b.i).split('\n').forEach((l) => rows.push({ html: `<span class="old">${esc(l)}</span>` }));
      rows.push({ input: true, ind: b.i });
      continue;
    }
    if (text === null) continue;
    indent(text, b.i).split('\n').forEach((l) => rows.push({ html: highlight(l, file) }));
  }
  if (!rows.length) rows.push({ html: '' });
  let n = 0;
  return rows.map((r) => {
    if (r.input) {
      const lines = Math.max((st.type || '').split('\n').length, 1);
      n += lines;
      return `<div class="ln-row input-row"><span class="ln"></span><textarea id="codeInput" class="code-input" rows="${lines}" spellcheck="false" autocomplete="off" style="margin-left:${r.ind}ch" placeholder="${st.kind === 'emmet' ? '!' : 'набери образец здесь'}"></textarea></div>`;
    }
    n++;
    return `<div class="ln-row"><span class="ln">${n}</span><span class="code-line">${r.html || ' '}</span></div>`;
  }).join('');
}

function terminalHtml() {
  const st = step();
  const lines = [];
  STEPS.forEach((s, i) => {
    if (s.kind !== 'cmd' || !isDone(i)) return;
    const cmd = S.typed[s.id] || sub(s.type);
    lines.push(`<div><span class="pr">${esc(PROMPT)}</span> ${esc(cmd)}</div>`);
    if (s.out) {
      const msg = (cmd.match(/-m ["'](.+)["']/) || [])[1] || '';
      lines.push(`<div class="out">${esc(sub(s.out).replace('{msg}', msg))}</div>`);
    }
  });
  UI.termErr.forEach((e) => lines.push(e));
  const active = st.kind === 'cmd' && !S.done;
  return `
    <div class="terminal">
      <div class="term-head"><span class="on">ТЕРМИНАЛ</span><span>ПРОБЛЕМЫ</span><span>ВЫХОДНЫЕ ДАННЫЕ</span></div>
      <div class="term-body" id="termBody">${lines.join('')}
        <div class="term-line"><span class="pr">${esc(PROMPT)}</span> ${active ? '<input id="termInput" spellcheck="false" autocomplete="off">' : ''}</div>
      </div>
    </div>`;
}

function bindWorkbench() {
  const st = step();
  const nb = $('#newFileBtn');
  if (nb) nb.onclick = () => {
    if (st.kind !== 'newfile' || S.done) return feedback('Новый файл сейчас не нужен.');
    UI.newFile = true; renderScene();
  };
  const nf = $('#newFileName');
  if (nf) {
    nf.focus();
    nf.onkeydown = (e) => {
      if (e.key === 'Escape') { UI.newFile = false; return renderScene(); }
      if (e.key !== 'Enter') return;
      const v = nf.value.trim();
      if (v === st.file) { UI.newFile = false; succeed(); }
      else if (v.toLowerCase() === st.file.toLowerCase()) feedback(`Имя файла — маленькими буквами: <code>${st.file}</code>.`);
      else if (!v.includes('.')) feedback(`Не забудь расширение после точки: <code>${st.file}</code>.`);
      else feedback(`Файл должен называться <code>${st.file}</code>.`);
    };
  }
  const ci = $('#codeInput');
  if (ci) {
    bindCodeInput(ci);
    ci.focus({ preventScroll: true });
    const ed = $('#editor');
    ed.scrollTop = ci.offsetTop - ed.offsetTop - ed.clientHeight / 3;
  }
  const ti = $('#termInput');
  if (ti) {
    ti.focus();
    ti.onkeydown = (e) => { if (e.key === 'Enter') runCommand(ti.value); };
    ti.onpaste = blockPaste;
    const tb = $('#termBody');
    tb.scrollTop = tb.scrollHeight;
  }
  if (st.kind === 'test' && !S.done) startTestWatch();
}

function blockPaste(e) {
  if (TEACHER) return;
  e.preventDefault();
  feedback('Набери руками — так лучше запоминается.');
}

function bindCodeInput(ci) {
  const st = step();
  const multi = st.kind === 'code' && st.type.includes('\n');
  const grow = () => { ci.rows = Math.max(st.type.split('\n').length, ci.value.split('\n').length); };
  ci.onpaste = blockPaste;
  ci.oninput = grow;
  ci.onkeydown = (e) => {
    if (st.kind === 'emmet') {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const v = ci.value.trim();
        if (v === '!' || v === 'html:5') succeed();
        else feedback('Набери только один знак <code>!</code> и нажми Enter.');
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText(ci, '    ');
    } else if (e.key === 'Enter' && (e.ctrlKey || !multi)) {
      e.preventDefault();
      check();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const before = ci.value.slice(0, ci.selectionStart);
      const line = before.split('\n').pop();
      let ind = line.match(/^ */)[0];
      if (/\{\s*$/.test(line)) ind += '    ';
      insertText(ci, '\n' + ind);
      grow();
    } else if (e.key === '}') {
      const before = ci.value.slice(0, ci.selectionStart);
      const line = before.split('\n').pop();
      if (/^ {4,}$/.test(line)) {
        e.preventDefault();
        ci.setRangeText('}', ci.selectionStart - 4, ci.selectionStart, 'end');
      }
    }
  };
}
function insertText(el, text) {
  el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end');
}

function check() {
  const st = step();
  const ci = $('#codeInput');
  if (!ci) return;
  const msg = diagnose(ci.value, st.type);
  if (msg) {
    UI.tries++;
    return feedback(msg);
  }
  succeed();
}

function runCommand(raw) {
  const st = step();
  const cmd = raw.replace(/[«»“”„]/g, '"').replace(/\s+/g, ' ').trim();
  if (!cmd) return;
  const want = sub(st.type);
  const ok = st.match ? st.match.test(cmd) : cmd.toLowerCase() === want.toLowerCase();
  if (ok) {
    S.typed[st.id] = cmd;
    if (st.login) return showGitLogin();
    return succeed();
  }
  UI.termErr.push(`<div><span class="pr">${esc(PROMPT)}</span> ${esc(cmd)}</div>`);
  const first = cmd.split(' ')[0];
  let out;
  if (first.toLowerCase() === 'git' && first !== 'git') out = 'Команды пишутся маленькими буквами: git.';
  else if (/[а-яё]/i.test(cmd.replace(/["'][^"']*["']/g, ''))) out = 'Похоже, включена русская раскладка. Переключи на английскую (Alt+Shift).';
  else if (first !== 'git') out = `${first}: команда не найдена`;
  else if (st.id === 'add' && cmd === 'git add') out = 'Nothing specified, nothing added.';
  else if (st.id === 'remote' && cmd.startsWith('git remote add origin')) out = 'Адрес не совпадает с твоим репозиторием.';
  else out = `git: команда записана неверно`;
  UI.termErr.push(`<div class="out err">${esc(out)}</div>`);
  renderScene();
  const d = diagnose(cmd, want.replace(/"[^"]*"/, (m) => (cmd.match(/"[^"]*"/) || [m])[0]));
  feedback(d || 'Сравни команду с образцом.');
}

function showGitLogin() {
  const m = $('#modal');
  m.innerHTML = `
    <div class="gh-login">
      <div class="gh-mark"></div>
      <b>Connect to GitHub</b>
      <p>Git просит войти в твой аккаунт GitHub.</p>
      <button class="gh-btn" id="ghSign">Sign in with your browser</button>
    </div>`;
  m.classList.remove('hidden');
  $('#ghSign').onclick = () => { m.classList.add('hidden'); succeed(); };
}

function startTestWatch() {
  UI.testTimer = setInterval(() => {
    try {
      const d = $('#preview').contentDocument.getElementById('display');
      if (d && d.value === '42') { clearInterval(UI.testTimer); succeed(); }
    } catch (e) { /* ждём */ }
  }, 300);
}

function updatePreview() {
  const fr = $('#preview');
  if (!fr) return;
  fr.srcdoc = siteDoc() || '<body></body>';
}

// ---------- GitHub: новый репозиторий ----------
function renderGithub(scene) {
  scene.innerHTML = `
    <div class="win browser gh">
      <div class="br-tabs"><div class="br-tab">New repository</div></div>
      <div class="br-bar"><span class="br-nav">‹ › ↻</span><div class="br-addr">https://github.com/new</div></div>
      <div class="br-page gh-page">
        <div class="gh-top"><span class="gh-mark sm"></span> <b>GitHub</b></div>
        <div class="gh-form">
          <h2>Create a new repository</h2>
          <div class="gh-row">
            <label>Owner *<div class="gh-owner">${esc(S.login)}</div></label>
            <span class="slash">/</span>
            <label>Repository name *<input id="repoName" spellcheck="false"></label>
          </div>
          <label>Description <span class="muted">(optional)</span><input></label>
          <hr>
          <label class="radio"><input type="radio" name="vis" value="public" id="visPublic"> <b>Public</b><br><span class="muted">Anyone on the internet can see this repository.</span></label>
          <label class="radio"><input type="radio" name="vis" value="private"> <b>Private</b><br><span class="muted">You choose who can see and commit to this repository.</span></label>
          <hr>
          <div class="muted">Initialize this repository with:</div>
          <label class="check"><input type="checkbox" id="readmeBox"> Add a README file</label>
          <hr>
          <button class="gh-create" id="createRepo">Create repository</button>
        </div>
      </div>
    </div>`;
  $('#repoName').focus();
  $('#createRepo').onclick = () => {
    const name = $('#repoName').value.trim();
    if (name !== 'calculator') return feedback('Имя репозитория — <code>calculator</code>, маленькими буквами.');
    if (!$('#visPublic').checked) return feedback('Выбери <b>Public</b> — чтобы проект было видно и потом можно было включить сайт.');
    if ($('#readmeBox').checked) return feedback('Сними галочку README: он у нас уже есть в коммите. С галочкой <code>git push</code> выдаст ошибку.');
    succeed();
  };
}

// ---------- GitHub: страница проекта ----------
function renderRepo(scene) {
  const files = ['README.md', 'index.html', 'script.js', 'style.css'];
  const msg = (S.typed.commit || '').match(/-m ["'](.+)["']/);
  scene.innerHTML = `
    <div class="win browser gh">
      <div class="br-tabs"><div class="br-tab">${esc(S.login)}/calculator</div></div>
      <div class="br-bar"><span class="br-nav">‹ › ↻</span><div class="br-addr">https://github.com/${esc(S.login)}/calculator</div></div>
      <div class="br-page gh-page">
        <div class="gh-top"><span class="gh-mark sm"></span> <b>${esc(S.login)} / calculator</b> <span class="badge">Public</span></div>
        <div class="gh-files">
          <div class="gh-files-head"><b>${esc(S.name || S.login)}</b> ${esc(msg ? msg[1] : 'Мой калькулятор')}<span class="muted">1 commit</span></div>
          ${files.map((f) => `<div class="gh-file"><span class="ic-file"></span>${f}<span class="muted">${esc(msg ? msg[1] : 'Мой калькулятор')}</span></div>`).join('')}
        </div>
        <div class="gh-readme">
          <div class="gh-readme-head">README</div>
          <h1>Калькулятор</h1>
          <p>Мой первый сайт на HTML, CSS и JavaScript.</p>
        </div>
      </div>
    </div>`;
}

// ───────────── Переходы ─────────────
function succeed() {
  S.done = true;
  UI.tries = 0;
  UI.termErr = [];
  render();
  feedback('Верно!', true);
  $('#nextBtn').focus();
}
function next() {
  if (!S.done || S.cur >= STEPS.length - 1) return;
  S.cur++;
  S.done = false;
  Object.assign(UI, { menu: null, folderDraft: false, openDialog: false, trust: false, picked: null, newFile: false, termMenu: false, termErr: [] });
  render();
}
function jump(i) {
  S.cur = i;
  S.done = false;
  Object.assign(UI, { folderDraft: false, openDialog: false, trust: false, picked: null, newFile: false, termMenu: false, termErr: [] });
  render();
}

function teacherSolve() {
  const st = step();
  if (st.kind === 'code' || st.kind === 'emmet') {
    const ci = $('#codeInput');
    if (ci) { ci.value = st.type; ci.rows = st.type.split('\n').length; ci.focus(); }
    return;
  }
  if (st.kind === 'cmd') {
    const ti = $('#termInput');
    if (ti) { ti.value = sub(st.type); ti.focus(); }
    return;
  }
  if (st.kind === 'finish') return;
  succeed();
}

// ───────────── Диплом и скачивание ─────────────
function showDiploma() {
  const m = $('#modal');
  const date = new Date().toLocaleDateString('ru-RU');
  m.innerHTML = `
    <div class="diploma">
      <div class="dip-title">Диплом</div>
      <div class="dip-name">${esc(S.name || 'Ученик')}</div>
      <p>прошёл(-ла) тренажёр «Калькулятор на HTML, CSS и JavaScript»</p>
      <ul>
        <li>создал(-а) проект и файлы в VS Code</li>
        <li>сверстал(-а) калькулятор на HTML и оформил(-а) его на CSS</li>
        <li>написал(-а) логику на JavaScript</li>
        <li>отправил(-а) проект на GitHub командами Git</li>
      </ul>
      <div class="dip-date">${date}</div>
      <div class="dip-actions">
        <button class="next" id="dlBtn">Скачать мой код</button>
        <button class="next" id="againBtn">Пройти заново</button>
        <button class="link" id="closeDip">Закрыть</button>
      </div>
    </div>`;
  m.classList.remove('hidden');
  $('#dlBtn').onclick = downloadAll;
  $('#againBtn').onclick = resetAll;
  $('#closeDip').onclick = () => m.classList.add('hidden');
}
function downloadAll() {
  ['index.html', 'style.css', 'script.js', 'README.md'].forEach((f, i) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([buildFile(f) + '\n'], { type: 'text/plain' }));
      a.download = f;
      a.click();
    }, i * 400);
  });
}
function resetAll() {
  if (!confirm('Начать тренажёр заново? Прогресс сотрётся.')) return;
  try { localStorage.removeItem(STORE); } catch (e) { /* ничего */ }
  location.reload();
}

// ───────────── Старт ─────────────
function start() {
  load();
  if (TEACHER) {
    document.body.classList.add('teacher');
    if (!S.name) S.name = 'Преподаватель';
    // ссылка сразу на шаг: index.html?teacher#step=jsCalc
    const m = location.hash.match(/step=(\w+)/);
    if (m && m[1] in IDX) { S.cur = IDX[m[1]]; S.done = false; }
  }
  $('#resetBtn').onclick = resetAll;
  $('#checkBtn').onclick = check;
  $('#nextBtn').onclick = next;
  $('#diplomaBtn').onclick = showDiploma;
  // Enter — «Дальше». Не срабатывает на том же нажатии, которым ответ проверили в поле,
  // и на кнопках (там Enter и так нажимает кнопку).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !S.done || step().kind === 'finish') return;
    if (e.target.closest('input, textarea, button')) return;
    if (!$('#modal').classList.contains('hidden')) return;
    e.preventDefault();
    next();
  });
  if (S.name) {
    $('#welcome').classList.add('hidden');
    return render();
  }
  ['#nameInput', '#loginInput'].forEach((id) => $(id).onkeydown = (e) => { if (e.key === 'Enter') $('#startBtn').click(); });
  $('#startBtn').onclick = () => {
    const name = $('#nameInput').value.trim();
    const login = $('#loginInput').value.trim();
    if (!name) return $('#nameInput').focus();
    if (login && !/^[A-Za-z0-9-]+$/.test(login)) {
      $('#welcomeMsg').textContent = 'Логин GitHub — только латинские буквы, цифры и дефис.';
      return;
    }
    S.name = name;
    S.login = login || 'student';
    $('#welcome').classList.add('hidden');
    render();
  };
  $('#nameInput').focus();
}

start();
