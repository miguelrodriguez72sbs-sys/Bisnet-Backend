// main.js — Configuración de Phaser 3

const config = {
    type:            Phaser.AUTO,
    width:           920,
    height:          280,
    backgroundColor: '#ffe2d1',
    parent:          document.body,
    physics: {
        default: 'arcade',
        arcade:  { gravity: { y: 0 }, debug: false }  // gravedad manual igual que el original
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);
