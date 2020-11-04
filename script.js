// VISUAL CLASSES -----------------------------------------------------------
class Graphic{
  constructor(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw(ctx){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fill();
  }

  update(){}


  hasCollide(obstacle){
    let dx = this.x - obstacle.x;
    let dy = this.y - obstacle.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    return (distance < this.radius + obstacle.radius);
  }
}

class Obstacle extends Graphic{
  constructor(x, color){
    super(x, 0, 50, color);
    this.velocityY = 5;
  }

  update(){
    this.y += this.velocityY;
  }
}

/*
A navigator is a circle representing the player.
*/
class Navigator extends Graphic{
  constructor(x, color){
    super(x, 1000, 100, color);
  }
}


// VARIABLE INITIALISATIONS -----------------------------------------------------------
// Pannels initialisation
let pannels = {
  left: {
    canvas: document.getElementById("left"),
    ctx: null,
    obstacles: [],
    navigator: new Navigator(500, "rgb(150, 230, 230)")
  },

  right:{
    canvas: document.getElementById("right"),
    ctx: null,
    obstacles: [],
    navigator: new Navigator(500, "rgb(230, 230, 150)"),
  }
};

for(const side in pannels){
  pannels[side].ctx = pannels[side].canvas.getContext("2d");
  pannels[side].canvas.width = 1000;
  pannels[side].canvas.height = 1000;
}

let score = 0;
// Leap.loop uses browser's requestAnimationFrame
let options = { enableGestures: true };


// ----------------------------------------------------------- LEAP MOTION LOOP
// Main Leap Loop
Leap.loop(options, function(frame) {
  let x;
  let hand;

  for (let i = 0, len = frame.hands.length; i < len; i++) {
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

    pannels[hand.type].navigator.x = x
  }
});

// GAME STATE CHANGER -----------------------------------------------------------
let running = true;

/*
Start (or continue) the game.
*/
function start(){
  running = true;
  document.getElementById("pause").style.visibility = "hidden";
}

/*
Pause the game.
*/
function pause(){
  running = false;
  document.getElementById("pause").style.visibility = "visible";
}

/*
Stop the game and reset the score and the obstacles.
*/
function stop(){
  running = false;

  for(const side in pannels){
    pannels[side].obstacles = [];
  }

  document.getElementById("pause").style.visibility = "visible";
  score = 0;
}

/*
Handle if the spacebar is pressed. It will pause or play the game depending of its state.
*/
function keyPress(event){
  if(event.which == 32){
    if(running){
      pause();
    } else {
      start();
    }
  }
}

// GAME LOOPS -----------------------------------------------------------
/*
Draw pannel and its elements (obstacles and navigator).
*/
function drawPannel(side){
  let ctx = side.ctx;
  let canvas = side.canvas;
  let navigator_ = side.navigator;
  let obstacles = side.obstacles;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  navigator_.draw(ctx);

  for(let i=0; i < obstacles.length; i++){
    let obstacle = obstacles[i];
    obstacle.draw(ctx);
  }
}

/*
Update the pannel's elements (obstacles and navigator).
*/
function updatePannel(side){
  let navigator_ = side.navigator;
  let obstacles = side.obstacles;

  // Update obstacles
  for(let i=0; i < obstacles.length; i++){
    let obstacle = obstacles[i];
    obstacle.update();
  }

  // Delete the lowest obstacle if it is sufficiently out of the screen.
  if(obstacles.length > 0 && obstacles[0].y > 1000 + (obstacles[0].radius)/2){
    obstacles.splice(0, 1);
  }

  /* 
  Add an obstacle if 
    - there is no obstacle yet
            OR
      - the uppest obstacle is low enough to let space for a new obstacle 
                AND
      - depending on a propability of 0.5
  */
  if(obstacles.length == 0 || (obstacles[obstacles.length-1].y > 300 && Math.floor(Math.random() * 10) > 5)){
    obstacles.push(new Obstacle(Math.floor(Math.random() * 1000)));
  }
}

/*
Check if the side must end the game. End it, if it is the case.
*/
function checkEndSide(side){
  let navigator_ = side.navigator;
  let obstacles = side.obstacles;

  // Stop the game if there is a collision between the navigator and the lowest obstacle.
  if(obstacles.length > 0 && navigator_.hasCollide(obstacles[0])){
    stop();
  }
}

/*
Main loop of the game.
*/
function loop(){
  if(running){
    // Update score
    score++;
    document.getElementById("score").innerHTML = "Score : "+score;
    // Update and draw pannels
    for(const side in pannels){
      updatePannel(pannels[side]);
      drawPannel(pannels[side]);
      checkEndSide(pannels[side]);
    }
  }
}


window.onload = function (){
  window.setInterval(loop, 10);
  start();
}