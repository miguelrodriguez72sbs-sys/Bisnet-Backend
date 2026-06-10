// GameScene.js — Phaser 3

class GameScene extends Phaser.Scene {

    constructor() { super({ key: 'GameScene' }); }

    initVars() {
        this.sueloY            = 0;
        this.velY              = 0;
        this.impulso           = 900;
        this.gravedad          = 2500;
        this.robotPosX         = 0;
        this.robotPosY         = 0;

        this.velEscenario      = 1280 / 3;
        this.velocidadDelJuego = 1;

        this.varPuntajePalomas   = 0;
        this.varPuntajeDeErrores = 0;
        this.detenido  = false;
        this.pausado   = false;
        this.saltando  = false;

        this.tiempoHastaPaloma    = 2;
        this.tiempoPalomaMin      = 0.3;
        this.tiempoPalomaMax      = 1.8;

        this.tiempoHastaObstaculo = 2;
        this.tiempoObstaculoMin   = 0.7;
        this.tiempoObstaculoMax   = 1.8;

        this.tiempoHastaNube      = 0.5;
        this.tiempoNubeMin        = 0.7;
        this.tiempoNubeMax        = 2.7;

        this.conjuntoDeObstaculos = [];
        this.conjuntoDeNubes      = [];

        this.varEstadoActualBarraDeProgreso = 50;
        this.varDeltaBarraDeEstado          = 10;

        this.palabras = [
            { ingles: "House",  espanol: "Casa"    },
            { ingles: "Dog",    espanol: "Perro"   },
            { ingles: "Cat",    espanol: "Gato"    },
            { ingles: "Book",   espanol: "Libro"   },
            { ingles: "Water",  espanol: "Agua"    },
            { ingles: "School", espanol: "Escuela" },
            { ingles: "Food",   espanol: "Comida"  },
            { ingles: "Car",    espanol: "Carro"   },
            { ingles: "Sun",    espanol: "Sol"     },
            { ingles: "Moon",   espanol: "Luna"    }
        ];
        this.varResultado      = '';
        this.varFormulaEnTexto = '';
    }

    preload() {
        this.load.spritesheet('lechuza', 'img/lechuza.png', {
            frameWidth: 216, frameHeight: 288,
        });
        this.load.image('suelo',  'img/suelo.png');
        this.load.image('fondo',  'img/fondo_nuevo.png');
        this.load.image('pino',   'img/pino.png');
        this.load.image('bonsai', 'img/bonsai.png');
        this.load.image('nube',   'img/nube.png');
        this.load.image('paloma', 'img/paloma.gif');
        this.load.audio('fondo',       'sonido/fondo.mp3');
        this.load.audio('brinca',      'sonido/brinca.mp3');
        this.load.audio('palomaBuena', 'sonido/palomaBuena.mp3');
        this.load.audio('palomaMala',  'sonido/palomaMala.mp3');
        this.load.audio('finDelJuego', 'sonido/finDelJuego.mp3');
    }

    create() {
        this.initVars();

        // ── Fondo ──────────────────────────────────────────────────
        this.fondoBase = this.add.image(0, 0, 'fondo')
            .setOrigin(0, 0).setDepth(0);

        // ── Suelo ──────────────────────────────────────────────────
        this.imgSuelo = this.add.tileSprite(0, 238, 920, 42, 'suelo')
            .setOrigin(0, 0).setDepth(2);

        // ── Animaciones ────────────────────────────────────────────
        if (!this.anims.exists('correr')) {
            this.anims.create({
                key: 'correr',
                frames: this.anims.generateFrameNumbers('lechuza', { frames: [0, 1, 2, 3] }),
                frameRate: 8, repeat: -1
            });
        }
        if (!this.anims.exists('estrellado')) {
            this.anims.create({
                key: 'estrellado',
                frames: this.anims.generateFrameNumbers('lechuza', { frames: [3] }),
                frameRate: 1, repeat: 0
            });
        }

        // ── Robot ──────────────────────────────────────────────────
        this.robot = this.add.sprite(84, 280, 'lechuza')
            .setOrigin(0.5, 1).setDepth(3).setScale(0.5);
        this.robot.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.robot.play('correr');

        // ── UI ─────────────────────────────────────────────────────
        this.add.rectangle(0, 0, 205, 74, 0x000000, 0.4)
            .setOrigin(0, 0).setDepth(8);

        const f = { fontFamily: 'Verdana', fontStyle: 'bold' };

        this.add.rectangle(6, 5, 180, 14, 0x78a8d4)
            .setOrigin(0, 0).setDepth(9);
        this.barraRelleno = this.add.rectangle(6, 5, 90, 14, 0x1b6c0e)
            .setOrigin(0, 0).setDepth(10);
        this.add.text(190, 4, '♥', { ...f, fontSize: '12px', color: '#ff9999' })
            .setDepth(10);

        this.txtAciertos = this.add.text(6, 24,
            'Aciertos: 0', { ...f, fontSize: '14px', color: '#aaddff' })
            .setDepth(9);
        this.txtErrores = this.add.text(6, 46,
            'Desaciertos: 0', { ...f, fontSize: '14px', color: '#ffaaaa' })
            .setDepth(9);

        // ── Palabra ────────────────────────────────────────────────
        this.panelPalabra = this.add.rectangle(460, 0, 200, 36, 0x000000, 0.4)
            .setOrigin(0.5, 0).setDepth(8);
        this.txtPalabra = this.add.text(460, 6, '',
            { ...f, fontSize: '22px', color: '#ffffff' })
            .setOrigin(0.5, 0).setDepth(9);

        // ── Botones pausa y reinicio ───────────────────────────────
        this.btnReinicio = this.add.text(840, 8, '🔄',
            { fontSize: '22px', backgroundColor: '#00000077', padding: { x: 6, y: 4 } })
            .setDepth(15).setInteractive({ useHandCursor: true });
        this.btnReinicio.on('pointerdown', () => this.Reiniciar());
        this.btnReinicio.on('pointerover', () => this.btnReinicio.setAlpha(0.7));
        this.btnReinicio.on('pointerout',  () => this.btnReinicio.setAlpha(1));

        this.btnPausa = this.add.text(880, 8, '⏸',
            { fontSize: '22px', backgroundColor: '#00000077', padding: { x: 6, y: 4 } })
            .setDepth(15).setInteractive({ useHandCursor: true });
        this.btnPausa.on('pointerdown', () => this.TogglePausa());
        this.btnPausa.on('pointerover', () => this.btnPausa.setAlpha(0.7));
        this.btnPausa.on('pointerout',  () => this.btnPausa.setAlpha(1));

        // ── Texto pausa ────────────────────────────────────────────
        this.txtPausa = this.add.text(460, 130, '⏸  PAUSA',
            { ...f, fontSize: '36px', color: '#ffffff',
              backgroundColor: '#00000099', padding: { x: 24, y: 12 } })
            .setOrigin(0.5).setDepth(20).setVisible(false);

        // ── Texto fin del juego ────────────────────────────────────
        this.txtFin = this.add.text(460, 140, 'Finalizó el juego',
            { ...f, fontSize: '30px', color: '#ffffff',
              backgroundColor: '#00000099', padding: { x: 20, y: 10 } })
            .setOrigin(0.5).setDepth(20).setVisible(false);

        // ── Sonidos ────────────────────────────────────────────────
        this.sndFondo  = this.sound.add('fondo',       { loop: true, volume: 0.5 });
        this.sndBrinca = this.sound.add('brinca',      { volume: 0.8 });
        this.sndBuena  = this.sound.add('palomaBuena', { volume: 0.8 });
        this.sndMala   = this.sound.add('palomaMala',  { volume: 0.8 });
        this.sndFin    = this.sound.add('finDelJuego', { volume: 1.0 });
        this.sndFondo.play();

        // ── Input ──────────────────────────────────────────────────
        this.input.keyboard.on('keydown-UP',    () => this.Saltar());
        this.input.keyboard.on('keydown-SPACE', () => this.Saltar());
        this.input.keyboard.on('keydown-P',     () => this.TogglePausa());
        this.input.keyboard.on('keydown-R',     () => this.Reiniciar());

        this.ConstruirPalabra();
        this.actualizarBarra();
    }

    update(time, delta) {
        if (this.detenido || this.pausado) return;
        const dt = delta / 1000;

        this.MoverElRobot(dt);
        this.imgSuelo.tilePositionX += this.velEscenario * dt * this.velocidadDelJuego;

        this.tiempoHastaPaloma    -= dt;
        this.tiempoHastaObstaculo -= dt;
        this.tiempoHastaNube      -= dt;

        if (this.tiempoHastaPaloma    <= 0) this.CrearPaloma();
        if (this.tiempoHastaObstaculo <= 0) this.CrearObstaculo();
        if (this.tiempoHastaNube      <= 0) this.CrearNube();

        this.MoverObjetos(dt);
        this.DetectarColision();

        this.velY -= this.gravedad * dt;
    }

    rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    ConstruirPalabra() {
        const p = this.palabras[this.rnd(0, this.palabras.length - 1)];
        this.varFormulaEnTexto = p.ingles;
        this.varResultado      = p.espanol;
        this.txtPalabra.setText(p.ingles);
        this.panelPalabra.width = this.txtPalabra.width + 30;
    }

    Saltar() {
        if (this.robotPosY === this.sueloY && !this.detenido && !this.pausado) {
            this.saltando = true;
            this.velY     = this.impulso;
            this.sndBrinca.stop();
            this.sndBrinca.play();
        }
    }

    TogglePausa() {
        if (this.detenido) return;
        this.pausado = !this.pausado;
        this.btnPausa.setText(this.pausado ? '▶' : '⏸');
        this.txtPausa.setVisible(this.pausado);
        if (this.pausado) {
            this.sndFondo.pause();
        } else {
            this.sndFondo.resume();
        }
    }

    Reiniciar() {
        this.sndFondo.stop();
        this.scene.restart();
    }

    MoverElRobot(dt) {
        this.robotPosY += this.velY * dt;

        if (this.robotPosY < 0) {
            this.robotPosY = 0;
            this.velY      = 0;
            if (this.saltando) this.robot.play('correr');
            this.saltando  = false;
        }

        this.robot.y = 280 - this.robotPosY;
    }

    CrearNube() {
        const y = this.rnd(15, 110);
        const nube = this.add.image(970, y, 'nube')
            .setOrigin(0, 0).setDepth(0);
        nube.posX = 920;
        this.conjuntoDeNubes.push(nube);
        this.tiempoHastaNube = this.tiempoNubeMin +
            Math.random() * (this.tiempoNubeMax - this.tiempoNubeMin) / this.velocidadDelJuego;
    }

    // ── Obstáculos ───────────────────────────────────────────────
    CrearObstaculo() {
        const esBonsai = Math.random() > 0.5;
        const key      = esBonsai ? 'bonsai' : 'pino';
        const alturaY  = esBonsai ? 242 : 250;

        const obs = this.add.image(970, alturaY, key)
            .setOrigin(0, 1).setDepth(1);

        obs.posX     = 920;
        obs.esPaloma = false;
        obs.width    = obs.displayWidth;
        obs.height   = obs.displayHeight;

        this.conjuntoDeObstaculos.push(obs);

        this.tiempoHastaObstaculo = this.tiempoObstaculoMin +
            Math.random() * (this.tiempoObstaculoMax - this.tiempoObstaculoMin) / this.velocidadDelJuego;
    }

    // ── Palomas ──────────────────────────────────────────────────
    CrearPaloma() {
        let texto;
        if (Math.random() > 0.5) {
            texto = this.varResultado;
        } else {
            let inc = this.palabras[this.rnd(0, this.palabras.length - 1)].espanol;
            while (inc === this.varResultado)
                inc = this.palabras[this.rnd(0, this.palabras.length - 1)].espanol;
            texto = inc;
        }

        const bottomPx = this.rnd(40, 160);
        const pieY     = 238 - bottomPx;

        const img = this.add.image(944, pieY, 'paloma')
            .setOrigin(0.5, 1).setDepth(3);

        const txt = this.add.text(944, pieY - 50, texto, {
            fontFamily: 'Verdana', fontSize: '13px', fontStyle: 'bold',
            color: '#111111', stroke: '#ffffff', strokeThickness: 3
        }).setOrigin(0.5, 1).setDepth(4);

        this.conjuntoDeObstaculos.push({
            posX: 920, esPaloma: true, texto,
            img, txt, pieY,
            actualY: pieY,
            width: 48, height: 48
        });

        this.tiempoHastaPaloma = this.tiempoPalomaMin +
            Math.random() * (this.tiempoPalomaMax - this.tiempoPalomaMin) / this.velocidadDelJuego;
    }

    MoverObjetos(dt) {
        const desp = this.velEscenario * dt * this.velocidadDelJuego;

        for (let i = this.conjuntoDeNubes.length - 1; i >= 0; i--) {
            const n = this.conjuntoDeNubes[i];
            n.posX -= desp * 0.5;
            n.x     = n.posX;
            if (n.posX < -92) { n.destroy(); this.conjuntoDeNubes.splice(i, 1); }
        }

        for (let i = this.conjuntoDeObstaculos.length - 1; i >= 0; i--) {
            const o = this.conjuntoDeObstaculos[i];

            if (o.esPaloma) {
                o.posX -= desp;

                const tiempo = this.time.now * 0.005;
                const desvY  = Math.sin(tiempo + i) * 15;

                o.img.x = o.posX;
                o.img.y = o.pieY + desvY;

                o.txt.x = o.posX;
                o.txt.y = (o.pieY + desvY) - 50;

                o.actualY = o.pieY + desvY;

                if (o.posX < -100) {
                    o.img.destroy(); o.txt.destroy();
                    this.conjuntoDeObstaculos.splice(i, 1);
                }
            } else {
                o.posX -= desp;
                o.x = o.posX;
                if (o.posX < -o.width) {
                    o.destroy();
                    this.conjuntoDeObstaculos.splice(i, 1);
                }
            }
        }
    }

    DetectarColision() {
        const rPie    = this.robot.y;
        const rTop    = rPie  - 84;
        const rLeft   = 42;
        const rRight  = 126;

        for (let i = 0; i < this.conjuntoDeObstaculos.length; i++) {
            const o = this.conjuntoDeObstaculos[i];
            if (o.posX > rRight) break;

            let oL, oT, oR, oB;
            if (o.esPaloma) {
                oL = o.posX;      oR = o.posX + 48;
                oB = o.actualY || o.pieY;
                oT = (o.actualY || o.pieY) - 48;
            } else {
                oL = o.posX;      oR = o.posX + o.width;
                oB = o.y;         oT = o.y - o.height;
            }

            const choca = !(
                (rPie  - 15) < oT  ||
                (rTop  + 10) > oB  ||
                (rRight - 30) < oL ||
                (rLeft  + 20) > oR
            );

            if (choca) {
                if (o.esPaloma) {
                    if (o.texto === this.varResultado) {
                        this.GanarPuntosPalomas(i);
                    } else {
                        this.varPuntajeDeErrores++;
                        this.txtErrores.setText('Desaciertos: ' + this.varPuntajeDeErrores);
                        this.sndMala.stop(); this.sndMala.play();
                        this.varEstadoActualBarraDeProgreso -= this.varDeltaBarraDeEstado;
                        if (this.varEstadoActualBarraDeProgreso <= 0) {
                            this.varEstadoActualBarraDeProgreso = 0;
                            this.FinDelJuego();
                        }
                        this.actualizarBarra();
                        o.img.destroy(); o.txt.destroy();
                        this.conjuntoDeObstaculos.splice(i, 1);
                    }
                } else {
                    this.FinDelJuego();
                }
                break;
            }
        }
    }

    GanarPuntosPalomas(idx) {
        this.varPuntajePalomas++;
        this.txtAciertos.setText('Aciertos: ' + this.varPuntajePalomas);
        this.sndBuena.stop(); this.sndBuena.play();

        const o = this.conjuntoDeObstaculos[idx];
        o.img.destroy(); o.txt.destroy();
        this.conjuntoDeObstaculos.splice(idx, 1);

        if      (this.varPuntajePalomas === 10) { this.velocidadDelJuego = 1.2; }
        else if (this.varPuntajePalomas === 25) { this.velocidadDelJuego = 1.4; }
        else if (this.varPuntajePalomas === 50) { this.velocidadDelJuego = 1.7; }

        this.varEstadoActualBarraDeProgreso = Math.min(100,
            this.varEstadoActualBarraDeProgreso + this.varDeltaBarraDeEstado);
        this.actualizarBarra();
        this.ConstruirPalabra();
    }

    FinDelJuego() {
        this.detenido = true;
        this.robot.play('estrellado');
        this.txtFin.setVisible(true);
        this.sndFondo.stop();
        this.sndFin.stop();
        this.sndFin.play();
    }

    actualizarBarra() {
        const pct = this.varEstadoActualBarraDeProgreso / 100;
        this.barraRelleno.width     = Math.max(0, 180 * pct);
        this.barraRelleno.fillColor = this.varEstadoActualBarraDeProgreso >= 50 ? 0x1b6c0e : 0xdd1900;
    }
}