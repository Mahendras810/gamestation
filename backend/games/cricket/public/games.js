window.GameScene = class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('ground', '/assets/sprites/ground.jpeg');
    this.load.image('batsman', '/assets/sprites/batsman.png');
    this.load.image('ball', '/assets/sprites/ball.png');
    this.load.image('stumps', '/assets/sprites/stumps.png');
  }

  create() {
    const width = this.sys.game.canvas.width;
    const height = this.sys.game.canvas.height;

    // Scale factor for responsive design
    const scaleFactor = Math.min(width / 1100, height / 500);

    // Ground background
    this.add.image(width / 2, height / 2, 'ground')
      .setDisplaySize(width, height)
      .setOrigin(0.5);

    // Stumps (behind batsman)
    this.stumps = this.add.image(width * 0.3, height * 0.85, 'stumps')
      .setOrigin(0.5, 1)
      .setScale(scaleFactor * 0.1);

    // Batsman (moved down)
    this.batsman = this.add.image(width * 0.35, height * 0.88, 'batsman')
      .setOrigin(0.5, 1)
      .setScale(scaleFactor * 0.05);

    // Ball (smaller size)
    this.ball = this.physics.add.image(width * 0.8, height * 0.5, 'ball')
      .setScale(scaleFactor * 0.05) // Smaller ball size
      .setCircle(20) // Adjusted collision circle
      .setBounce(0.8)
      .setCollideWorldBounds(true);

    // Make ball invisible initially
    this.ball.setVisible(false);

    this.physics.world.setBounds(0, 0, width, height);

    // Click to hit
    this.input.on('pointerdown', () => {
      this.hitBall();
    });

    // Automatic ball delivery
    this.time.addEvent({
      delay: 2000, // Every 2 seconds
      callback: this.deliverBall,
      callbackScope: this,
      loop: true
    });
  }

  deliverBall() {
    if (this.ball.visible) return; // Don't deliver if ball is already in play
    
    // Reset ball position (right side of screen)
    this.ball.setPosition(this.sys.game.canvas.width * 0.9, this.sys.game.canvas.height * 0.5);
    this.ball.setVisible(true);
    
    // Move ball towards batsman
    this.physics.moveTo(
      this.ball,
      this.sys.game.canvas.width * 0.35, // Target x (batsman position)
      this.sys.game.canvas.height * 0.8, // Target y (batsman position)
      300 // Speed
    );
  }

  hitBall() {
    if (!this.ball.visible || !this.ball.body) return;
    
    // Calculate angle from batsman to ball
    const angle = Phaser.Math.Angle.Between(
      this.batsman.x, this.batsman.y,
      this.ball.x, this.ball.y
    );
    
    // Convert angle to degrees and adjust for bat swing
    const angleDeg = Phaser.Math.RadToDeg(angle) + Phaser.Math.Between(-30, 30);
    
    // Hit the ball based on angle
    const speed = Phaser.Math.Between(300, 500);
    this.physics.velocityFromAngle(angleDeg, speed, this.ball.body.velocity);
    this.ball.setAngularVelocity(Phaser.Math.Between(-200, 200));
    
    // Check if ball hits stumps
    this.time.delayedCall(100, () => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(
        this.ball.getBounds(),
        this.stumps.getBounds()
      )) {
        this.stumps.setAngle(30); // Stumps fall
        this.time.delayedCall(1000, () => {
          this.stumps.setAngle(0); // Reset stumps
        });
      }
    }, null, this);
  }
};

// For browser access
if (typeof window !== 'undefined') {
  window.GameScene = GameScene;
}