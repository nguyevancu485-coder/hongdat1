const canvas = document.getElementById("gamecv");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================= IMAGES ================= */
const planeImg = new Image();
planeImg.src = "ImageGames/maybay.png";

const birdImgs = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `ImageGames/frame-${i}.png`;
  birdImgs.push(img);
}

const fuelImg = new Image();
fuelImg.src = "ImageGames/nhienlieu.png";

const bgImg = new Image();
bgImg.src = "ImageGames/background.png";

/* ================= OBJECTS ================= */
const plane = { x: 60, y: canvas.height / 2, w: 50, h: 50, speed: 10 };
const obstacles = [];
const fuels = [];
const lasers = [];

/* ================= PLAYER ================= */
let lives = 3;
let mana = 200;
const maxMana = 200;
let score = 0;
let time = 120;
let isGameOver = false;

/* ================= LEVEL ================= */
let level = 1;
const levels = {
  1: { speed: 2, spawn: 1500, goal: 50 },
  2: { speed: 3, spawn: 1000, goal: 120 },
  3: { speed: 4, spawn: 700, goal: 200 },
};

let obstacleTimer;

/* ================= SPEED UP ================= */
let enemyKill = 0;
let speedUp = false;
let speedUpTime = 0;

/* ================= SKILLS ================= */
let beamActive = false;
let beamEnd = 0;
let ultiActive = false;
let ultiTime = 0;

/* ================= INPUT ================= */
const keys = {};
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  // Shoot
  if (e.code === "Space" && mana > 0) {
    lasers.push({
      x: plane.x + plane.w,
      y: plane.y + plane.h / 2 - 2,
      w: 20,
      h: 4,
      speed: 15
    });
    mana--;
  }

  // Beam
  if (e.key.toLowerCase() === "e" && mana >= 150 && !beamActive) {
    mana -= 150;
    beamActive = true;
    beamEnd = performance.now() + 3500;
  }

  // Ultimate
  if (e.key.toLowerCase() === "q" && mana >= 190 && !ultiActive) {
    mana -= 190;
    ultiActive = true;
    ultiTime = performance.now();
    score += obstacles.length * 5;
    obstacles.length = 0;
  }
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* ================= FUNCTIONS ================= */
function startLevel() {
  obstacles.length = 0;
  fuels.length = 0;
  lasers.length = 0;
  enemyKill = 0;
  speedUp = false;
  time = 120;

  clearInterval(obstacleTimer);
  obstacleTimer = setInterval(() => {
    obstacles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 50),
      speed: levels[level].speed
    });
  }, levels[level].spawn);
}

function updatePlane() {
  if ((keys["w"] || keys["arrowup"]) && plane.y > 0) plane.y -= plane.speed;
  if ((keys["s"] || keys["arrowdown"]) && plane.y < canvas.height - plane.h)
    plane.y += plane.speed;
  if ((keys["a"] || keys["arrowleft"]) && plane.x > 0) plane.x -= plane.speed;
  if ((keys["d"] || keys["arrowright"]) && plane.x < canvas.width - plane.w)
    plane.x += plane.speed;
}

function checkCollisions() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];

    // Plane hit
    if (
      plane.x < o.x + 50 &&
      plane.x + plane.w > o.x &&
      plane.y < o.y + 50 &&
      plane.y + plane.h > o.y
    ) {
      obstacles.splice(i, 1);
      lives--;
      if (lives <= 0) endGame("Bạn đã thua");
    }

    // Beam
    if (
      beamActive &&
      o.x > plane.x &&
      o.y > plane.y - 10 &&
      o.y < plane.y + plane.h + 10
    ) {
      obstacles.splice(i, 1);
      score += 5;
      enemyKill++;
    }
  }

  // Laser
  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    l.x += l.speed;
    if (l.x > canvas.width) lasers.splice(i, 1);

    for (let j = obstacles.length - 1; j >= 0; j--) {
      const o = obstacles[j];
      if (
        l.x < o.x + 50 &&
        l.x + l.w > o.x &&
        l.y < o.y + 50 &&
        l.y + l.h > o.y
      ) {
        obstacles.splice(j, 1);
        lasers.splice(i, 1);
        score += 5;
        enemyKill++;
        break;
      }
    }
  }

  // Fuel
  for (let i = fuels.length - 1; i >= 0; i--) {
    const f = fuels[i];
    if (
      plane.x < f.x + 40 &&
      plane.x + plane.w > f.x &&
      plane.y < f.y + 40 &&
      plane.y + plane.h > f.y
    ) {
      mana = Math.min(maxMana, mana + 100);
      fuels.splice(i, 1);
    }
  }
}

function checkSpeedUp() {
  if (speedUp) return;
  if (time <= 110 || enemyKill >= 15) {
    speedUp = true;
    speedUpTime = performance.now();
    obstacles.forEach(o => (o.speed *= 1.8));
  }
}

function checkLevelUp() {
  if (score >= levels[level].goal) {
    level++;
    if (level > 3) endGame("Bạn đã chiến thắng!");
    else {
      alert("Qua màn " + (level - 1));
      startLevel();
    }
  }
}

function endGame(text) {
  isGameOver = true;
  alert(text + " | Điểm: " + score);
  location.reload();
}

/* ================= DRAW ================= */
function drawUI() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Điểm: " + score, 10, 30);
  ctx.fillText("Màn: " + level, 10, 55);
  ctx.fillText("Máu: " + "❤️".repeat(lives), 10, 80);
  ctx.fillText("Time: " + Math.round(time), 10, 105);

  ctx.fillStyle = "#444";
  ctx.fillRect(10, 130, 200, 16);
  ctx.fillStyle = "#00bfff";
  ctx.fillRect(10, 130, (mana / maxMana) * 200, 16);
  ctx.strokeRect(10, 130, 200, 16);
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(`Mana: ${mana}/${maxMana}`, 15, 143);
}

function drawWarning() {
  if (!speedUp) return;
  const t = performance.now() - speedUpTime;
  if (t > 2500) return;
  ctx.globalAlpha = 1 - t / 2500;
  ctx.fillStyle = "red";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("⚠ KẺ ĐỊCH BẮT ĐẦU TĂNG TỐC!", canvas.width / 2, canvas.height / 2);
  ctx.globalAlpha = 1;
}

function drawUltimate() {
  if (!ultiActive) return;
  const t = performance.now() - ultiTime;
  if (t > 800) {
    ultiActive = false;
    return;
  }
  ctx.globalAlpha = 1 - t / 800;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
}

/* ================= LOOP ================= */
setInterval(() => {
  if (mana < maxMana) mana++;
}, 500);

setInterval(() => {
  fuels.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 40)
  });
}, 7000);

let birdFrame = 0, birdDelay = 0;

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  updatePlane();
  checkCollisions();
  checkSpeedUp();
  checkLevelUp();

  birdDelay++;
  if (birdDelay > 6) {
    birdFrame = (birdFrame + 1) % birdImgs.length;
    birdDelay = 0;
  }

  obstacles.forEach(o => {
    o.x -= o.speed;
    ctx.drawImage(birdImgs[birdFrame], o.x, o.y, 50, 50);
  });

  lasers.forEach(l => {
    ctx.fillStyle = "red";
    ctx.fillRect(l.x, l.y, l.w, l.h);
  });

  if (beamActive) {
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.fillRect(plane.x + plane.w, plane.y + plane.h / 2 - 6, canvas.width, 12);
    if (performance.now() > beamEnd) beamActive = false;
  }

  ctx.drawImage(planeImg, plane.x, plane.y, plane.w, plane.h);

  time -= 1 / 60;
  drawUI();
  drawWarning();
  drawUltimate();

  if (time <= 0) endGame("Hết giờ");
  if (!isGameOver) requestAnimationFrame(loop);
}

/* ================= START ================= */
startLevel();
loop();