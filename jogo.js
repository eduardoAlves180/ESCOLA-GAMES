
// ==================== UTILS ====================
const CONFETTI_COLORS=['#FF6B9D','#FFD93D','#6BCB77','#5ECFFF','#A855F7','#FF8C42'];
function shuffle(a){let arr=[...a];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function launchConfetti(){
  for(let i=0;i<80;i++){
    setTimeout(()=>{
      const c=document.createElement('div');c.className='confetti-piece';
      c.style.left=Math.random()*100+'vw';
      c.style.background=CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)];
      c.style.width=(8+Math.random()*12)+'px';c.style.height=(8+Math.random()*12)+'px';
      c.style.borderRadius=Math.random()>.5?'50%':'3px';
      c.style.animationDuration=(1.5+Math.random()*2)+'s';
      document.body.appendChild(c);setTimeout(()=>c.remove(),3500);
    },i*30);
  }
}
function flash(type){
  const f=document.getElementById('flash');
  f.className='feedback-flash '+type+' show';
  setTimeout(()=>f.className='feedback-flash',350);
}
function setRaceQuestion(text){
  document.getElementById('race-q').textContent = text || '';
}
// prettier congrats toast
function showCongrats(name){
  try{
    const prev=document.querySelector('.congrats-toast'); if(prev) prev.remove();
    const el=document.createElement('div'); el.className='congrats-toast';
    const avatar = (playerProfile && playerProfile.avatar) ? playerProfile.avatar : '🎉';
    el.innerHTML = `<div class="congrats-avatar">${avatar}</div><div class="congrats-body"><div class="congrats-title">Parabéns, ${name}!</div><div class="congrats-sub">Você fez um ótimo trabalho 🎉</div></div><div class="congrats-actions"><button class="congrats-btn">OK</button></div>`;
    document.body.appendChild(el);
    // show animation
    setTimeout(()=>el.classList.add('show'),20);
    // close handlers
    el.querySelector('.congrats-btn').addEventListener('click', ()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),320); });
    // auto remove
    setTimeout(()=>{ if(document.body.contains(el)){ el.classList.remove('show'); setTimeout(()=>el.remove(),320); } },4500);
    // tiny sound
    try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(880,ctx.currentTime);g.gain.setValueAtTime(0.0001,ctx.currentTime);o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.12,ctx.currentTime+0.02);o.frequency.exponentialRampToValueAtTime(1320,ctx.currentTime+0.18);setTimeout(()=>{g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.25);o.stop(ctx.currentTime+0.26);},270);}catch(e){}
  }catch(e){console.warn('showCongrats failed',e)}
}
function showWin(sub,stars,emoji){
  document.getElementById('win-sub').textContent=sub;
  document.getElementById('win-stars').textContent=stars;
  document.getElementById('win-emoji').textContent=emoji||'🎉';
  document.getElementById('win-overlay').classList.add('show');
  launchConfetti();
  
  // reward XP based on stars (e.g. '⭐⭐⭐' -> 3)
  try{
    if(typeof addXP === 'function' && stars){
      const count = (stars.match(/⭐/g)||stars.match(/⭐/g)||[]).length || (stars.match(/⭐|★/g)||[]).length || (stars.length>0?stars.length:0);
      let gain = 0;
      if(count>=3) gain = 60; else if(count===2) gain = 35; else if(count===1) gain = 15; else gain = 10;
      addXP(gain);
    }
  }catch(e){console.warn('xp reward failed',e)}
  // prettier popup de parabéns com o nome da criança
  try{
    const name = playerProfile && playerProfile.name ? playerProfile.name.trim() : '';
    if(name){ setTimeout(()=>{ showCongrats(name); }, 350); }
  }catch(e){/* ignore */}
}
function closeWin(){
  document.getElementById('win-overlay').classList.remove('show');
  if(currentGame==='animals') startAnimals();
  else if(currentGame==='math') startRace();
  else if(currentGame==='math2') startMath2();
  else startPort();
}

// =========== PROFILE (nome / avatar / nível) ===========
let playerProfile = {name:'', avatar:'👦', level:1};
function loadProfile(){
  try{
    const raw = localStorage.getItem('playerProfile');
    if(raw){const p=JSON.parse(raw); playerProfile = {...playerProfile, ...p};}
  }catch(e){console.warn('profile load failed',e)}
  updateProfileUI();
}
function saveProfile(){
  try{localStorage.setItem('playerProfile', JSON.stringify(playerProfile));}catch(e){console.warn('profile save failed',e)}
}
function updateProfileUI(){
  const avatarEl = document.getElementById('profile-avatar');
  const nameEl = document.getElementById('profile-name');
  const lvlEl = document.getElementById('profile-level');
  const badge = document.getElementById('profile-level-badge');
  const ageEl = document.getElementById('profile-age');
  if(avatarEl) avatarEl.textContent = playerProfile.avatar || '👦';
  if(nameEl) nameEl.value = playerProfile.name || '';
  if(ageEl) ageEl.textContent = playerProfile.age || '-';
  if(lvlEl) lvlEl.value = playerProfile.level || 1;
  if(badge) badge.textContent = playerProfile.level || 1;
  document.querySelectorAll('.avatar-btn').forEach(b=>b.classList.toggle('active', b.dataset.avatar===playerProfile.avatar));
}

// delegate avatar clicks in the small profile card (not the modal)
document.addEventListener('click', (e)=>{
  const btn = e.target && e.target.closest && e.target.closest('.avatar-btn');
  if(!btn) return;
  if(btn.closest && btn.closest('#avatar-grid')){
    const val = btn.dataset.avatar; if(val){ playerProfile.avatar = val; saveProfile(); updateProfileUI(); }
  }
});

// name input
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id==='profile-name'){
    playerProfile.name = e.target.value.slice(0,20);
    saveProfile();
  }
});

// level change
document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='profile-level'){
    const v = parseInt(e.target.value,10)||1; playerProfile.level = v; saveProfile();
    const badge = document.getElementById('profile-level-badge'); if(badge) badge.textContent = v;
  }
});

// ========== PROFILE SCREEN (login) ==========
function showProfileScreen(){
  const modal = document.getElementById('profile-screen'); if(!modal) return;
  modal.setAttribute('aria-hidden','false');
  // populate fields
  const pn = document.getElementById('ps-name'); const pa = document.getElementById('ps-age');
  if(pn) pn.value = playerProfile.name || '';
  if(pa) pa.value = playerProfile.age || '';
  // mark current avatar
  document.querySelectorAll('#ps-avatar-grid .avatar-btn').forEach(b=>b.classList.toggle('active', b.dataset.avatar===playerProfile.avatar));
}
function hideProfileScreen(){const modal=document.getElementById('profile-screen'); if(modal) modal.setAttribute('aria-hidden','true');}

// modal avatar clicks
document.addEventListener('click', (e)=>{
  if(e.target && e.target.closest && e.target.closest('#ps-avatar-grid')){
    const btn = e.target.closest('.avatar-btn'); if(!btn) return;
    document.querySelectorAll('#ps-avatar-grid .avatar-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }
});

// open modal from small edit button
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id==='open-profile-screen'){ showProfileScreen(); }
});

// save from modal
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id==='ps-save'){
    const pn = document.getElementById('ps-name'); const pa = document.getElementById('ps-age');
    const active = document.querySelector('#ps-avatar-grid .avatar-btn.active');
    const avatar = active?active.dataset.avatar:playerProfile.avatar||'👦';
    playerProfile.name = pn?pn.value.trim():playerProfile.name;
    playerProfile.age = pa?parseInt(pa.value,10)||null:playerProfile.age;
    playerProfile.avatar = avatar;
    saveProfile(); updateProfileUI(); initProfileUIState(); hideProfileScreen();
    // start games after profile setup
    startAnimals(); startRace(); startPort();
  }
});


// XP and level mechanics
playerProfile.xp = playerProfile.xp || 0;
playerProfile.xpToNext = playerProfile.xpToNext || 100;
function addXP(amount){
  playerProfile.xp = (playerProfile.xp||0) + amount;
  // level up when reach threshold
  while(playerProfile.xp >= (playerProfile.xpToNext||100)){
    playerProfile.xp -= (playerProfile.xpToNext||100);
    playerProfile.level = Math.min(5, (playerProfile.level||1) + 1);
    // increase next threshold moderately
    playerProfile.xpToNext = Math.round((playerProfile.xpToNext||100) * 1.25);
    // level up effects
    launchConfetti();
    playLevelSound();
    const badge = document.getElementById('profile-level-badge'); if(badge) badge.textContent = playerProfile.level;
    applyProfileToGames();
  }
  saveProfile();
  // update UI
  const fill = document.getElementById('profile-xp-fill');
  const txt = document.getElementById('profile-xp-text');
  const pct = Math.min(100, Math.round((playerProfile.xp / (playerProfile.xpToNext||100))*100));
  if(fill) fill.style.width = pct + '%';
  if(txt) txt.textContent = `${playerProfile.xp}/${playerProfile.xpToNext} XP`;
}

function playLevelSound(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);
    setTimeout(()=>{g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25); o.stop(ctx.currentTime + 0.26);},270);
  }catch(e){console.warn('sound failed',e)}
}

// Map profile level to game difficulties and parameters
function difficultyForLevel(lvl){
  if(lvl<=1) return 'easy';
  if(lvl===2) return 'easy';
  if(lvl===3) return 'medium';
  if(lvl===4) return 'hard';
  return 'hard';
}

function applyProfileToGames(){
  // Animals: map to pairs
  const pairsMap = {1:6,2:7,3:8,4:10,5:12};
  aPairs = pairsMap[playerProfile.level] || 6;
  // restart animals to apply
  if(currentGame==='animals') startAnimals();

  // Race: set level buttons
  const rlevel = difficultyForLevel(playerProfile.level);
  raceLevel = rlevel; document.querySelectorAll('.rlvl-btn').forEach(b=>b.classList.toggle('active', b.textContent.toLowerCase().includes(rlevel)));
  // restart race to apply
  startRace();

  // Math2 & Math3
  const ml = difficultyForLevel(playerProfile.level);
  math2Level = ml; document.querySelectorAll('.math2-level-btn').forEach(b=>b.classList.toggle('active', b.textContent.toLowerCase().includes(ml)));
  math3Level = ml; document.querySelectorAll('.math3-level-btn').forEach(b=>b.classList.toggle('active', b.textContent.toLowerCase().includes(ml)));
  startMath2(); startMath3();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registrado com sucesso:', reg.scope))
      .catch(err => console.warn('Falha ao registrar Service Worker:', err));
  });
}

// on load, ensure xp UI shows
function initProfileUIState(){
  playerProfile.xp = playerProfile.xp || 0;
  playerProfile.xpToNext = playerProfile.xpToNext || 100;
  updateProfileUI();
  const fill = document.getElementById('profile-xp-fill');
  const txt = document.getElementById('profile-xp-text');
  const pct = Math.min(100, Math.round((playerProfile.xp / (playerProfile.xpToNext||100))*100));
  if(fill) fill.style.width = pct + '%';
  if(txt) txt.textContent = `${playerProfile.xp}/${playerProfile.xpToNext} XP`;
}

// ==================== NAVIGATION ====================
let currentGame='animals';
function showGame(game,btn){
  currentGame=game;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+game).classList.add('active');
  btn.classList.add('active');
  document.body.className='theme-'+game;
  if(game==='math') raceResume();
  else racePause();
  if(game==='math2') startMath2();
  if(game==='math3') startMath3();
}
document.querySelectorAll('.cloud').forEach(c=>c.style.left=(Math.random()*80)+'vw');

// ==================== ANIMALS GAME ====================
const ALL_ANIMALS=[
  {e:'🐶',n:'Cachorro'},{e:'🐱',n:'Gato'},{e:'🐭',n:'Ratinho'},
  {e:'🐹',n:'Hamster'},{e:'🐰',n:'Coelho'},{e:'🦊',n:'Raposa'},
  {e:'🐻',n:'Urso'},{e:'🐼',n:'Panda'},{e:'🐨',n:'Coala'},
  {e:'🐯',n:'Tigre'},{e:'🦁',n:'Leão'},{e:'🐮',n:'Vaquinha'},
  {e:'🐸',n:'Sapo'},{e:'🐵',n:'Macaco'},{e:'🐔',n:'Galinha'},
  {e:'🐧',n:'Pinguim'},{e:'🦆',n:'Pato'},{e:'🦉',n:'Coruja'},
  {e:'🐺',n:'Lobo'},{e:'🦋',n:'Borboleta'},
];
let aCards=[],aFlipped=[],aMatched=0,aMoves=0,aScore=0,aPairs=6,aLock=false;
let aPreviewTimer = null;
function setDiff(btn,p){document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');aPairs=p;startAnimals();}
function startAnimals(){
  document.getElementById('win-overlay').classList.remove('show');
  if(aPreviewTimer) clearTimeout(aPreviewTimer);
  aFlipped=[];aMatched=0;aMoves=0;aScore=0;aLock=true; // lock during preview
  document.getElementById('a-score').textContent=0;
  document.getElementById('a-moves').textContent=0;
  document.getElementById('a-pairs').textContent=0;
  const chosen=shuffle(ALL_ANIMALS).slice(0,aPairs);
  aCards=shuffle([...chosen,...chosen].map((a,i)=>({...a,id:i})));
  renderAnimals();
  // show all cards briefly to let the child memorize, then hide
  setTimeout(()=>{
    document.querySelectorAll('.card').forEach(el=>el.classList.add('flipped'));
  },50);
  aPreviewTimer = setTimeout(()=>{
    document.querySelectorAll('.card').forEach(el=>{ if(!el.classList.contains('matched')) el.classList.remove('flipped'); });
    aLock=false;
  },5000);
}
function renderAnimals(){
  const grid=document.getElementById('grid');
  const cols=aPairs<=6?3:4;
  grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  grid.innerHTML='';
  aCards.forEach((card,idx)=>{
    const el=document.createElement('div');el.className='card';el.dataset.idx=idx;
    el.innerHTML=`<div class="card-inner"><div class="card-face card-back"></div><div class="card-face card-front"><span>${card.e}</span><span class="card-label">${card.n}</span></div></div>`;
    el.addEventListener('click',()=>flipAnimalCard(idx));
    grid.appendChild(el);
  });
}
function flipAnimalCard(idx){
  if(aLock)return;
  const el=document.querySelector(`[data-idx="${idx}"]`);
  if(el.classList.contains('flipped')||el.classList.contains('matched'))return;
  el.classList.add('flipped');aFlipped.push(idx);
  if(aFlipped.length===2){
    aLock=true;aMoves++;document.getElementById('a-moves').textContent=aMoves;
    const[a,b]=aFlipped;
    if(aCards[a].e===aCards[b].e){
      flash('ok');aScore+=10;aMatched++;
      setTimeout(()=>{
        document.querySelector(`[data-idx="${a}"]`).classList.add('matched');
        document.querySelector(`[data-idx="${b}"]`).classList.add('matched');
        document.getElementById('a-score').textContent=aScore;
        document.getElementById('a-pairs').textContent=aMatched;
        aFlipped=[];aLock=false;
        if(aMatched===aPairs){const r=aPairs/aMoves;showWin(`Você encontrou todos os pares! (${aMoves} jogadas)`,r>=.7?'⭐⭐⭐':r>=.45?'⭐⭐':'⭐','🏆');}
      },400);
    }else{
      flash('err');
      setTimeout(()=>{
        const ea=document.querySelector(`[data-idx="${a}"]`);const eb=document.querySelector(`[data-idx="${b}"]`);
        ea.classList.add('wrong');eb.classList.add('wrong');
        setTimeout(()=>{ea.classList.remove('flipped','wrong');eb.classList.remove('flipped','wrong');aFlipped=[];aLock=false;},500);
      },700);
    }
  }
}




// ==================== RACE MATH GAME ====================
// State
let raceScore=0,raceLives=3,raceLap=0,raceTotal=10;
let raceLevel='easy',racePaused=false,raceOver=false;
let carLane=1; // 0=left, 1=center, 2=right
let obstacleTimers=[],treeTimer=null,speedLineTimer=null;
let raceSpeed=1; // multiplier
let currentObs=null; // active obstacle element
let currentAns=null; // correct answer for current obstacle
let answerLocked=false;
const LANES_PCT=[22,50,78]; // % from left for 3 lanes
const CARS=['🏎️','🚗','🚙'];
let playerCarEmoji='🏎️';

// level config
const LEVEL_CFG={
  easy:  {maxN:5, ops:['+'],       speed:5.5, interval:5200},
  medium:{maxN:10,ops:['+','-'],   speed:4.2, interval:4200},
  hard:  {maxN:15,ops:['+','-','×'],speed:3.4, interval:3600},
};
const MATH_POP_CFG={
  easy:  {maxN:8,  ops:['+'],         time:7000},
  medium:{maxN:12, ops:['+','-'],     time:8000},
  hard:  {maxN:15, ops:['+','-','×'], time:9000},
};
const MATH_CARD_CFG={
  easy:  {maxN:8,  ops:['+']},
  medium:{maxN:12, ops:['+','-']},
  hard:  {maxN:15, ops:['+','-','×']},
};
let math2Score=0, math2Lives=3, math2Round=0, math2Total=10, math2Level='easy', math2Timer=null, math2CurrentAns=null, math2GameOver=false;
let math3Score=0, math3Lives=3, math3Round=0, math3Total=8, math3Level='easy', math3GameOver=false;

// ==================== PORTUGUÊS MÁGICO ====================
const PORT2_QUESTIONS = [
  {img:'🐶', word:'cachorro', syllables:['ca','chor','ro']},
  {img:'🐱', word:'gato', syllables:['ga','to']},
  {img:'🍎', word:'maçã', syllables:['ma','çã']},
  {img:'🚗', word:'carro', syllables:['car','ro']},
  {img:'🐟', word:'peixe', syllables:['pei','xe']},
  {img:'🌞', word:'sol', syllables:['sol']},
  {img:'🍌', word:'banana', syllables:['ba','na','na']},
  {img:'🍫', word:'chocolate', syllables:['cho','co','la','te']}
];

let port2Score=0, port2Lives=3, port2Round=0, port2Total=8, port2Level='words', port2GameOver=false;

function setPort2Level(btn, lvl){
  document.querySelectorAll('.port2-level-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); port2Level = lvl; startPort2();
}

function startPort2(){
  port2Score=0; port2Lives=3; port2Round=0; port2GameOver=false;
  document.getElementById('port2-score').textContent=0;
  document.getElementById('port2-lives').textContent=3;
  document.getElementById('port2-round').textContent=`0/${port2Total}`;
  document.getElementById('port2-message').textContent='Toque na resposta certa!';
  document.getElementById('port2-grid').innerHTML='';
  nextPort2Question();
}

function updatePort2HUD(){
  document.getElementById('port2-score').textContent=port2Score;
  document.getElementById('port2-lives').textContent=port2Lives;
  document.getElementById('port2-round').textContent=`${port2Round}/${port2Total}`;
}

function nextPort2Question(){
  if(port2GameOver) return;
  port2Round++;
  if(port2Round>port2Total){ port2GameOver=true; showWin('Mandou bem no Português!', '⭐⭐⭐','🎉'); return; }
  updatePort2HUD();
  // pick random base question
  const q = PORT2_QUESTIONS[Math.floor(Math.random()*PORT2_QUESTIONS.length)];
  document.getElementById('port2-image').textContent = q.img;
  let prompt = '';
  let correct = '';
  if(port2Level==='letters'){
    prompt = `Qual é a primeira letra de ${q.word}?`;
    correct = q.word[0];
    // generate options letters
    const letters = new Set([correct]);
    while(letters.size<4){ letters.add(String.fromCharCode(97+Math.floor(Math.random()*26))); }
    renderPort2Options(Array.from(letters).sort(()=>Math.random()-0.5), correct);
  } else if(port2Level==='syllables'){
    prompt = `Toque na sílaba que inicia ${q.word}`;
    correct = q.syllables[0];
    const opts = new Set([correct]);
    while(opts.size<4){ opts.add(q.syllables[Math.floor(Math.random()*q.syllables.length)] || ('la'+Math.floor(Math.random()*9))); }
    renderPort2Options(Array.from(opts).sort(()=>Math.random()-0.5), correct);
  } else {
    prompt = `Qual é a palavra representada?`;
    correct = q.word;
    const opts = new Set([correct]);
    while(opts.size<4){
      const rnd = PORT2_QUESTIONS[Math.floor(Math.random()*PORT2_QUESTIONS.length)].word;
      opts.add(rnd);
    }
    renderPort2Options(Array.from(opts).sort(()=>Math.random()-0.5), correct);
  }
  document.getElementById('port2-question').textContent = prompt;
}

function renderPort2Options(options, correct){
  const grid = document.getElementById('port2-grid'); grid.innerHTML = '';
  options.forEach(opt=>{
    const btn = document.createElement('button'); btn.className='port2-card'; btn.textContent = opt;
    btn.onclick = ()=> pickPort2Answer(btn,opt,correct);
    grid.appendChild(btn);
  });
}

function pickPort2Answer(btn,opt,correct){
  if(port2GameOver) return;
  if(opt===correct){
    btn.classList.add('correct'); port2Score += 10; updatePort2HUD(); launchConfetti();
    setTimeout(()=>{ nextPort2Question(); }, 800);
  } else {
    btn.classList.add('wrong'); port2Lives--; updatePort2HUD();
    if(port2Lives<=0){ port2GameOver=true; document.getElementById('port2-message').textContent='Acabaram as vidas! Tente novamente.'; showWin('Tente outra vez!','⭐','😅'); }
    else setTimeout(()=>{ nextPort2Question(); }, 900);
  }
}
function setRaceLevel(btn,lvl){
  document.querySelectorAll('.rlvl-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');raceLevel=lvl;startRace();
}
function setMath2Level(btn,lvl){
  document.querySelectorAll('.math2-level-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');math2Level=lvl;startMath2();
}
function setMath3Level(btn,lvl){
  document.querySelectorAll('.math3-level-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');math3Level=lvl;startMath3();
}
function racePause(){racePaused=true;}
function raceResume(){if(!raceOver)racePaused=false;}

function startMath2(){
  document.getElementById('win-overlay').classList.remove('show');
  math2Score=0;math2Lives=3;math2Round=0;math2GameOver=false;math2CurrentAns=null;
  document.getElementById('math2-score').textContent=0;
  document.getElementById('math2-lives').textContent=3;
  document.getElementById('math2-round').textContent=`0/${math2Total}`;
  document.getElementById('math2-message').textContent='Toque no balão com a resposta certa!';
  document.getElementById('math2-arena').innerHTML='';
  nextMath2Question();
}

function startMath3(){
  document.getElementById('win-overlay').classList.remove('show');
  math3Score=0;math3Lives=3;math3Round=0;math3GameOver=false;
  document.getElementById('math3-score').textContent=0;
  document.getElementById('math3-lives').textContent=3;
  document.getElementById('math3-round').textContent=`0/${math3Total}`;
  document.getElementById('math3-message').textContent='Escolha a carta certa.';
  document.getElementById('math3-grid').innerHTML='';
  nextMath3Question();
}

function updateMath2HUD(){
  document.getElementById('math2-score').textContent=math2Score;
  document.getElementById('math2-lives').textContent=math2Lives;
}

function genMath2Question(){
  const cfg=MATH_POP_CFG[math2Level];
  const op=cfg.ops[Math.floor(Math.random()*cfg.ops.length)];
  let a,b,ans,q;
  if(op==='+'){a=rand(1,cfg.maxN);b=rand(1,cfg.maxN);ans=a+b;q=`${a} + ${b} = ?`;}
  else if(op==='-'){a=rand(2,cfg.maxN);b=rand(1,a);ans=a-b;q=`${a} - ${b} = ?`;}
  else {a=rand(2,Math.min(6,cfg.maxN));b=rand(2,Math.min(6,cfg.maxN));ans=a*b;q=`${a} × ${b} = ?`;}
  const answers=new Set([ans]);
  while(answers.size<4){
    let delta=rand(1,5);
    let wrong=Math.random()>.5?ans+delta:ans-delta;
    if(wrong<0) wrong=ans+delta;
    if(wrong!==ans) answers.add(wrong);
  }
  return {q,ans,answers:shuffle([...answers])};
}

function renderMath2Balloons(opts,correct){
  const arena=document.getElementById('math2-arena');
  arena.innerHTML='';
  opts.forEach((opt,idx)=>{
    const btn=document.createElement('button');
    btn.className='balloon';
    btn.textContent=opt;
    btn.style.left=`${10+idx*22+rand(-4,4)}%`;
    btn.style.background=opt===correct?
      'linear-gradient(135deg,#6BCB77,#3da847)':'linear-gradient(135deg,#FF5F84,#FF8A61)';
    btn.style.animationDuration=`${MATH_POP_CFG[math2Level].time/1000 + 1.6}s`;
    btn.onclick=()=>pickMath2Answer(btn,opt,correct);
    arena.appendChild(btn);
  });
}

function nextMath2Question(){
  if(math2Timer) clearTimeout(math2Timer);
  if(math2Round>=math2Total){
    math2GameOver=true;
    showWin(`Você acertou ${math2Score/10} contas!`,math2Score>=80?'⭐⭐⭐':math2Score>=50?'⭐⭐':'⭐','🎉');
    return;
  }
  math2Round++;
  const qdata=genMath2Question();
  math2CurrentAns=qdata.ans;
  document.getElementById('math2-question').textContent=qdata.q;
  document.getElementById('math2-round').textContent=`${math2Round}/${math2Total}`;
  renderMath2Balloons(qdata.answers,qdata.ans);
  math2Timer=setTimeout(()=>{
    if(math2GameOver) return;
    flash('err');
    math2Lives--;
    updateMath2HUD();
    if(math2Lives<=0){
      math2GameOver=true;
      showWin(`Acabaram as vidas! Pontos: ${math2Score}`,'⭐','😅');
    } else {
      nextMath2Question();
    }
  }, MATH_POP_CFG[math2Level].time);
}

function pickMath2Answer(btn,chosen,correct){
  if(math2GameOver) return;
  if(math2Timer) clearTimeout(math2Timer);
  if(chosen===correct){
    btn.classList.add('correct');
    math2Score+=10;
    flash('ok');
    updateMath2HUD();
    setTimeout(nextMath2Question,400);
  } else {
    btn.classList.add('wrong');
    flash('err');
    math2Lives--;
    updateMath2HUD();
    if(math2Lives<=0){
      math2GameOver=true;
      setTimeout(()=>showWin(`Acabaram as vidas! Pontos: ${math2Score}`,'⭐','😅'),600);
    } else {
      setTimeout(nextMath2Question,700);
    }
  }
}

function genMath3Question(){
  const cfg=MATH_CARD_CFG[math3Level];
  const op=cfg.ops[Math.floor(Math.random()*cfg.ops.length)];
  let a,b,ans,q;
  if(op==='+'){a=rand(1,cfg.maxN);b=rand(1,cfg.maxN);ans=a+b;q=`${a} + ${b} = ?`;}
  else if(op==='-'){a=rand(2,cfg.maxN);b=rand(1,a);ans=a-b;q=`${a} - ${b} = ?`;}
  else {a=rand(2,Math.min(6,cfg.maxN));b=rand(2,Math.min(6,cfg.maxN));ans=a*b;q=`${a} × ${b} = ?`;}
  const answers=new Set([ans]);
  while(answers.size<6){
    const delta=rand(1,6);
    const wrong=Math.random()>.5?ans+delta:ans-delta;
    if(wrong>0) answers.add(wrong);
  }
  return {q,ans,answers:shuffle([...answers]).slice(0,6)};
}

function nextMath3Question(){
  if(math3Round>=math3Total){
    math3GameOver=true;
    showWin(`Você acertou ${math3Score} pontos!`,math3Score>=50?'⭐⭐⭐':math3Score>=30?'⭐⭐':'⭐','🧩');
    return;
  }
  math3Round++;
  const qdata=genMath3Question();
  document.getElementById('math3-question').textContent=qdata.q;
  document.getElementById('math3-round').textContent=`${math3Round}/${math3Total}`;
  const grid=document.getElementById('math3-grid');
  grid.innerHTML='';
  qdata.answers.forEach(val=>{
    const btn=document.createElement('button');
    btn.className='math3-card';
    btn.textContent=val;
    btn.onclick=()=>pickMath3Answer(btn,val,qdata.ans);
    grid.appendChild(btn);
  });
}

function pickMath3Answer(btn,chosen,correct){
  if(math3GameOver) return;
  if(chosen===correct){
    btn.classList.add('correct');
    math3Score+=10;
    flash('ok');
    document.getElementById('math3-score').textContent=math3Score;
    setTimeout(nextMath3Question,500);
  } else {
    btn.classList.add('wrong');
    flash('err');
    math3Lives--;
    document.getElementById('math3-lives').textContent=math3Lives;
    if(math3Lives<=0){
      math3GameOver=true;
      setTimeout(()=>showWin(`Acabaram as vidas! Pontos: ${math3Score}`,'⭐','😅'),600);
    } else {
      setTimeout(nextMath3Question,700);
    }
  }
}

function startRace(){
  document.getElementById('win-overlay').classList.remove('show');
  raceScore=0;raceLives=3;raceLap=0;raceOver=false;racePaused=false;
  answerLocked=false;carLane=1;raceSpeed=1;
  playerCarEmoji=CARS[Math.floor(Math.random()*CARS.length)];
  updateRaceHUD();
  document.getElementById('finish-fill').style.width='0%';
  document.getElementById('race-msg').textContent='Vá! Vá! Vá! 🏎️💨';
  setRaceQuestion('');
  document.getElementById('answer-zone').innerHTML='';

  // clear old obstacles & trees
  obstacleTimers.forEach(clearTimeout);obstacleTimers=[];
  if(treeTimer)clearInterval(treeTimer);
  if(speedLineTimer)clearInterval(speedLineTimer);
  document.querySelectorAll('.obstacle,.tree,.speed-line,.explosion').forEach(el=>el.remove());
  currentObs=null;currentAns=null;

  // place player car
  const car=document.getElementById('player-car');
  car.textContent=playerCarEmoji;
  car.style.left=LANES_PCT[carLane]+'%';
  car.style.transform='translateX(-50%)';

  // spawn trees
  spawnTrees();
  spawnSpeedLines();

  // spawn obstacles on interval
  scheduleNextObstacle();
}

function updateRaceHUD(){
  document.getElementById('r-score').textContent=raceScore;
  document.getElementById('r-lives').textContent='❤️'.repeat(raceLives)+'🖤'.repeat(3-raceLives);
  document.getElementById('r-lap').textContent=raceLap;
  document.getElementById('r-speed').textContent=raceSpeed.toFixed(1);
}

// ---- Trees ----
const TREE_EMOJIS=['🌲','🌴','🌵','🌳'];
function spawnTrees(){
  treeTimer=setInterval(()=>{
    if(racePaused||raceOver)return;
    ['5%','95%'].forEach(side=>{
      const t=document.createElement('div');
      t.className='tree';
      t.textContent=TREE_EMOJIS[Math.floor(Math.random()*TREE_EMOJIS.length)];
      t.style.left=side;
      t.style.animationDuration=(2+Math.random())+'s';
      t.style.animationDelay='0s';
      document.getElementById('race-wrap').appendChild(t);
      setTimeout(()=>t.remove(),3200);
    });
  },800);
}

// ---- Speed lines ----
function spawnSpeedLines(){
  speedLineTimer=setInterval(()=>{
    if(racePaused||raceOver)return;
    for(let i=0;i<3;i++){
      const l=document.createElement('div');l.className='speed-line';
      l.style.top=rand(20,280)+'px';
      l.style.left=rand(25,75)+'%';
      l.style.width=rand(30,80)+'px';
      l.style.animationDuration='.25s';
      document.getElementById('race-wrap').appendChild(l);
      setTimeout(()=>l.remove(),300);
    }
  },200);
}

// ---- Obstacle generation ----
function scheduleNextObstacle(){
  if(raceOver)return;
  const cfg=LEVEL_CFG[raceLevel];
  const delay=cfg.interval/raceSpeed;
  const t=setTimeout(()=>{
    if(raceOver||racePaused)return;
    spawnObstacle();
  },delay);
  obstacleTimers.push(t);
}

function genQuestion(){
  const cfg=LEVEL_CFG[raceLevel];
  const op=cfg.ops[Math.floor(Math.random()*cfg.ops.length)];
  let a,b,ans;
  if(op==='+'){a=rand(1,cfg.maxN);b=rand(1,cfg.maxN);ans=a+b;}
  else if(op==='-'){a=rand(2,cfg.maxN);b=rand(1,a);ans=a-b;}
  else{a=rand(2,5);b=rand(2,5);ans=a*b;}
  return{q:`${a} ${op} ${b} = ?`,ans,a,b,op};
}

function spawnObstacle(){
  if(raceOver) return;
  // clear previous obstacles if still on screen
  if(currentObs && Array.isArray(currentObs)){
    currentObs.forEach(o=>{ if(o && o.parentNode) o.remove(); });
    currentObs = null;
  }

  const qdata = genQuestion();
  currentAns = qdata.ans;
  setRaceQuestion(qdata.q);

  // generate two wrong answers (obstacles) and leave one lane safe with the correct answer
  const wrongs = new Set();
  while(wrongs.size < 2){
    let w = qdata.ans + rand(-5,5);
    if(w <= 0 || w === qdata.ans) w = qdata.ans + rand(1,6);
    if(w !== qdata.ans) wrongs.add(w);
  }
  const wrongArr = shuffle([...wrongs]);

  // choose lanes and assign wrong answers to lanes, ensure one lane is correct (safe)
  const lanes = [0,1,2];
  const shuffled = shuffle(lanes.slice());
  const correctLane = shuffled.pop(); // lane without obstacle
  const obstacleLanes = shuffled; // two lanes with obstacles

  const created = [];
  obstacleLanes.forEach((laneIdx, i) => {
    const val = wrongArr[i] || (qdata.ans + i + 1);
    const obsEl = document.createElement('div');
    obsEl.className = 'obstacle';
    obsEl.dataset.value = val;
    obsEl.dataset.lane = laneIdx;
    obsEl.style.left = LANES_PCT[laneIdx] + '%';
    obsEl.style.transform = 'translateX(-50%)';
    obsEl.style.animationDuration = (LEVEL_CFG[raceLevel].speed / raceSpeed + 1.2) + 's';
    obsEl.innerHTML = `<div class="obs-sign">🚧</div><div class="obs-block">${val}</div>`;
    document.getElementById('race-wrap').appendChild(obsEl);
    created.push({el: obsEl, lane: laneIdx, value: val});
  });

  // optionally mark correct lane visually as safe
  const safeMarker = document.createElement('div');
  safeMarker.className = 'safe-zone';
  safeMarker.style.left = LANES_PCT[correctLane] + '%';
  safeMarker.style.transform = 'translateX(-50%)';
  safeMarker.innerHTML = `<div class="safe-mark">✅</div><div class="safe-text">${qdata.ans}</div>`;
  document.getElementById('race-wrap').appendChild(safeMarker);
  created.push({el: safeMarker, lane: correctLane, value: qdata.ans, safe: true});

  currentObs = created;

  // when obstacles reach bottom, check which lane the car is in
  const fallDur = (LEVEL_CFG[raceLevel].speed / raceSpeed + 1.2) * 1000;
  const obsTimeout = setTimeout(()=>{
    // check collision: if any obstacle exists on the same lane as car, it's a crash
    const carAtLane = carLane;
    const hit = created.find(c => !c.safe && Number(c.lane) === carAtLane && c.el.parentNode);
    if(hit){
      // crash
      // remove obstacles
      created.forEach(c => { if(c.el && c.el.parentNode) c.el.remove(); });
      currentObs = null;
      flash('err');
      raceLives--;
      document.getElementById('race-msg').textContent = `💥 Errou! ${hit.value}`;
      updateRaceHUD();
      // explosion
      const car = document.getElementById('player-car');
      const exp = document.createElement('div'); exp.className = 'explosion'; exp.textContent = '💥';
      exp.style.left = car.style.left; exp.style.bottom = '28px'; exp.style.transform = 'translateX(-50%)';
      document.getElementById('race-wrap').appendChild(exp);
      setTimeout(()=>exp.remove(),700);
      if(raceLives <= 0){ raceOver = true; setTimeout(()=>showWin(`Acabaram as vidas! Pontos: ${raceScore}`, raceScore>=70?'⭐⭐':'⭐','💥'),800); }
      else setTimeout(()=>{ if(!raceOver) scheduleNextObstacle(); }, 900);
    } else {
      // successful: car is in safe lane
      created.forEach(c => { if(c.el && c.el.parentNode) c.el.remove(); });
      currentObs = null;
      raceScore += 10 + (raceLevel==='hard'?5:raceLevel==='medium'?2:0);
      raceLap++;
      raceSpeed = Math.min(3, 1 + (raceLap * 0.18));
      document.getElementById('finish-fill').style.width = (raceLap / raceTotal * 100) + '%';
      document.getElementById('race-msg').textContent = raceLevel==='hard' ? '🔥 Incrível!' : '✅ Boa! Continue assim!';
      updateRaceHUD();
      if(raceLap >= raceTotal){ raceOver = true; setTimeout(()=>showWin(`Você cruzou a linha de chegada!\n${raceScore} pontos 🏁`,'⭐⭐⭐','🏆'),600); }
      else setTimeout(()=>{ if(!raceOver) scheduleNextObstacle(); }, 600);
    }
  }, fallDur);
  obstacleTimers.push(obsTimeout);
}

function buildAnswerButtons(ans){
  // answer buttons are no longer used in lane-avoidance mode
  const zone = document.getElementById('answer-zone'); if(zone) zone.innerHTML = '';
}

function moveCar(lane){
  carLane=Math.max(0,Math.min(2,lane));
  const car=document.getElementById('player-car');
  car.style.left=LANES_PCT[carLane]+'%';
  car.classList.add('bump');
  setTimeout(()=>car.classList.remove('bump'),150);
}

function pickAnswer(btn,chosen,ans){
  if(answerLocked||raceOver)return;
  answerLocked=true;

  if(chosen===ans){
    // Correct! car accelerates, pass obstacle
    btn.classList.add('hit-ok');
    flash('ok');
    raceScore+=10+(raceLevel==='hard'?5:raceLevel==='medium'?2:0);
    raceLap++;
    raceSpeed=Math.min(3, 1+(raceLap*0.18));
    document.getElementById('finish-fill').style.width=(raceLap/raceTotal*100)+'%';
    document.getElementById('race-msg').textContent=raceLevel==='hard'?'🔥 Incrível!':'✅ Boa! Continue assim!';

    // remove obstacle with a zoom-out
    if(currentObs){
      currentObs.style.transition='transform .25s,opacity .25s';
      currentObs.style.transform='translateX(-50%) scale(0)';
      currentObs.style.opacity='0';
      setTimeout(()=>{if(currentObs){currentObs.remove();currentObs=null;}},250);
    }
    document.getElementById('answer-zone').innerHTML='';
    setRaceQuestion('');
    updateRaceHUD();
    if(raceLap>=raceTotal){
      raceOver=true;
      setTimeout(()=>showWin(`Você cruzou a linha de chegada!\n${raceScore} pontos 🏁`,'⭐⭐⭐','🏆'),600);
    }else{
      setTimeout(()=>{answerLocked=false;scheduleNextObstacle();},500);
    }
  }else{
    // Wrong! car crashes
    btn.classList.add('hit-err');
    flash('err');
    raceLives--;
    document.getElementById('race-msg').textContent='💥 Errou! Cuidado!';
    updateRaceHUD();

    // explosion at car position
    const car=document.getElementById('player-car');
    const exp=document.createElement('div');exp.className='explosion';exp.textContent='💥';
    exp.style.left=car.style.left;exp.style.bottom='28px';exp.style.transform='translateX(-50%)';
    document.getElementById('race-wrap').appendChild(exp);
    setTimeout(()=>exp.remove(),700);

    // show correct on another button
    document.querySelectorAll('.ans-btn').forEach(b=>{if(+b.textContent===ans)b.classList.add('hit-ok');});

    if(raceLives<=0){
      raceOver=true;
      setTimeout(()=>showWin(`Acabaram as vidas! Pontos: ${raceScore}`,raceScore>=70?'⭐⭐':'⭐','💥'),800);
    }else{
      setTimeout(()=>{answerLocked=false;if(currentObs){currentObs.remove();currentObs=null;}document.getElementById('answer-zone').innerHTML='';setRaceQuestion('');scheduleNextObstacle();},1000);
    }
  }
}

// Keyboard navigation: arrows to change lanes
document.addEventListener('keydown',e=>{
  if(currentGame!=='math'||raceOver)return;
  if(e.key==='ArrowLeft')moveCar(carLane-1);
  if(e.key==='ArrowRight')moveCar(carLane+1);
});

// ==================== PORTUGUESE GAME ====================
const PORT_WORDS=[
  {emoji:'🐶',word:'CACHORRO',syllables:['CA','CHOR','RO'],category:'animal'},
  {emoji:'🐱',word:'GATO',syllables:['GA','TO'],category:'animal'},
  {emoji:'🍎',word:'MACA',syllables:['MA','CA'],category:'fruta'},
  {emoji:'🌸',word:'FLOR',syllables:['FLOR'],category:'natureza'},
  {emoji:'🚗',word:'CARRO',syllables:['CAR','RO'],category:'objeto'},
  {emoji:'🏠',word:'CASA',syllables:['CA','SA'],category:'objeto'},
  {emoji:'🌙',word:'LUA',syllables:['LU','A'],category:'natureza'},
  {emoji:'⭐',word:'ESTRELA',syllables:['ES','TRE','LA'],category:'natureza'},
  {emoji:'🍌',word:'BANANA',syllables:['BA','NA','NA'],category:'fruta'},
  {emoji:'🐘',word:'ELEFANTE',syllables:['E','LE','FAN','TE'],category:'animal'},
  {emoji:'🦁',word:'LEAO',syllables:['LE','AO'],category:'animal'},
  {emoji:'🐠',word:'PEIXE',syllables:['PEI','XE'],category:'animal'},
  {emoji:'🎈',word:'BALAO',syllables:['BA','LAO'],category:'objeto'},
  {emoji:'🍕',word:'PIZZA',syllables:['PIZ','ZA'],category:'comida'},
  {emoji:'🦋',word:'BORBOLETA',syllables:['BOR','BO','LE','TA'],category:'animal'},
  {emoji:'🐸',word:'SAPO',syllables:['SA','PO'],category:'animal'},
  {emoji:'🎵',word:'MUSICA',syllables:['MU','SI','CA'],category:'arte'},
  {emoji:'🚀',word:'FOGUETE',syllables:['FO','GUE','TE'],category:'objeto'},
  {emoji:'🍭',word:'DOCE',syllables:['DO','CE'],category:'comida'},
  {emoji:'🌈',word:'ARCO',syllables:['AR','CO'],category:'natureza'},
];
let portMode='letters',portScore=0,portLives=3,portQnum=0,portTotal=10;
let portCurrent=null,portUserLetters=[],portShuffledLetters=[];
function setPortMode(btn,mode){document.querySelectorAll('.port-mode-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');portMode=mode;startPort();}
function startPort(){
  document.getElementById('win-overlay').classList.remove('show');
  portScore=0;portLives=3;portQnum=0;
  document.getElementById('p-score').textContent=0;
  document.getElementById('p-lives').textContent=3;
  document.getElementById('p-qnum').textContent=0;
  renderPortProgress();nextPortQuestion();
}
function renderPortProgress(){
  const el=document.getElementById('port-progress');el.innerHTML='';
  for(let i=0;i<portTotal;i++){const d=document.createElement('div');d.className='progress-dot';d.id='pdot-'+i;el.appendChild(d);}
}
function nextPortQuestion(){
  if(portQnum>=portTotal){showWin(`Você fez ${portScore} pontos!`,portScore>=90?'⭐⭐⭐':portScore>=60?'⭐⭐':'⭐','📚');return;}
  portCurrent=PORT_WORDS[Math.floor(Math.random()*PORT_WORDS.length)];
  document.getElementById('port-image').textContent=portCurrent.emoji;
  const interact=document.getElementById('port-interact');interact.innerHTML='';
  if(portMode==='letters')renderLettersMode(interact);
  else if(portMode==='syllables')renderSyllablesMode(interact);
  else renderMatchMode(interact);
}
function renderLettersMode(container){
  const word=portCurrent.word;
  document.getElementById('port-question').textContent='Soletrar a palavra:';
  document.getElementById('port-sub').textContent=portCurrent.emoji+' = ?';
  portUserLetters=new Array(word.length).fill('');
  portShuffledLetters=shuffle([...word,...'ABCDEFGHIJKLMNOPRSTUVZ'.split('').filter(l=>!word.includes(l)).slice(0,4)]);
  const slots=document.createElement('div');slots.className='letter-slots';
  for(let i=0;i<word.length;i++){
    const s=document.createElement('div');s.className='letter-slot';s.id='slot-'+i;s.textContent='';
    s.onclick=()=>removeLetterAt(i);slots.appendChild(s);
  }
  container.appendChild(slots);
  const kb=document.createElement('div');kb.className='letter-keyboard';
  portShuffledLetters.forEach(letter=>{
    const btn=document.createElement('button');btn.className='letter-key';btn.textContent=letter;
    btn.onclick=()=>typeLetterPort(letter,word,btn);kb.appendChild(btn);
  });
  container.appendChild(kb);
}
function typeLetterPort(letter,word,btn){
  const idx=portUserLetters.indexOf('');
  if(idx===-1)return;
  portUserLetters[idx]=letter;btn.disabled=true;
  document.getElementById('slot-'+idx).textContent=letter;
  document.getElementById('slot-'+idx).classList.add('filled');
  if(!portUserLetters.includes('')){
    const typed=portUserLetters.join('');
    if(typed===word){
      portUserLetters.forEach((_,i)=>document.getElementById('slot-'+i).classList.add('correct-slot'));
      flash('ok');portScore+=10;document.getElementById('pdot-'+portQnum).classList.add('done-ok');
    }else{
      portUserLetters.forEach((_,i)=>document.getElementById('slot-'+i).classList.add('wrong-slot'));
      flash('err');portLives--;document.getElementById('p-lives').textContent=portLives;
      document.getElementById('pdot-'+portQnum).classList.add('done-err');
      if(portLives<=0){setTimeout(()=>showWin(`Acabaram as vidas! Pontos: ${portScore}`,portScore>=50?'⭐⭐':'⭐','😅'),800);return;}
    }
    document.getElementById('p-score').textContent=portScore;
    portQnum++;document.getElementById('p-qnum').textContent=portQnum;
    setTimeout(nextPortQuestion,900);
  }
}
function removeLetterAt(idx){
  if(portUserLetters[idx]==='')return;
  const letter=portUserLetters[idx];portUserLetters[idx]='';
  document.getElementById('slot-'+idx).textContent='';
  document.getElementById('slot-'+idx).classList.remove('filled');
  document.querySelectorAll('.letter-key:disabled').forEach(btn=>{if(btn.textContent===letter){btn.disabled=false;}});
}
function renderSyllablesMode(container){
  const syllables=portCurrent.syllables;
  document.getElementById('port-question').textContent='Quantas sílabas tem a palavra?';
  document.getElementById('port-sub').textContent=portCurrent.word+' tem ___ sílabas';
  const correct=syllables.length;
  const wrongs=new Set();while(wrongs.size<3){let w=rand(1,5);if(w!==correct)wrongs.add(w);}
  const opts=shuffle([correct,...wrongs]);
  const grid=document.createElement('div');grid.className='port-answers';
  opts.forEach(opt=>{
    const btn=document.createElement('button');btn.className='port-ans-btn';
    btn.innerHTML=`${opt} ${opt===1?'sílaba':'sílabas'}<br><small style="font-size:.7em;opacity:.7">${syllables.slice(0,opt).join('-')}</small>`;
    btn.onclick=()=>checkPort(btn,opt,correct);grid.appendChild(btn);
  });
  const info=document.createElement('div');
  info.style.cssText='text-align:center;margin-bottom:8px;font-size:1.2rem;color:#c2006b;font-family:"Share Tech Mono",monospace;letter-spacing:2px;';
  info.textContent=syllables.join(' • ');
  container.appendChild(info);container.appendChild(grid);
}
function renderMatchMode(container){
  document.getElementById('port-question').textContent='Qual palavra corresponde à figura?';
  document.getElementById('port-sub').textContent='';
  const correct=portCurrent.word;
  const pool=PORT_WORDS.filter(w=>w.word!==correct);
  const wrongs=shuffle(pool).slice(0,3).map(w=>w.word);
  const opts=shuffle([correct,...wrongs]);
  const grid=document.createElement('div');grid.className='port-answers';
  opts.forEach(opt=>{
    const btn=document.createElement('button');btn.className='port-ans-btn';btn.textContent=opt;
    btn.onclick=()=>checkPort(btn,opt,correct);grid.appendChild(btn);
  });
  container.appendChild(grid);
}
let portAnswered=false;
function checkPort(btn,chosen,correct){
  if(portAnswered)return;portAnswered=true;
  if(chosen===correct||chosen===portCurrent.syllables.length){
    btn.classList.add('correct');flash('ok');portScore+=10;
    document.getElementById('pdot-'+portQnum).classList.add('done-ok');
  }else{
    btn.classList.add('wrong-ans');flash('err');portLives--;
    document.getElementById('pdot-'+portQnum).classList.add('done-err');
    document.getElementById('p-lives').textContent=portLives;
    document.querySelectorAll('.port-ans-btn').forEach(b=>{if(b.textContent===correct||+b.textContent===correct)b.classList.add('correct');});
    if(portLives<=0){setTimeout(()=>showWin(`Acabaram as vidas! Pontos: ${portScore}`,portScore>=50?'⭐⭐':'⭐','😅'),800);return;}
  }
  document.getElementById('p-score').textContent=portScore;
  portQnum++;document.getElementById('p-qnum').textContent=portQnum;
  setTimeout(()=>{portAnswered=false;nextPortQuestion();},900);
}

// ==================== INIT ====================
loadProfile();
initProfileUIState();
// if missing name or age, show the profile/login screen first
if(!playerProfile.name || !playerProfile.age){
  showProfileScreen();
} else {
  startAnimals();
  startRace();
  startPort();
}