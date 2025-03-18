const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};

let player, cursors, lasers, enemies, backgroundMusic;

const game = new Phaser.Game(config);

function preload() {
    // Load images
    this.load.image('player', 'playerShip1_blue.png');
    this.load.image('enemy', 'enemyRed4.png');
    this.load.image('laser', 'laserBlue01.png');
    this.load.image('background', 'background.png');

    // Load explosion frames separately (not a spritesheet)
    this.load.image('explosion1', 'explosion1.png');
    this.load.image('explosion2', 'explosion2.png');
    this.load.image('explosion3', 'explosion3.png');

    // Load sounds with correct names
    this.load.audio('backgroundMusic', 'sfx_explosion1.ogg'); // Change this if you have another bg music file
    this.load.audio('laserSound', 'sfx_laser1.ogg');
    this.load.audio('explosionSound', 'sfx_explosion1.ogg');
}

function create() {
    // Background that covers the whole screen
    let bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.setDisplaySize(800, 600);

    // Player setup
    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true); // Prevent player from going out of screen

    // Keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Groups for lasers and enemies
    lasers = this.physics.add.group();
    enemies = this.physics.add.group();

    // Spawn enemies every second
    this.time.addEvent({ delay: 1000, callback: spawnEnemy, callbackScope: this, loop: true });

    // Explosion animation using separate images
    this.anims.create({
        key: 'explode',
        frames: [
            { key: 'explosion1' },
            { key: 'explosion2' },
            { key: 'explosion3' }
        ],
        frameRate: 10,
        hideOnComplete: true
    });

    // Play background music
    backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
    backgroundMusic.play();
}

function update() {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    // Shooting laser
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
        shootLaser.call(this);
    }
}

function shootLaser() {
    let laser = lasers.create(player.x, player.y - 20, 'laser');
    laser.setVelocityY(-400);

    // Play laser sound
    this.sound.play('laserSound', { volume: 0.5 });
}

function spawnEnemy() {
    let enemy = enemies.create(Phaser.Math.Between(50, 750), 50, 'enemy');
    enemy.setVelocityY(100);

    this.physics.add.overlap(lasers, enemy, destroyEnemy, null, this);
}

function destroyEnemy(laser, enemy) {
    let explosion = this.add.sprite(enemy.x, enemy.y, 'explosion1'); // Start with the first frame
    explosion.play('explode');

    // Play explosion sound
    this.sound.play('explosionSound', { volume: 0.5 });

    laser.destroy();
    enemy.destroy();
}