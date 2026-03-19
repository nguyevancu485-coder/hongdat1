const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize",()=>{
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
});

/* GAME STATE */

let gameStarted=false;
let gamePaused=false;
let gameOver=false;

let score=0;
let hp=3;

/* TIME */

let lastTime=0;
let deltaTime=0;

/* MANA */

let mana=200;
const maxMana=200;
let manaTimer=0;

/* IMAGES */

const bgImg=new Image();
bgImg.src="Images/vutru2.png";

const playerImg=new Image();
playerImg.src="Images/maybaychiendau-removebg-preview.png";

const enemyImg=new Image();
enemyImg.src="Images/kedich1-removebg-preview.png";

const skillEImg=new Image();
skillEImg.src="Images/kynangE.webp";

const skillRImg=new Image();
skillRImg.src="Images/kynangR.webp";

const skillQImg=new Image();
skillQImg.src="Images/kynangQ.webp";

const skillWImg=new Image();
skillWImg.src="Images/kynangW.webp";

const coinImg=new Image();
coinImg.src="Images/coin.png";

/* PLAYER */

const player={
x:canvas.width/2-50,
y:canvas.height-120,
width:100,
height:100,
speed:500
};

/* ARRAYS */

let bullets=[];
let enemyBullets=[];
let enemies=[];
let coins=[];
let keys={};

/* COOLDOWN */

let cooldownE=0;
let cooldownR=0;
let cooldownQ=0;
let cooldownW=0;

const cooldownMaxE=10000;
const cooldownMaxR=5000;
const cooldownMaxQ=3000;
const cooldownMaxW=5000;

/* SKILLS */

let qActive=false;
let qEnd=0;

let shieldActive=false;
let shieldHP=0;
let shieldEnd=0;

/* INPUT */

document.addEventListener("keydown",(e)=>{

if(!gameStarted){
if(e.key==="Enter") gameStarted=true;
return;
}

if(e.key==="Escape"){
gamePaused=!gamePaused;
return;
}

if(gamePaused||gameOver) return;

keys[e.key.toLowerCase()]=true;

if(e.code==="Space") shoot();
if(e.key==="e") skillE();
if(e.key==="r") skillR();
if(e.key==="q") skillQ();
if(e.key==="w") skillW();

});

document.addEventListener("keyup",(e)=>{
keys[e.key.toLowerCase()]=false;
});

document.addEventListener("mousedown",()=>{

if(!gameStarted){
gameStarted=true;
return;
}

if(gameOver){
location.reload();
return;
}

shoot();

});

/* SHOOT */

function shoot(){

if(qActive){

bullets.push({x:player.x+50,y:player.y,width:8,height:20,speed:800,vx:-200});
bullets.push({x:player.x+50,y:player.y,width:8,height:20,speed:800,vx:0});
bullets.push({x:player.x+50,y:player.y,width:8,height:20,speed:800,vx:200});

}else{

bullets.push({
x:player.x+50,
y:player.y,
width:8,
height:20,
speed:800,
vx:0
});

}

}

/* SKILLS */

function skillE(){

if(Date.now()<cooldownE||mana<20) return;

mana-=20;
cooldownE=Date.now()+cooldownMaxE;

for(let i=-3;i<=3;i++){

bullets.push({
x:player.x+50,
y:player.y,
width:8,
height:20,
speed:800,
vx:i*150
});

}

}

function skillR(){

if(Date.now()<cooldownR||mana<50) return;

mana-=50;
cooldownR=Date.now()+cooldownMaxR;

}

function skillQ(){

if(Date.now()<cooldownQ||mana<10) return;

mana-=10;
cooldownQ=Date.now()+cooldownMaxQ;

qActive=true;
qEnd=Date.now()+10000;

}

function skillW(){

if(Date.now()<cooldownW||mana<20) return;

mana-=20;
cooldownW=Date.now()+cooldownMaxW;

shieldActive=true;
shieldHP=10;
shieldEnd=Date.now()+10000;

}

/* SPAWN ENEMY */

function spawnEnemy(){

if(!gameStarted||gamePaused) return;

enemies.push({
x:Math.random()*(canvas.width-70),
y:-70,
width:70,
height:70,
speed:150,
vx:(Math.random()-0.5)*200,
shootTimer:0
});

}

setInterval(spawnEnemy,1200);

/* UPDATE */

function update(dt){

if(!gameStarted||gamePaused||gameOver) return;

/* MANA REGEN */

manaTimer+=dt;

if(manaTimer>=0.2){
mana=Math.min(maxMana,mana+10);
manaTimer=0;
}

/* SKILL TIME */

if(qActive && Date.now()>qEnd) qActive=false;
if(shieldActive && Date.now()>shieldEnd) shieldActive=false;

/* MOVEMENT OPTIMIZED */

let dx=0;
let dy=0;

if(keys["a"]) dx-=1;
if(keys["d"]) dx+=1;
if(keys["w"]) dy-=1;
if(keys["s"]) dy+=1;

let length=Math.sqrt(dx*dx+dy*dy);

if(length>0){
dx/=length;
dy/=length;

player.x+=dx*player.speed*dt;
player.y+=dy*player.speed*dt;
}

/* LIMIT */

player.x=Math.max(0,Math.min(canvas.width-player.width,player.x));
player.y=Math.max(0,Math.min(canvas.height-player.height,player.y));

/* BULLETS */

bullets.forEach((b,i)=>{
b.y-=b.speed*dt;
b.x+=b.vx*dt;
if(b.y<-50) bullets.splice(i,1);
});

/* ENEMY */

enemies.forEach((e,i)=>{

e.y+=e.speed*dt;
e.x+=e.vx*dt;

if(e.x<0||e.x+e.width>canvas.width) e.vx*=-1;

e.shootTimer++;

if(e.shootTimer%120===0){

let dx=player.x-e.x;
let dy=player.y-e.y;
let dist=Math.sqrt(dx*dx+dy*dy);

enemyBullets.push({
x:e.x+35,
y:e.y+70,
width:6,
height:18,
vx:(dx/dist)*250,
vy:(dy/dist)*250
});

}

if(e.y>canvas.height+100){
enemies.splice(i,1);
}

});

/* ENEMY BULLETS */

enemyBullets.forEach((b,i)=>{

b.x+=b.vx*dt;
b.y+=b.vy*dt;

if(b.y>canvas.height+50) enemyBullets.splice(i,1);

});

/* COIN */

coins.forEach((c,i)=>{

let dx=player.x-c.x;
let dy=player.y-c.y;

if(Math.sqrt(dx*dx+dy*dy)<50){

coins.splice(i,1);
score+=50;
document.getElementById("score").innerText="Điểm: "+score;

}

});

checkCollision();

}

/* COLLISION */

function checkCollision(){

enemies.forEach((e,ei)=>{

bullets.forEach((b,bi)=>{

if(
b.x<e.x+e.width &&
b.x+b.width>e.x &&
b.y<e.y+e.height &&
b.y+b.height>e.y
){

enemies.splice(ei,1);
bullets.splice(bi,1);

score++;
document.getElementById("score").innerText="Điểm: "+score;

if(Math.random()<0.3){
coins.push({x:e.x,y:e.y});
}

}

});

});

}

/* DRAW */

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);

ctx.drawImage(playerImg,player.x,player.y,player.width,player.height);

/* BULLETS */

bullets.forEach(b=>{
ctx.fillStyle="red";
ctx.fillRect(b.x,b.y,b.width,b.height);
});

/* ENEMY BULLETS */

enemyBullets.forEach(b=>{
ctx.fillStyle="yellow";
ctx.fillRect(b.x,b.y,b.width,b.height);
});

/* ENEMY */

enemies.forEach(e=>{
ctx.drawImage(enemyImg,e.x,e.y,e.width,e.height);
});

/* COINS */

coins.forEach(c=>{
ctx.drawImage(coinImg,c.x,c.y,30,30);
});

/* HP */

for(let i=0;i<hp;i++){
ctx.font="30px Arial";
ctx.fillText("❤️",canvas.width-40-i*40,40);
}

/* MANA BAR */

ctx.fillStyle="black";
ctx.fillRect(canvas.width-220,60,200,20);

ctx.fillStyle="cyan";
ctx.fillRect(canvas.width-220,60,(mana/maxMana)*200,20);

ctx.strokeStyle="white";
ctx.strokeRect(canvas.width-220,60,200,20);

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.textAlign="center";
ctx.fillText(mana+"/"+maxMana,canvas.width-120,75);

/* SKILL UI */

drawSkillUI();

/* PAUSE */

if(gamePaused){

ctx.fillStyle="rgba(0,0,0,0.6)";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="white";
ctx.font="50px Arial";
ctx.textAlign="center";

ctx.fillText("TẠM DỪNG",canvas.width/2,canvas.height/2-40);

ctx.font="26px Arial";
ctx.fillText("Ấn ESC để chơi tiếp",canvas.width/2,canvas.height/2+20);

}

/* GAME OVER */

if(gameOver){

ctx.fillStyle="rgba(0,0,0,0.7)";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="white";
ctx.font="60px Arial";
ctx.textAlign="center";

ctx.fillText("BẠN ĐÃ THUA",canvas.width/2,canvas.height/2);

ctx.font="30px Arial";
ctx.fillText("Click chuột để chơi lại",canvas.width/2,canvas.height/2+60);

}

}

/* SKILL UI */

function drawSkillUI(){

let size=60;
let y=canvas.height-100;

ctx.drawImage(skillEImg,30,y,size,size);
drawCooldown(30,y,cooldownE,10000);

ctx.drawImage(skillRImg,110,y,size,size);
drawCooldown(110,y,cooldownR,5000);

ctx.drawImage(skillQImg,190,y,size,size);
drawCooldown(190,y,cooldownQ,3000);

ctx.drawImage(skillWImg,270,y,size,size);
drawCooldown(270,y,cooldownW,5000);

}

/* COOLDOWN */

function drawCooldown(x,y,end,max){

let remain=end-Date.now();

if(remain<=0) return;

let percent=remain/max;

ctx.fillStyle="rgba(0,0,0,0.6)";

ctx.beginPath();
ctx.moveTo(x+30,y+30);

ctx.arc(
x+30,
y+30,
30,
-Math.PI/2,
-Math.PI/2+Math.PI*2*percent,
true
);

ctx.closePath();
ctx.fill();

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.textAlign="center";

ctx.fillText((remain/1000).toFixed(1),x+30,y+35);

}

/* LOOP */

function gameLoop(time){

deltaTime=(time-lastTime)/1000;
lastTime=time;

update(deltaTime);
draw();

requestAnimationFrame(gameLoop);

}

gameLoop();