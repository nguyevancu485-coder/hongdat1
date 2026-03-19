const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = {
    width:120,
    height:10,
    x:(canvas.width-120)/2,
    speed:7
};

let rightPressed=false;
let leftPressed=false;

const ballRadius=10;

let ball={
    x:canvas.width/2,
    y:canvas.height-30,
    dx:4,
    dy:-4
};

let brickRowCount=6;
let brickColumnCount=7;

const brickWidth=75;
const brickHeight=20;
const brickPadding=10;
const brickOffsetTop=40;
const brickOffsetLeft=30;

let bricks=[];

let score=0;
let lives=3;

let gameOver=false;

/* hiệu ứng bling */
let sparks=[];

document.addEventListener("keydown",keyDownHandler);
document.addEventListener("keyup",keyUpHandler);

canvas.addEventListener("click",function(){
    if(gameOver){
        document.location.reload();
    }
});

function keyDownHandler(e){

    if(e.key=="Right"||e.key=="ArrowRight"){
        rightPressed=true;
    }

    else if(e.key=="Left"||e.key=="ArrowLeft"){
        leftPressed=true;
    }
}

function keyUpHandler(e){

    if(e.key=="Right"||e.key=="ArrowRight"){
        rightPressed=false;
    }

    else if(e.key=="Left"||e.key=="ArrowLeft"){
        leftPressed=false;
    }
}

function initBricks(){

    bricks=[];

    for(let c=0;c<brickColumnCount;c++){

        bricks[c]=[];

        for(let r=0;r<brickRowCount;r++){

            const x=c*(brickWidth+brickPadding)+brickOffsetLeft;
            const y=r*(brickHeight+brickPadding)+brickOffsetTop;

            bricks[c][r]={
                x:x,
                y:y,
                status:1,
                color:getRandomColor()
            };
        }
    }
}

function getRandomColor(){

    const colors=[
        "#f9a8d4",
        "#d8b4fe",
        "#c084fc",
        "#f472b6",
        "#a78bfa"
    ];

    return colors[Math.floor(Math.random()*colors.length)];
}

function drawBricks(){

    for(let c=0;c<brickColumnCount;c++){

        for(let r=0;r<brickRowCount;r++){

            let b=bricks[c][r];

            if(b.status==1){

                ctx.beginPath();
                ctx.rect(b.x,b.y,brickWidth,brickHeight);
                ctx.fillStyle=b.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBall(){

    ctx.beginPath();

    ctx.arc(ball.x,ball.y,ballRadius,0,Math.PI*2);

    /* bóng phát sáng */
    ctx.shadowColor="#ffffff";
    ctx.shadowBlur=20;

    let g=ctx.createRadialGradient(
        ball.x,ball.y,2,
        ball.x,ball.y,ballRadius
    );

    g.addColorStop(0,"#ffffff");
    g.addColorStop(1,"#f9a8d4");

    ctx.fillStyle=g;
    ctx.fill();

    ctx.shadowBlur=0;

    ctx.closePath();
}

function drawPaddle(){

    ctx.beginPath();
    ctx.rect(paddle.x,canvas.height-paddle.height,paddle.width,paddle.height);
    ctx.fillStyle="#ffffff";
    ctx.fill();
    ctx.closePath();
}

function drawScore(){

    ctx.font="16px Arial";
    ctx.fillStyle="#ffffff";
    ctx.fillText("Score: "+score,8,20);
}

function drawLives(){

    ctx.font="16px Arial";
    ctx.fillStyle="#ffffff";
    ctx.fillText("Lives: "+lives,canvas.width-80,20);
}

/* vẽ hiệu ứng bling */
function drawSparks(){

    for(let i=sparks.length-1;i>=0;i--){

        let s=sparks[i];

        ctx.beginPath();
        ctx.arc(s.x,s.y,2,0,Math.PI*2);
        ctx.fillStyle="#ffffff";
        ctx.fill();
        ctx.closePath();

        s.x+=s.dx;
        s.y+=s.dy;

        s.life--;

        if(s.life<=0){
            sparks.splice(i,1);
        }
    }
}

function collisionDetection(){

    for(let c=0;c<brickColumnCount;c++){

        for(let r=0;r<brickRowCount;r++){

            let b=bricks[c][r];

            if(b.status==1){

                if(
                    ball.x>b.x &&
                    ball.x<b.x+brickWidth &&
                    ball.y>b.y &&
                    ball.y<b.y+brickHeight
                ){

                    ball.dy=-ball.dy;
                    b.status=0;

                    score++;

                    /* tạo hiệu ứng bling */
                    for(let i=0;i<8;i++){
                        sparks.push({
                            x:ball.x,
                            y:ball.y,
                            dx:(Math.random()-0.5)*4,
                            dy:(Math.random()-0.5)*4,
                            life:20
                        });
                    }

                    if(score==brickRowCount*brickColumnCount){
                        gameOver=true;
                    }
                }
            }
        }
    }
}

function drawGameOver(){

    let gradient=ctx.createLinearGradient(
        0,0,
        canvas.width,canvas.height
    );

    gradient.addColorStop(0,"#d8b4fe");
    gradient.addColorStop(1,"#f9a8d4");

    ctx.fillStyle=gradient;
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle="#ffffff";
    ctx.font="bold 50px Arial";
    ctx.textAlign="center";

    ctx.fillText(
        "GAME OVER",
        canvas.width/2,
        canvas.height/2-20
    );

    ctx.font="24px Arial";

    ctx.fillText(
        "Score: "+score,
        canvas.width/2,
        canvas.height/2+20
    );

    ctx.font="20px Arial";

    ctx.fillText(
        "Click để chơi lại",
        canvas.width/2,
        canvas.height/2+60
    );
}

function draw(){

    if(gameOver){

        drawGameOver();
        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawSparks();

    collisionDetection();

    if(ball.x+ball.dx>canvas.width-ballRadius ||
       ball.x+ball.dx<ballRadius){

        ball.dx=-ball.dx;
    }

    if(ball.y+ball.dy<ballRadius){

        ball.dy=-ball.dy;
    }

    else if(ball.y+ball.dy>canvas.height-ballRadius){

        if(
            ball.x>paddle.x &&
            ball.x<paddle.x+paddle.width
        ){

            ball.dy=-ball.dy;

        }else{

            lives--;

            if(!lives){

                gameOver=true;

            }else{

                ball.x=canvas.width/2;
                ball.y=canvas.height-30;

                ball.dx=4;
                ball.dy=-4;

                paddle.x=(canvas.width-paddle.width)/2;
            }
        }
    }

    if(rightPressed &&
       paddle.x<canvas.width-paddle.width){

        paddle.x+=paddle.speed;
    }

    else if(leftPressed &&
            paddle.x>0){

        paddle.x-=paddle.speed;
    }

    ball.x+=ball.dx;
    ball.y+=ball.dy;

    requestAnimationFrame(draw);
}

function startGame(){

    document
    .getElementById("startScreen")
    .style.display="none";

    initBricks();
    draw();
}