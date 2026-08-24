const plans = [
  { time: '07:00', task: '起床、整理被子', flower: 1 },
  { time: '07:30', task: '吃早餐', flower: 1 },
  { time: '08:00', task: '晨读 10 分钟', flower: 2 },
  { time: '12:30', task: '午餐后散步', flower: 1 },
  { time: '18:30', task: '亲子阅读/复盘今天', flower: 2 },
  { time: '21:00', task: '洗漱睡觉', flower: 1 },
];

const grades = ['幼儿园', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'];

const defaultState = {
  isVip: false,
  activeChild: 0,
  children: [{ name: '小星星', gender: '女孩', age: 6, height: 118, weight: 22 }],
  done: {},
  grade: '幼儿园',
};

const state = loadState();

function worksheetQuestions(grade) {
  return [
    `${grade} 语文：阅读短文并圈出 5 个关键词`,
    `${grade} 数学：完成 20 道口算/应用题`,
    `${grade} 英语：抄写并朗读 10 个核心词汇`,
    `${grade} 综合：记录一次观察日记`,
  ];
}

function loadState() {
  const saved = localStorage.getItem('tongban-demo-state');
  return saved ? { ...defaultState, ...JSON.parse(saved) } : structuredClone(defaultState);
}

function saveState() {
  localStorage.setItem('tongban-demo-state', JSON.stringify(state));
}

function startDemo() {
  state.isVip = true;
  state.done = Object.fromEntries(plans.map((_, index) => [index, true]));
  state.children = [
    { name: '小星星', gender: '女孩', age: 6, height: 118, weight: 22 },
    { name: '小太阳', gender: '男孩', age: 4, height: 105, weight: 18 },
    { name: '小月亮', gender: '女孩', age: 12, height: 152, weight: 41 },
  ];
  state.activeChild = 0;
  state.grade = '初一';
  saveState();
  render();
}

function render() {
  const flowers = plans.reduce((sum, item, index) => sum + (state.done[index] ? item.flower : 0), 0);
  const childLimit = state.isVip ? 5 : 1;
  const canAddChild = state.children.length < childLimit;
  const child = state.children[state.activeChild];

  document.querySelector('#root').innerHTML = `
    <main>
      <header class="hero">
        <div>
          <p class="eyebrow">儿童成长计划 · 小红花激励 · A4 练习题</p>
          <h1>童伴成长 APP</h1>
          <p>把每日作息、任务奖励、成长档案和幼儿园到初三课外练习题放进一个温暖的家庭成长空间。</p>
        </div>
        <div class="heroActions">
          <button class="demoButton" id="demoStart">一键进入演示</button>
          <button class="vipButton" id="vipToggle">${state.isVip ? '已开通 VIP' : '开通 VIP 解锁全部'}</button>
        </div>
      </header>

      <section class="demoGuide">
        <strong>演示路线：</strong>点击“一键进入演示” → 查看每日任务全部完成和小红花 → 编辑孩子档案 → 切换年级 → 打印 A4 练习单。
      </section>

      <section class="grid">
        <article class="card wide">
          <div class="cardTitle"><h2>每日计划表</h2><span class="free">普通用户可用</span></div>
          <div class="timeline">
            ${plans.map((item, index) => `
              <label class="plan">
                <input type="checkbox" data-plan="${index}" ${state.done[index] ? 'checked' : ''} />
                <span class="time">${item.time}</span>
                <span>${item.task}</span>
                <strong>+${item.flower} 🌸</strong>
              </label>`).join('')}
          </div>
          <div class="reward">今日已获得 <b>${flowers}</b> 朵小红花</div>
        </article>

        <article class="card locked">
          <div class="cardTitle"><h2>孩子成长档案</h2><span>VIP</span></div>
          ${state.isVip ? '' : '<div class="lock">开通 VIP 后可记录身高、体重、性别、姓名，并添加最多 5 个孩子。</div>'}
          <div class="${state.isVip ? '' : 'blurred'}">
            <div class="tabs">${state.children.map((item, index) => `<button class="${index === state.activeChild ? 'active' : ''}" data-child="${index}">${item.name}</button>`).join('')}</div>
            <div class="form">
              ${[['name','姓名'], ['gender','性别'], ['age','年龄'], ['height','身高(cm)'], ['weight','体重(kg)']].map(([key, label]) => `
                <label>${label}<input data-field="${key}" value="${child[key]}" /></label>`).join('')}
            </div>
            <button id="addChild" ${canAddChild ? '' : 'disabled'}>添加孩子（${state.children.length}/5）</button>
          </div>
        </article>

        <article class="card wide locked">
          <div class="cardTitle"><h2>A4 可打印课外练习题</h2><span>VIP</span></div>
          ${state.isVip ? '' : '<div class="lock">VIP 解锁幼儿园到初三题库和打印功能。</div>'}
          <div class="${state.isVip ? 'worksheet' : 'blurred worksheet'}">
            <select id="gradeSelect">${grades.map((grade) => `<option ${grade === state.grade ? 'selected' : ''}>${grade}</option>`).join('')}</select>
            <button id="printWorksheet">打印 A4 练习题</button>
            <div class="paper">
              <h3>${state.grade} 课外练习单</h3>
              <ol>${worksheetQuestions(state.grade).map((question) => `<li>${question}</li>`).join('')}</ol>
            </div>
          </div>
        </article>
      </section>
    </main>`;

  bindEvents();
}

function bindEvents() {
  document.querySelector('#demoStart').addEventListener('click', startDemo);
  document.querySelector('#vipToggle').addEventListener('click', () => { state.isVip = !state.isVip; saveState(); render(); });
  document.querySelectorAll('[data-plan]').forEach((box) => box.addEventListener('change', (event) => { state.done[event.target.dataset.plan] = event.target.checked; saveState(); render(); }));
  document.querySelectorAll('[data-child]').forEach((button) => button.addEventListener('click', (event) => { state.activeChild = Number(event.target.dataset.child); saveState(); render(); }));
  document.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', (event) => { state.children[state.activeChild][event.target.dataset.field] = event.target.value; saveState(); }));
  document.querySelector('#addChild')?.addEventListener('click', () => {
    if (!state.isVip || state.children.length >= 5) return;
    state.children.push({ name: `孩子${state.children.length + 1}`, gender: '男孩', age: 3, height: 100, weight: 16 });
    state.activeChild = state.children.length - 1;
    saveState();
    render();
  });
  document.querySelector('#gradeSelect')?.addEventListener('change', (event) => { state.grade = event.target.value; saveState(); render(); });
  document.querySelector('#printWorksheet')?.addEventListener('click', () => window.print());
}

render();
