let numberOfParticles = 24000;
let particles = [];
let cellSize = 10;
let rows;
let cols;
let flowField = [];

function setup() {
  createCanvas(1200, 1700);
  textAlign(CENTER, CENTER);
  angleMode(DEGREES);
  rows = floor(height / cellSize);
  cols = floor(width / cellSize);
  drawText()
  noFill()
  fillGrid();
  generateParticles();
}

function draw() {
  background(51);
  particles.forEach(particle => {
    particle.draw(this.context);
    particle.update();
  });
}

function drawText() {
  const gradient1 = drawingContext.createRadialGradient(width * 0.5, height * 0.5, 10, width * 0.5, height * 0.5, width);
  gradient1.addColorStop(0.2, "rgb(0,255,50)");
  gradient1.addColorStop(0.3, "rgb(200,50,50)");

  drawingContext.save(); // Save the current drawing context
  drawingContext.translate(width * 0.5, height * 0.5); // Translate to the center
  drawingContext.rotate(HALF_PI); // Rotate by 90 degrees

  drawingContext.font = "800px Impact";
  drawingContext.textAlign = "center";
  drawingContext.textBaseline = "middle";
  drawingContext.fillStyle = gradient1;
  drawingContext.fillText("FLOW", 0, 20, height * 0.9); // Draw text at the center (0, 0)

  drawingContext.restore(); // Restore the original drawing context
}

function fillGrid() {
  loadPixels() //P5 Honk Function generates magic variable pixels 0o
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const index = (y * width + x) * 4;
      console.log(index)
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      const grayscale = (red + green + blue) / 3;
      const colorAngle = ((grayscale / 255) * 6.28).toFixed(2);
      flowField.push({
        x: x,
        y: y,
        alpha: alpha,
        colorAngle: colorAngle
      })
    }
  }
}

function generateParticles() {
  particles = [];
  for (let i = 0; i < numberOfParticles; i++) {
    particles.push(new Particle());
  }
  particles.forEach(particle => particle.reset())
}

class Particle {
  constructor() {
    this.x = floor(random() * width);
    this.y = floor(random() * height);
    this.speedX;
    this.speedY;
    this.speedModifier = floor(random() * 1 + 0.2)
    this.history = [{ x: this.x, y: this.y }];
    this.maxLength = floor(random() * 60 + 20);
    this.angle = 0;
    this.newAngle = 0;
    this.angleCorrector = random() * 0.5 + 0.01;
    this.timer = this.maxLength * 2;
    this.colors = ["#fafafa"]
    this.color = this.colors[floor(random() * this.colors.length)];
  }

  draw() {
    beginShape();
    vertex(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      vertex(this.history[i].x, this.history[i].y);
    }
    stroke(this.color);
    endShape();
  }

  update() {
    this.timer--;
    if (this.timer >= 1) {
      let x = floor(this.x / cellSize);
      let y = floor(this.y / cellSize);
      let index = y * cols + x;

      if (flowField[index]) {
        this.newAngle = flowField[index].colorAngle;
        if (this.angle > this.newAngle) {
          this.angle -= this.angleCorrector;
        } else if (this.angle < this.newAngle) {
          this.angle += this.angleCorrector;
        } else {
          this.angle = this.newAngle;
        }
      }

      this.speedX = Math.cos(this.angle);
      this.speedY = Math.sin(this.angle);
      this.x += this.speedX * this.speedModifier;
      this.y += this.speedY * this.speedModifier;

      this.history.push({ x: this.x, y: this.y })
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }

  reset() {
    let attempts = 0;
    let resetSuccess = false;

    while (attempts < 1000 && !resetSuccess) {
      attempts++;
      let testIndex = floor(random() * flowField.length);
      if (flowField[testIndex].alpha > 0) {
        this.x = flowField[testIndex].x;
        this.y = flowField[testIndex].y;
        this.history = [{ x: this.x, y: this.y }];
        this.timer = this.maxLength * 2;
        resetSuccess = true;
      }
    }
    if (!resetSuccess) {
      this.x = random() * width;
      this.y = random() * height;
      this.history = [{ x: this.x, y: this.y }];
      this.timer = this.maxLength * 2;
    }
  }
}