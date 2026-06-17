// main.js — Configuración de Phaser 3 (responsivo)

const config = {
    type:            Phaser.AUTO,
    width:           920,
    height:          280,
    backgroundColor: '#ffe2d1',
    parent:          document.body,
    scale: {
        mode:      Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width:     920,
        height:    280,
    },
    physics: {
        default: 'arcade',
        arcade:  { gravity: { y: 0 }, debug: false }
    },
    scene: [GameScene]
};

window.game = new Phaser.Game(config);