class Graphic{
  constructor(x, y, radius){
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(ctx){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fill();
  }

  update(){}
}

class Obstacle extends Graphic{
  constructor(x, color){
    super(x, 0, 50);
    this.color = color;
    this.velocityY = 5;
  }

  update(){
    this.y += this.velocityY;
  }
}

class Navigator extends Graphic{
  constructor(x, color){
    super(x, 1000, 100);
    this.color = color;
  }
}

var running = true;

var canvasLeft = document.getElementById("left");
var ctxLeft = canvasLeft.getContext("2d");
canvasLeft.width = 1000;
canvasLeft.height = 1000;

var canvasRight = document.getElementById("right");
var ctxRight = canvasRight.getContext("2d");
canvasRight.width = 1000;
canvasRight.height = 1000;

var obstacleLeft = [];
var obstacleRight = [];

var navigatorLeft = new Navigator(500, "rgb(150, 230, 230)");
var navigatorRight = new Navigator(500, "rgb(230, 230, 150)");

var x = 0;

var hand;

// Leap.loop uses browser's requestAnimationFrame
var options = { enableGestures: true, host:'192.168.0.133' };

var score = 0;

function keyPress(event){
  if(event.which == 32){
    if(running){
      pause();
    } else {
      start();
    }
  }
}

// Main Leap Loop
Leap.loop(options, function(frame) {
  for (var i = 0, len = frame.hands.length; i < len; i++) {
    hand = frame.hands[i];

    x = hand.palmPosition[0]*3;
    if(hand.type == "left"){
      x += 1000;
    }

    if(x < 0){
      x = 0;
    } else if(x > 1000){
      x = 1000;
    }

    if(hand.type == "left"){

      navigatorLeft.x = x;

    } else {

      navigatorRight.x = x;
    }
  }
});

function draw(){
  if(running){
    score++;
    document.getElementById("score").innerHTML = "Score : "+score;
    drawGeneral(ctxLeft, canvasLeft, navigatorLeft, obstacleLeft);
    drawGeneral(ctxRight, canvasRight, navigatorRight, obstacleRight);
  }
}

function drawGeneral(ctx, canvas, navigator_, obstacles){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  navigator_.draw(ctx);

  for(let i=0; i < obstacles.length; i++){
    let obstacle = obstacles[i];
    obstacle.update();
    obstacle.draw(ctx);
  }

  if(obstacles.length > 0 && hasCollide(navigator_, obstacles[0])){
    stop();
  }

  if(obstacles.length > 0 && obstacles[0].y > 1000 + (obstacles[0].radius)/2){
    obstacles.splice(0, 1);
  }

  if(obstacles.length == 0 || (obstacles[obstacles.length-1].y > 300 && Math.floor(Math.random() * 10) > 5)){
    obstacles.push(new Obstacle(Math.floor(Math.random() * 1000)));
  }
}

function hasCollide(nav, obs){
  var dx = nav.x - obs.x;
  var dy = nav.y - obs.y;
  var distance = Math.sqrt(dx * dx + dy * dy);

  return (distance < nav.radius + obs.radius);
}

function start(){
  running = true;
  document.getElementById("pauseText").style.visibility = "hidden";
}

function pause(){
  running = false;
  document.getElementById("pauseText").style.visibility = "visible";
}

function stop(){
  running = false;
  obstacleRight = [];
  obstacleLeft = [];
  document.getElementById("pauseText").style.visibility = "visible";
  score = 0;
}

window.onload = function (){
  window.setInterval(draw, 10);
  start();
}