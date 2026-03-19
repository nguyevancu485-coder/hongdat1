const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startText = document.getElementById("startText");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== IMAGES =====
const bg = new Image();
bg.src = "images/background.png";

const pipeImg = new Image();
pipeImg.src = "images/pipes.png";

const birdFrames = ["images/b1.png","images/b2.png","images/b3.png","images/b4.png"]
.map(src => { let i = new Image(); i.src = src; return i; });

// ===== GAME STATE =====
let gameState = "start";
let score = 0;

// ===== BIRD =====
let bird = {
    x: 150,
    y: 250,
    w: 55,
    h: 45,
    vel: 0,
    gravity: 0.5,
    lift: -10,
    frame: 0
};

// ===== PIPES =====
let pipes = [];
let gap = 190;
let pipeWidth = 100;
let spawnTimer = 0;

// ===== INPUT =====
function jump() {
    if (gameState === "playing") bird.vel = bird.lift;
}

document.addEventListener("keydown", e => {
    if (e.code === "Enter" && gameState === "start") startGame();
    if (["ArrowUp","Space","KeyW"].includes(e.code)) jump();
});

canvas.addEventListener("mousedown", () => {
    if (gameState === "start") startGame();
    jump();
});

function startGame() {
    gameState = "playing";
    startText.style.display = "none";
    score = 0;
    bird.y = 250;
    bird.vel = 0;
    pipes = [];
}

// ===== LOOP =====
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();

// ===== UPDATE =====
function update() {
    if (gameState !== "playing") return;

    bird.vel += bird.gravity;
    bird.y += bird.vel;
    bird.frame += 0.2;

    spawnTimer++;
    if (spawnTimer > 95) {
        spawnTimer = 0;
        let topHeight = Math.random() * (canvas.height - gap - 200) + 50;
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + gap,
            passed: false
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= 3.5;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
        }

        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.w > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.h > pipe.bottom)
        ) gameOver();
    });

    if (bird.y + bird.h > canvas.height || bird.y < 0) gameOver();
}

function gameOver() {
    gameState = "start";
    startText.innerHTML = "Bạn đã thua";
    startText.style.display = "block";
}

// ===== DRAW =====
function draw() {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    pipes.forEach(pipe => {
        // Ống dưới
        ctx.drawImage(pipeImg, pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);

        // Ống trên (lật ngược)
        ctx.save();
        ctx.translate(pipe.x + pipeWidth, pipe.top);
        ctx.scale(-1, -1);
        ctx.drawImage(pipeImg, 0, 0, pipeWidth, pipe.top);
        ctx.restore();
    });

    let frame = birdFrames[Math.floor(bird.frame) % birdFrames.length];
    ctx.drawImage(frame, bird.x, bird.y, bird.w, bird.h);

    // ===== SCORE UI MODERN =====
    ctx.fillStyle = "white";
    ctx.font = "bold 70px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 10;
    ctx.fillText(score, canvas.width / 2, 90);
}
