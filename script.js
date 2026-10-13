const STORAGE_KEY = 'egg_pet_state_v1';
const DEFAULT_STATE = {
  isPaid: false,
  plan: 'free',
  todayHits: 0,
  totalHits: 0,
  growth: 0,
  food: 0,
  extraHits: 0,
  dailyClaimed: false,
  hasClothes: false,
  lastDate: new Date().toISOString().slice(0, 10),
};

const egg = document.getElementById('egg');
const hammer = document.getElementById('hammer');
const hitBtn = document.getElementById('hitBtn');
const feedBtn = document.getElementById('feedBtn');
const claimBtn = document.getElementById('claimBtn');
const todayHitText = document.getElementById('todayHitText');
const growthText = document.getElementById('growthText');
const foodText = document.getElementById('foodText');
const stageTag = document.getElementById('stageTag');
const memberBadge = document.getElementById('memberBadge');
const toast = document.getElementById('toast');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const rewardStage = document.getElementById('rewardStage');
const rewardClaim = document.getElementById('rewardClaim');
const supportBtn = document.getElementById('supportBtn');
const supportModal = document.getElementById('supportModal');
const closeSupportBtn = document.getElementById('closeSupportBtn');
const followModal = document.getElementById('followModal');
const closeFollowBtn = document.getElementById('closeFollowBtn');
const confirmFollowBtn = document.getElementById('confirmFollowBtn');
const successBox = document.getElementById('successBox');
const successText = document.getElementById('successText');
const continueBtn = document.getElementById('continueBtn');

const modal = document.createElement('div');
modal.className = 'payment-modal';
modal.innerHTML = `
  <div class="payment-panel">
    <div class="payment-header">
      <h3>购买道具</h3>
      <button class="close-btn" aria-label="关闭">×</button>
    </div>
    <div class="due-box">
      <span>支付金额</span>
      <strong id="modalPrice">¥19.9</strong>
    </div>
    <div class="payment-options">
      <button class="payment-option active" data-plan="grow20">
        <span>¥19.9</span>
        <small>20次成长 + 20份粮食</small>
      </button>
      <button class="payment-option" data-plan="grow50">
        <span>¥29.9</span>
        <small>50次成长 + 30份粮食</small>
      </button>
      <button class="payment-option" data-plan="grow100">
        <span>¥59.9</span>
        <small>100次成长 + 60份粮食</small>
      </button>
    </div>
    <button class="pay-btn">立即支付</button>
  </div>
`;
document.body.appendChild(modal);

const modalPrice = document.getElementById('modalPrice');
const closeBtn = modal.querySelector('.close-btn');
const payBtn = modal.querySelector('.pay-btn');
const payOptions = modal.querySelectorAll('.payment-option');
const modalTitle = modal.querySelector('.payment-header h3');
let pendingPlan = 'grow20';

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toISOString().slice(0, 10);

  if (!saved) return { ...DEFAULT_STATE, lastDate: today };

  try {
    const parsed = JSON.parse(saved);
    const shouldReset = parsed.lastDate !== today;

    if (shouldReset) {
      return {
        ...parsed,
        todayHits: 0,
        dailyClaimed: false,
        lastDate: today,
      };
    }

    return parsed;
  } catch {
    return { ...DEFAULT_STATE, lastDate: today };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 1800);
}

function getStageName(level) {
  const stages = ['蛋期', '破壳期', '幼年期', '成长期', '成熟期'];
  return stages[Math.min(level, stages.length - 1)];
}

function updateEggStage(growth) {
  const stageIndex = Math.min(Math.floor(growth / 20), 4);
  egg.className = `egg stage-${stageIndex}`;

  if (stageIndex > 0) {
    egg.classList.add('crack-visible');
    egg.classList.add('hatch-ready');
  } else {
    egg.classList.remove('crack-visible');
    egg.classList.remove('hatch-ready');
  }

  stageTag.textContent = getStageName(stageIndex);
}

function getPlanInfo(plan) {
  const planMap = {
    free: {
      label: '免费版',
      dailyFood: 0,
      hitLimit: 5,
      price: 0,
      type: 'free',
      growthBonus: 0,
      foodBonus: 0,
    },
    grow20: {
      label: '20次成长包',
      dailyFood: 20,
      hitLimit: 20,
      price: 19.9,
      type: 'grow20',
      growthBonus: 20,
      foodBonus: 20,
    },
    grow50: {
      label: '50次成长包',
      dailyFood: 30,
      hitLimit: 50,
      price: 29.9,
      type: 'grow50',
      growthBonus: 50,
      foodBonus: 30,
    },
    grow100: {
      label: '100次成长包',
      dailyFood: 60,
      hitLimit: 100,
      price: 59.9,
      type: 'grow100',
      growthBonus: 100,
      foodBonus: 60,
    },
  };

  return planMap[plan] || planMap.free;
}

function getDailyLimit() {
  if (!state.isPaid) return 5;
  return 5 + (state.extraHits || 0);
}

function render() {
  state.isPaid = state.plan !== 'free';
  const planInfo = getPlanInfo(state.plan);
  const dailyLimit = getDailyLimit();

  memberBadge.textContent = state.isPaid ? planInfo.label : '免费版';
  memberBadge.className = `member-badge ${state.isPaid ? 'premium' : 'free'}`;

  const stageProgress = state.growth % 20;
  const stageIndex = Math.min(Math.floor(state.growth / 20), 4);

  todayHitText.textContent = `${state.todayHits}/${dailyLimit}`;
  growthText.textContent = `${stageProgress}/20`;
  foodText.textContent = String(state.food);
  rewardStage.textContent = getStageName(stageIndex);
  rewardClaim.textContent = state.dailyClaimed ? '已领取' : '未领取';

  const progressPercent = Math.min(Math.round((stageProgress / 20) * 100), 100);
  progressText.textContent = `${progressPercent}%`;
  progressFill.style.width = `${progressPercent}%`;

  updateEggStage(state.growth);

  if (!state.isPaid) {
    hitBtn.textContent = state.todayHits >= 5 ? '轻触成长（次数已用尽）' : '轻触成长';
  } else {
    hitBtn.textContent = state.todayHits >= dailyLimit ? '轻触成长（次数已用尽）' : '轻触成长';
  }

  hitBtn.disabled = false;
  hitBtn.style.opacity = '1';
  hitBtn.style.cursor = 'pointer';

  claimBtn.disabled = false;
  claimBtn.style.opacity = '1';
  claimBtn.style.cursor = 'pointer';

  saveState(state);
}

function triggerHammerHit() {
  hammer.classList.remove('hit');
  void hammer.offsetWidth;
  hammer.classList.add('hit');

  egg.classList.remove('hit');
  void egg.offsetWidth;
  egg.classList.add('hit');
}

function handleHit() {
  const freeLimit = 5;
  const totalAvailable = state.isPaid ? getDailyLimit() : freeLimit;

  if (!state.isPaid && state.todayHits >= freeLimit) {
    openPaymentModal('grow20');
    showToast('今日次数已用尽，可购买成长包继续养成');
    return;
  }

  if (state.isPaid && state.todayHits >= totalAvailable) {
    openPaymentModal('grow20');
    showToast('今日成长次数已耗尽，可购买更多成长包继续养成');
    return;
  }

  triggerHammerHit();
  state.todayHits += 1;
  state.totalHits += 1;
  state.growth += 1;

  const stageIndex = Math.min(Math.floor(state.growth / 20), 4);
  if (stageIndex >= 1 && state.growth % 20 === 0) {
    showToast(`恭喜进入${getStageName(stageIndex)}！`);
  }

  render();
}

function handleFeed() {
  if (state.food <= 0) {
    openPaymentModal('grow20');
    showToast('粮食不足，可购买成长包继续喂养');
    return;
  }

  state.food -= 1;
  state.growth += 2;
  render();
  showToast('已喂养 1 份粮食，成长加速中');
}

function handleClaim() {
  openFollowModal();
}

function openFollowModal() {
  followModal.classList.remove('hidden');
}

function closeFollowModal() {
  followModal.classList.add('hidden');
}

function openPaymentModal(plan) {
  pendingPlan = plan;
  const info = getPlanInfo(plan);
  modalPrice.textContent = `¥${info.price.toFixed(1)}`;
  modalTitle.textContent = `购买${info.label}`;

  payOptions.forEach((option) => {
    const active = option.dataset.plan === plan;
    option.classList.toggle('active', active);
  });

  modal.classList.add('show');
}

function closePaymentModal() {
  modal.classList.remove('show');
}

function showSuccessState(message) {
  successText.textContent = message;
  successBox.classList.remove('hidden');
  closePaymentModal();
}

function hideSuccessState() {
  successBox.classList.add('hidden');
}

function confirmPayment() {
  const info = getPlanInfo(pendingPlan);
  state.plan = pendingPlan;
  state.isPaid = true;
  state.extraHits += info.growthBonus;
  state.food += info.foodBonus;
  state.dailyClaimed = false;
  render();
  showSuccessState(`${info.label} 已购买成功，继续陪小宠物成长吧！`);
  showToast(`${info.label} 购买成功`);
}

function openSupportModal() {
  supportModal.classList.remove('hidden');
}

function closeSupportModal() {
  supportModal.classList.add('hidden');
}

let state = loadState();

hitBtn.addEventListener('click', handleHit);
feedBtn.addEventListener('click', handleFeed);
claimBtn.addEventListener('click', handleClaim);

supportBtn.addEventListener('click', openSupportModal);
closeSupportBtn.addEventListener('click', closeSupportModal);
supportModal.addEventListener('click', (event) => {
  if (event.target === supportModal) closeSupportModal();
});

closeFollowBtn.addEventListener('click', closeFollowModal);
confirmFollowBtn.addEventListener('click', () => {
  closeFollowModal();

  if (!state.dailyClaimed) {
    state.dailyClaimed = true;
    render();
    showToast('请在公众号内回复“蛋宝”领取粮食');
  }
});
followModal.addEventListener('click', (event) => {
  if (event.target === followModal) closeFollowModal();
});

closeBtn.addEventListener('click', closePaymentModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closePaymentModal();
});

payOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const nextPlan = option.dataset.plan;
    pendingPlan = nextPlan;
    const info = getPlanInfo(nextPlan);
    modalPrice.textContent = `¥${info.price.toFixed(1)}`;
    modalTitle.textContent = `购买${info.label}`;
    payOptions.forEach((item) => item.classList.toggle('active', item === option));
  });
});

payBtn.addEventListener('click', confirmPayment);
continueBtn.addEventListener('click', () => {
  hideSuccessState();
  showToast('继续养成中');
});

render();

const revealItems = document.querySelectorAll('.reveal');

if (revealItems.length) {
  revealItems.forEach((item) => item.classList.add('visible'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
}
