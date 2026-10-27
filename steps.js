// =====================================================================
//  Данные тренажёра: файлы проекта и шаги.
//  Файл состоит из блоков. Блок появляется, когда пройден шаг из его версии.
//  v: [[id шага, текст], ...] — последняя пройденная версия и показывается.
//  i — отступ блока в пробелах.
// =====================================================================

const FILES = {
  'index.html': [
    { id: 'h-top', i: 0, v: [['emmet', `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`]] },
    { id: 'h-title', i: 4, v: [['emmet', '<title>Document</title>'], ['title', '<title>Калькулятор</title>']] },
    { id: 'h-link', i: 4, v: [['link', '<link rel="stylesheet" href="style.css">']] },
    { id: 'h-body', i: 0, v: [['emmet', '</head>\n<body>']] },
    { id: 'h-div', i: 4, v: [['div', '<div class="calculator">']] },
    { id: 'h-h1', i: 8, v: [['h1', '<h1>Калькулятор</h1>']] },
    { id: 'h-input', i: 8, v: [['input', '<input type="text" id="display" readonly>']] },
    { id: 'h-buttons', i: 8, v: [['buttons', '<div class="buttons">']] },
    { id: 'b-c', i: 12, v: [['btnC', '<button class="clear wide">C</button>'], ['onC', '<button class="clear wide" onclick="clearAll()">C</button>']] },
    { id: 'b-div', i: 12, v: [['btnDiv', '<button class="operator">÷</button>'], ['jsOp', `<button class="operator" onclick="pressOperator('/')">÷</button>`]] },
    { id: 'sp1', i: 0, v: [['btn7', '']] },
    { id: 'b-7', i: 12, v: [['btn7', '<button>7</button>'], ['on7', `<button onclick="pressDigit('7')">7</button>`]] },
    ...digitRow(['8', '9'], 'mul', '×', '*'),
    { id: 'sp2', i: 0, v: [['btn7', '']] },
    ...digitRow(['4', '5', '6'], 'minus', '−', '-'),
    { id: 'sp3', i: 0, v: [['btn7', '']] },
    ...digitRow(['1', '2', '3'], 'plus', '+', '+'),
    { id: 'sp4', i: 0, v: [['btn7', '']] },
    { id: 'b-0', i: 12, v: [['btn0', '<button class="wide">0</button>'], ['on7', `<button class="wide" onclick="pressDigit('0')">0</button>`]] },
    { id: 'b-eq', i: 12, v: [['btnEq', '<button class="equals">=</button>'], ['onEq', '<button class="equals" onclick="calculate()">=</button>']] },
    { id: 'h-buttons-end', i: 8, v: [['buttons', '</div>']] },
    { id: 'h-div-end', i: 4, v: [['div', '</div>']] },
    { id: 'h-script', i: 4, v: [['script', '<script src="script.js"></script>']] },
    { id: 'h-end', i: 0, v: [['emmet', '</body>\n</html>']] },
  ],

  'style.css': [
    { id: 'c-body', i: 0, v: [['cssBody', `body {
    background-color: #e5e5e5;
    font-family: 'Segoe UI', Arial, sans-serif;
    display: flex;
    justify-content: center;
    margin-top: 50px;
}
`]] },
    { id: 'c-calc', i: 0, v: [['cssCalc', `.calculator {
    background-color: #202020;
    padding: 12px;
    border-radius: 8px;
    width: 320px;
}
`]] },
    { id: 'c-h1', i: 0, v: [['cssH1', `h1 {
    color: white;
    font-size: 14px;
    font-weight: normal;
}
`]] },
    { id: 'c-display', i: 0, v: [['cssDisplay', `#display {
    width: 100%;
    height: 70px;
    font-size: 48px;
    font-weight: bold;
    text-align: right;
    border: none;
    outline: none;
    background-color: transparent;
    color: white;
    margin-bottom: 10px;
    box-sizing: border-box;
}
`]] },
    { id: 'c-buttons', i: 0, v: [['cssButtons', `.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
}
`]] },
    { id: 'c-button', i: 0, v: [['cssButton', `button {
    height: 55px;
    font-size: 20px;
    border: none;
    border-radius: 4px;
    background-color: #3b3b3b;
    color: white;
    cursor: pointer;
}

button:hover {
    background-color: #323232;
}
`]] },
    { id: 'c-op', i: 0, v: [['cssOp', `.operator, .clear {
    background-color: #323232;
}
`]] },
    { id: 'c-eq', i: 0, v: [['cssEq', `.equals {
    background-color: #4cc2ff;
    color: black;
}
`]] },
    { id: 'c-wide', i: 0, v: [['cssWide', `.wide {
    grid-column: span 3;
}`]] },
  ],

  'script.js': [
    { id: 'j-display', i: 0, v: [['jsDisplay', `let display = document.getElementById('display');
`]] },
    { id: 'j-vars', i: 0, v: [['jsVars', `let firstNumber = 0;
let operator = '';
`]] },
    { id: 'j-digit', i: 0, v: [['jsDigit', `function pressDigit(digit) {
    if (display.value === 'Ошибка') {
        display.value = '';
    }
    display.value = display.value + digit;
}
`]] },
    { id: 'j-clear', i: 0, v: [['jsClear', `function clearAll() {
    display.value = '';
    firstNumber = 0;
    operator = '';
}
`]] },
    { id: 'j-op', i: 0, v: [['jsOp', `function pressOperator(op) {
    firstNumber = Number(display.value);
    operator = op;
    display.value = '';
}
`]] },
    { id: 'j-calc', i: 0, v: [['jsCalc', `function calculate() {
    let secondNumber = Number(display.value);
    let result = 0;

    if (operator === '+') {
        result = firstNumber + secondNumber;
    } else if (operator === '-') {
        result = firstNumber - secondNumber;
    } else if (operator === '*') {
        result = firstNumber * secondNumber;
    } else if (operator === '/') {
        if (secondNumber === 0) {
            display.value = 'Ошибка';
            return;
        }
        result = firstNumber / secondNumber;
    }

    display.value = result;
}`]] },
  ],

  'README.md': [
    { id: 'r-1', i: 0, v: [['readme', `# Калькулятор

Мой первый сайт на HTML, CSS и JavaScript.`]] },
  ],
};

// Ряд кнопок: цифры появляются вместе с кнопкой 7, а onclick — вместе с onclick у семёрки.
// Кнопка действия получает onclick на шаге pressOperator.
function digitRow(digits, name, sign, op) {
  const row = digits.map((d) => ({
    id: 'b-' + d, i: 12,
    v: [['btn7', `<button>${d}</button>`], ['on7', `<button onclick="pressDigit('${d}')">${d}</button>`]],
  }));
  row.push({
    id: 'b-' + name, i: 12,
    v: [['btn7', `<button class="operator">${sign}</button>`], ['jsOp', `<button class="operator" onclick="pressOperator('${op}')">${sign}</button>`]],
  });
  return row;
}

// =====================================================================
//  Этапы
// =====================================================================
const STAGES = [
  { id: 'prep', name: 'Подготовка' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'js', name: 'JavaScript' },
  { id: 'git', name: 'GitHub' },
];

// =====================================================================
//  Шаги
//  kind: folder | open | newfile | emmet | code | terminal | cmd | github | test | finish
//  say  — что говорит робот (задание)
//  type — образец, который набирает ученик (для code)
//  win  — что робот говорит после правильного ответа (объяснение «зачем»)
//  t    — комментарий для преподавателя
// =====================================================================
const STEPS = [
  // ───────────── Подготовка ─────────────
  {
    id: 'folder', stage: 'prep', kind: 'folder', scene: 'desktop', title: 'Папка проекта',
    say: 'Каждый проект живёт в своей папке. Нажми правой кнопкой мыши на пустое место рабочего стола и выбери «Создать» → «Папку». Назови её calculator и нажми Enter.',
    win: 'Папка готова. В ней будут лежать все файлы калькулятора.',
    t: 'Объясните: проект = папка, всё, что относится к сайту, лежит внутри. Имя — строчными латинскими буквами без пробелов: так его потом без проблем поймут браузер и GitHub. Частая ошибка — «Calculator» с большой буквы или русская «с».',
  },
  {
    id: 'open', stage: 'prep', kind: 'open', scene: 'vscode', title: 'Открыть в VS Code',
    say: 'Открой папку в редакторе кода. В VS Code нажми «Открыть папку…», выбери calculator и нажми «Выбор папки».',
    win: 'Папка открыта. Слева в «Проводнике» видно её содержимое — пока она пустая.',
    t: 'В настоящем VS Code: Файл → Открыть папку. Важно открыть именно папку, а не отдельный файл: тогда слева виден весь проект. Окно «Доверяете ли вы авторам?» — отвечаем «Да».',
  },
  {
    id: 'fileHtml', stage: 'prep', kind: 'newfile', scene: 'vscode', file: 'index.html', title: 'Файл index.html',
    say: 'Создай первый файл. Нажми значок «Новый файл» рядом с названием папки, напиши index.html и нажми Enter.',
    win: 'index.html — главная страница сайта. Браузер всегда открывает её первой.',
    t: 'Имя index.html — не случайное: так называется главная страница любого сайта, GitHub Pages тоже ищет именно её. Расширение .html обязательно.',
  },
  {
    id: 'fileCss', stage: 'prep', kind: 'newfile', scene: 'vscode', file: 'style.css', title: 'Файл style.css',
    say: 'Так же создай файл style.css. В нём будет оформление.',
    win: 'Есть файл для оформления.',
    t: 'Три файла — три слоя сайта: структура, оформление, поведение. Так в шкафу одежда и обувь лежат на разных полках.',
  },
  {
    id: 'fileJs', stage: 'prep', kind: 'newfile', scene: 'vscode', file: 'script.js', title: 'Файл script.js',
    say: 'И последний: script.js. В нём будет логика — то, что происходит при нажатии кнопок.',
    win: 'Все три файла на месте. Можно писать код.',
    t: 'Проверьте у всех три файла с правильными расширениями. На реальных компьютерах частая беда — index.html.txt (если файл создавали не в VS Code).',
  },

  // ───────────── HTML ─────────────
  {
    id: 'emmet', stage: 'html', kind: 'emmet', scene: 'vscode', file: 'index.html', block: 'h-top', title: 'Заготовка страницы',
    say: 'Открыт index.html. Не будем писать заготовку руками: набери восклицательный знак ! и нажми Enter — VS Code сам вставит каркас страницы.',
    type: '!',
    win: 'Это каркас любой страницы: head — служебная часть, body — всё, что видно на странице.',
    t: 'Это Emmet — встроенная подсказка VS Code. «!» + Enter (или Tab) вставляет каркас HTML. Покажите, что в head лежат настройки (кодировка, заголовок вкладки), а всё видимое пишем между <body> и </body>.',
  },
  {
    id: 'title', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-title', title: 'Заголовок вкладки',
    say: 'Сейчас на вкладке браузера написано Document. Замени строку с title: набери её заново со словом Калькулятор.',
    type: '<title>Калькулятор</title>',
    win: 'Посмотри на вкладку браузера справа — там теперь «Калькулятор».',
    t: 'Тег = слово в угловых скобках. Почти у каждого есть пара: открывающий и закрывающий со слешем, как скобки в математике.',
  },
  {
    id: 'div', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-div', title: 'Окно калькулятора',
    say: 'Внутри body создадим коробку — окно калькулятора. Набери строку по образцу. Закрывающий тег VS Code допишет сам.',
    type: '<div class="calculator">',
    win: 'div — это коробка, в которую складывают другие элементы. class="calculator" — её имя, по нему мы потом её покрасим.',
    t: 'В настоящем VS Code закрывающий </div> тоже появляется автоматически. class — имя для группы элементов, по нему находит CSS. Частая ошибка — пропущенные кавычки или пробел вместо = .',
  },
  {
    id: 'h1', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-h1', title: 'Заголовок',
    say: 'Внутри коробки напиши заголовок.',
    type: '<h1>Калькулятор</h1>',
    win: 'h1 — заголовок. В браузере справа он появился крупными буквами.',
    t: 'Обратите внимание на отступы: то, что внутри коробки, пишется со сдвигом вправо. Браузеру отступы не важны, но человеку так проще читать.',
  },
  {
    id: 'input', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-input', title: 'Экран',
    say: 'Теперь экран калькулятора — поле, куда будут писаться числа.',
    type: '<input type="text" id="display" readonly>',
    win: 'input — поле. id="display" — личное имя экрана, по нему JavaScript будет писать сюда цифры. readonly — печатать только кнопками.',
    t: 'id — уникальное имя, как имя в паспорте: на странице он только один. У input нет закрывающего тега. Частая ошибка — id="Display" с большой буквы: потом JavaScript его не найдёт.',
  },
  {
    id: 'buttons', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-buttons', title: 'Коробка для кнопок',
    say: 'Кнопки сложим в отдельную коробку — так их будет удобно разложить сеткой.',
    type: '<div class="buttons">',
    win: 'Внутри этой коробки будут все кнопки.',
    t: 'Имя класса buttons — во множественном числе, оно понадобится в CSS. Если ошибиться (button вместо buttons), сетка из кнопок не соберётся.',
  },
  {
    id: 'btnC', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-c', title: 'Кнопка C',
    say: 'Первая кнопка — C, она будет стирать экран.',
    type: '<button class="clear wide">C</button>',
    win: 'У кнопки сразу два класса через пробел: clear — кнопка очистки, wide — широкая.',
    t: 'У элемента может быть несколько классов через пробел. Спросите группу: зачем два? (Один отвечает за цвет, другой за ширину.)',
  },
  {
    id: 'btnDiv', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-div', title: 'Кнопка деления',
    say: 'Рядом — кнопка деления. Знак ÷ можно набрать как / — тренажёр поймёт.',
    type: '<button class="operator">÷</button>',
    win: 'class="operator" будет у всех кнопок действий: ÷ × − +.',
    t: 'Знаки ÷ × − есть не на всех клавиатурах. Тренажёр принимает / * -; в настоящем VS Code можно скопировать знак или оставить / * -.',
  },
  {
    id: 'btn7', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-7', title: 'Кнопки с цифрами',
    say: 'Набери кнопку с цифрой 7. Остальные цифры и действия я допишу по этому образцу, чтобы не набирать одно и то же.',
    type: '<button>7</button>',
    win: 'Я добавил ряды 8 9 ×, 4 5 6 −, 1 2 3 +. Посмотри на код: все кнопки устроены одинаково.',
    t: 'На паре ребята набирают все кнопки сами — это хорошая тренировка, но долго. Здесь важно понять образец: кнопка = <button>текст</button>.',
  },
  {
    id: 'btn0', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-0', title: 'Кнопка 0',
    say: 'Кнопка 0 будет широкой, как C.',
    type: '<button class="wide">0</button>',
    win: 'Ноль готов.',
    t: 'Класс wide повторно используется: один класс — много элементов.',
  },
  {
    id: 'btnEq', stage: 'html', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-eq', title: 'Кнопка =',
    say: 'И последняя кнопка — «равно».',
    type: '<button class="equals">=</button>',
    win: 'Скелет готов. Справа он выглядит некрасиво и пока не работает — так и должно быть: оформление и логика будут дальше.',
    t: 'Обязательно проговорите: «некрасиво и не нажимается» — это нормально, иначе ребята решат, что всё сломали.',
  },

  // ───────────── CSS ─────────────
  {
    id: 'link', stage: 'css', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-link', title: 'Подключить CSS',
    say: 'Чтобы страница взяла оформление из style.css, его надо подключить. Добавь строку в head, под title.',
    type: '<link rel="stylesheet" href="style.css">',
    win: 'Теперь страница знает, где лежит оформление. Без этой строки style.css просто не работает.',
    t: 'Покажите на паре: убрать эту строку — оформление пропадёт. Частая ошибка — опечатка в имени файла (styles.css) или строка не в head.',
  },
  {
    id: 'cssBody', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-body', title: 'Фон страницы',
    say: 'Правило CSS: кого красим { свойство: значение; }. Покрась фон всей страницы — набери три строки. Остальные свойства я добавлю.',
    type: `body {
    background-color: #e5e5e5;
}`,
    win: 'body — вся страница. Я добавил шрифт и выравнивание по центру: калькулятор встал посередине.',
    t: 'Схема «селектор { свойство: значение; }». Двоеточие и точка с запятой обязательны: пропущенная «;» ломает следующее свойство. Цвет #e5e5e5 — светло-серый, можно писать и словами: red, pink.',
  },
  {
    id: 'cssCalc', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-calc', title: 'Окно',
    say: 'Покрась окно калькулятора. Точка перед словом значит «класс».',
    type: `.calculator {
    background-color: #202020;
}`,
    win: 'Появилось тёмное окно. Я добавил отступы, скругление и ширину.',
    t: 'Точка = класс (.calculator находит class="calculator"). Частая ошибка — забыть точку.',
  },
  {
    id: 'cssH1', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-h1', title: 'Заголовок',
    say: 'Заголовок на тёмном фоне не виден. Сделай буквы белыми. color — цвет букв.',
    type: `h1 {
    color: white;
}`,
    win: 'color красит буквы, а background-color — фон. Их часто путают.',
    t: 'Селектор без точки и решётки — по имени тега: h1 найдёт все заголовки h1.',
  },
  {
    id: 'cssDisplay', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-display', title: 'Экран',
    say: 'Экран найдём по id. Решётка # значит «id». Сделай цифры крупными.',
    type: `#display {
    font-size: 48px;
}`,
    win: 'Я добавил остальное: прозрачный фон, белые цифры справа, как в Windows.',
    t: 'Главное правило: точка — класс, решётка — id. Частая ошибка — .display вместо #display.',
  },
  {
    id: 'cssButtons', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-buttons', title: 'Сетка кнопок',
    say: 'Разложим кнопки сеткой по 4 в ряд.',
    type: `.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}`,
    win: 'grid — сетка. repeat(4, 1fr) — четыре одинаковые колонки. Кнопки встали рядами.',
    t: 'Покажите связь: 4 колонки — 4 кнопки в ряду. Если в HTML класс назвали button, а не buttons, сетка не применится — хороший повод показать, как важно совпадение имён.',
  },
  {
    id: 'cssButton', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-button', title: 'Кнопки',
    say: 'Покрась все кнопки в тёмно-серый.',
    type: `button {
    background-color: #3b3b3b;
}`,
    win: 'Я добавил белые цифры, размер и правило :hover — кнопка темнеет, когда на неё наводишь мышку.',
    t: ':hover — состояние «мышка над элементом». Можно предложить поменять цвет при наведении на свой.',
  },
  {
    id: 'cssOp', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-op', title: 'Кнопки действий',
    say: 'Кнопки действий и C сделаем чуть темнее. Запятая значит «и те, и другие».',
    type: `.operator, .clear {
    background-color: #323232;
}`,
    win: 'Одно правило сразу для двух классов. Правая колонка стала темнее.',
    t: 'Почему это правило сильнее, чем button? Класс точнее тега — более точное правило побеждает.',
  },
  {
    id: 'cssEq', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-eq', title: 'Кнопка =',
    say: 'Главная кнопка — голубая.',
    type: `.equals {
    background-color: #4cc2ff;
}`,
    win: 'Я сделал знак чёрным, чтобы он читался на голубом.',
    t: 'Можно разрешить свой цвет — но тренажёр ждёт образец. На паре это хорошее мини-задание.',
  },
  {
    id: 'cssWide', stage: 'css', kind: 'code', scene: 'vscode', file: 'style.css', block: 'c-wide', title: 'Широкие кнопки',
    say: 'Последнее: широкие кнопки занимают три колонки.',
    type: `.wide {
    grid-column: span 3;
}`,
    win: 'Калькулятор выглядит как в Windows. Но кнопки пока не нажимаются — нужен JavaScript.',
    t: 'span 3 — «растянуться на 3 колонки». Поэтому рядом с C и 0 помещается только одна кнопка.',
  },

  // ───────────── JavaScript ─────────────
  {
    id: 'script', stage: 'js', kind: 'code', scene: 'vscode', file: 'index.html', block: 'h-script', title: 'Подключить JS',
    say: 'Подключим логику. Строка пишется в самом низу, перед </body>.',
    type: '<script src="script.js"></script>',
    win: 'Скрипт подключается в конце, потому что он ищет экран — а экран к этому моменту уже есть на странице.',
    t: 'Без этой строки ни одна кнопка не заработает — это самая частая причина «ничего не нажимается» (так было на первой паре). Скрипт внизу — потому что браузер читает страницу сверху вниз.',
  },
  {
    id: 'jsDisplay', stage: 'js', kind: 'code', scene: 'vscode', file: 'script.js', block: 'j-display', title: 'Найти экран',
    say: 'Найдём экран по его id и запомним в переменную display.',
    type: `let display = document.getElementById('display');`,
    win: 'let создаёт переменную — коробочку с именем. В неё положили экран. Теперь display.value — это то, что на экране.',
    t: 'getElementById — «найди элемент по id». Регистр важен: getElementByID с большой D не сработает. Точка с запятой в конце.',
  },
  {
    id: 'jsVars', stage: 'js', kind: 'code', scene: 'vscode', file: 'script.js', block: 'j-vars', title: 'Переменные',
    say: 'Ещё две коробочки: первое число и знак действия.',
    type: `let firstNumber = 0;
let operator = '';`,
    win: 'Когда нажмут +, экран очистится для второго числа. Значит, первое число и знак надо где-то запомнить — вот здесь.',
    t: 'Нарисуйте на доске две коробки. Пустые кавычки — пустая строка, «пока ничего».',
  },
  {
    id: 'jsDigit', stage: 'js', kind: 'code', scene: 'vscode', file: 'script.js', block: 'j-digit', title: 'Функция цифр',
    say: 'Функция — набор команд с именем. Эта будет дописывать цифру на экран.',
    type: `function pressDigit(digit) {
    display.value = display.value + digit;
}`,
    win: 'Было на экране 1, нажали 2 — стало 12: цифра приклеивается в конец. Я добавил проверку: если на экране «Ошибка», сначала стереть.',
    t: 'Функция сама ничего не делает, пока её не вызовут — это будет на следующем шаге. digit — какую цифру нажали, её передаст кнопка.',
  },
  {
    id: 'on7', stage: 'js', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-7', title: 'Оживить кнопку 7',
    say: 'Скажем кнопке 7, что делать при нажатии. Замени её строку. Остальным цифрам я добавлю так же.',
    type: `<button onclick="pressDigit('7')">7</button>`,
    win: 'onclick — «когда кликнули». Попробуй нажать цифры в калькуляторе справа — они появляются на экране!',
    t: 'Кавычки: снаружи двойные, внутри одинарные. Если везде двойные — HTML сломается. Дайте ребятам понажимать цифры — это первая работающая кнопка.',
  },
  {
    id: 'jsClear', stage: 'js', kind: 'code', scene: 'vscode', file: 'script.js', block: 'j-clear', title: 'Функция C',
    say: 'Функция для кнопки C: стереть экран.',
    type: `function clearAll() {
    display.value = '';
}`,
    win: 'Пустые кавычки — пустой экран. Я добавил ещё сброс обеих коробочек.',
    t: 'Имя clearAll — с большой A. Регистр важен: clearall — уже другое имя.',
  },
  {
    id: 'onC', stage: 'js', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-c', title: 'Оживить C',
    say: 'Подключи функцию к кнопке C.',
    type: '<button class="clear wide" onclick="clearAll()">C</button>',
    win: 'Набери цифры справа и нажми C — экран очистится.',
    t: 'Скобки () после имени значат «выполни функцию».',
  },
  {
    id: 'jsOp', stage: 'js', kind: 'code', scene: 'vscode', file: 'script.js', block: 'j-op', title: 'Функция действий',
    say: 'Когда нажимают + − × ÷: запомнить число и знак, очистить экран.',
    type: `function pressOperator(op) {
    firstNumber = Number(display.value);
    operator = op;
    display.value = '';
}`,
    win: 'Number превращает текст «12» в число 12. Я подключил эту функцию ко всем кнопкам действий.',
    t: 'Покажите, зачем Number: без него «12» + «30» даст «1230» — текст склеивается. Кнопки передают компьютерные знаки / * - +, хотя нарисованы ÷ × −.',
  },
  {
    id: 'jsCalc', stage: 'js', kind: 'code', scene: 'vscode', file: 'script.js', block: 'j-calc', title: 'Функция «равно»',
    say: 'Самое главное — посчитать ответ. Набери вариант для плюса, остальные действия я допишу.',
    type: `function calculate() {
    let secondNumber = Number(display.value);
    let result = 0;
    if (operator === '+') {
        result = firstNumber + secondNumber;
    }
    display.value = result;
}`,
    win: 'if — «если». === — вопрос «равно ли?». Я добавил минус, умножение и деление — и запрет делить на ноль.',
    t: 'Различайте = и ===: одно «равно» кладёт в коробку, три — сравнивают. Ветки else if добавлены автоматически — разберите их по экрану. return — «выйти из функции».',
  },
  {
    id: 'onEq', stage: 'js', kind: 'code', scene: 'vscode', file: 'index.html', block: 'b-eq', title: 'Оживить =',
    say: 'Последний шаг кода: подключи функцию к кнопке =.',
    type: '<button class="equals" onclick="calculate()">=</button>',
    win: 'Калькулятор готов.',
    t: 'Теперь всё работает. Если на паре что-то не считает — F12 → Console: браузер покажет, какое имя он не нашёл.',
  },
  {
    id: 'test', stage: 'js', kind: 'test', scene: 'vscode', file: 'index.html', title: 'Проверка',
    say: 'Проверь калькулятор справа: посчитай 12 + 30 =',
    win: '42! Твой калькулятор работает.',
    t: 'Пусть ребята сами придумают ещё пример — например, деление на ноль (покажет «Ошибка»).',
  },

  // ───────────── GitHub ─────────────
  {
    id: 'fileReadme', stage: 'git', kind: 'newfile', scene: 'vscode', file: 'README.md', title: 'Файл README',
    say: 'Перед отправкой на GitHub добавим описание проекта. Создай файл README.md.',
    win: 'README — «обложка» проекта. GitHub показывает его на главной странице репозитория.',
    t: 'В этом маршруте README создаём сами, поэтому на GitHub репозиторий будет без галочки README — иначе git push выдаст ошибку.',
  },
  {
    id: 'readme', stage: 'git', kind: 'code', scene: 'vscode', file: 'README.md', block: 'r-1', title: 'Описание',
    say: 'Напиши название проекта. Решётка в начале строки — это заголовок.',
    type: '# Калькулятор',
    win: 'Я добавил строчку описания. Этот язык разметки называется Markdown.',
    t: 'Markdown: # — заголовок. Можно предложить дописать своё имя и что умеет калькулятор.',
  },
  {
    id: 'terminal', stage: 'git', kind: 'terminal', scene: 'vscode', title: 'Терминал',
    say: 'Команды для GitHub пишут в терминале. Открой его: меню «Терминал» → «Создать терминал».',
    win: 'Внизу открылся терминал. Он уже находится в папке calculator.',
    t: 'Терминал в VS Code сразу открывается в папке проекта — не нужно переходить командой cd. Вместо него можно использовать Git Bash: правый клик по папке → Open Git Bash here.',
  },
  {
    id: 'cfgName', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'Представиться: имя',
    say: 'Git должен знать, кто автор. Это делается один раз на компьютере. Впиши своё имя латиницей в кавычках.',
    type: 'git config --global user.name "Ivan Petrov"',
    match: /^git config --global user\.name ["'][^"']+["']$/,
    win: 'Имя записано.',
    t: 'Нужно один раз на компьютере. На учебных компьютерах может слететь — тогда git commit попросит представиться.',
  },
  {
    id: 'cfgEmail', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'Представиться: почта',
    say: 'И почту — лучше ту же, что на GitHub.',
    type: 'git config --global user.email "ivan@mail.ru"',
    match: /^git config --global user\.email ["'][^"'\s]+@[^"'\s]+["']$/,
    win: 'Готово, теперь Git знает автора.',
    t: 'Почта должна быть с @. Можно любая, но с почтой от GitHub коммиты будут привязаны к профилю.',
  },
  {
    id: 'init', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'git init',
    say: 'Скажем Git следить за этой папкой.',
    type: 'git init',
    match: /^git init$/,
    out: 'Initialized empty Git repository in C:/Users/Ученик/Desktop/calculator/.git/',
    win: 'В папке появилась скрытая папка .git — там Git будет хранить историю.',
    t: 'git init делается один раз для проекта.',
  },
  {
    id: 'add', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'git add',
    say: 'Выберем все файлы для сохранения. Точка значит «всё в этой папке».',
    type: 'git add .',
    match: /^git add \.$/,
    win: 'Файлы подготовлены к сохранению.',
    t: 'Частая ошибка — забыть точку: git add без аргумента ничего не выбирает.',
  },
  {
    id: 'commit', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'git commit',
    say: 'Сохраним снимок проекта с подписью, что сделали. Подпись — в кавычках, можно своими словами.',
    type: 'git commit -m "Мой калькулятор"',
    match: /^git commit -m ["'][^"']+["']$/,
    out: '[master (root-commit) 3f2a91c] {msg}\n 4 files changed, 92 insertions(+)\n create mode 100644 README.md\n create mode 100644 index.html\n create mode 100644 script.js\n create mode 100644 style.css',
    win: 'Коммит — сохранённый снимок проекта. К нему всегда можно вернуться.',
    t: 'Подпись коммита — что сделали, а не «123». Если Git просит представиться — значит, не выполнены команды git config.',
  },
  {
    id: 'github', stage: 'git', kind: 'github', scene: 'github', title: 'Репозиторий на GitHub',
    say: 'Теперь сайт GitHub. Создай репозиторий: имя calculator, Public, галочку README не ставь — он у нас уже есть. Нажми Create repository.',
    win: 'Репозиторий создан. Это папка для проекта на GitHub — пока пустая.',
    t: 'Галочка README здесь не нужна: README уже в коммите, и с галочкой git push откажется (на GitHub будет коммит, которого нет у ученика). Public — чтобы потом включить сайт через Pages. Регистрация на GitHub — с 13 лет.',
  },
  {
    id: 'branch', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'Ветка main',
    say: 'GitHub называет главную ветку main. Переименуем нашу так же.',
    type: 'git branch -M main',
    match: /^git branch -M main$/,
    win: 'Ветка называется main.',
    t: 'Эту и две следующие команды GitHub сам показывает на странице нового репозитория — их можно копировать оттуда.',
  },
  {
    id: 'remote', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'Адрес на GitHub',
    say: 'Скажем Git, куда отправлять: адрес твоего репозитория.',
    type: 'git remote add origin https://github.com/{login}/calculator.git',
    win: 'origin — короткое имя для адреса на GitHub.',
    t: 'Адрес берётся со страницы репозитория. Логин и имя репозитория должны совпадать, иначе push выдаст «Repository not found». Если ошиблись: git remote set-url origin <правильный адрес>.',
  },
  {
    id: 'push', stage: 'git', kind: 'cmd', scene: 'vscode', title: 'git push',
    say: 'Отправляем! В первый раз GitHub попросит войти.',
    type: 'git push -u origin main',
    match: /^git push (-u|--set-upstream) origin main$/,
    login: true,
    out: 'Enumerating objects: 6, done.\nCounting objects: 100% (6/6), done.\nWriting objects: 100% (6/6), 1.42 KiB | 1.42 MiB/s, done.\nTo https://github.com/{login}/calculator.git\n * [new branch]      main -> main\nbranch \'main\' set up to track \'origin/main\'.',
    win: 'Код на GitHub!',
    t: '-u запоминает, куда отправлять, — дальше достаточно просто git push. В первый раз открывается окно входа в GitHub через браузер.',
  },
  {
    id: 'finish', stage: 'git', kind: 'finish', scene: 'repo', title: 'Готово',
    say: 'Посмотри: вот твой проект на GitHub. Под файлами — README. Нажми «Получить диплом».',
    win: '',
    t: 'Дальше по желанию: Settings → Pages → Branch main → Save — и через минуту калькулятор открывается по ссылке логин.github.io/calculator. Обновления потом: git add . → git commit -m "..." → git push.',
  },
];
