// GameScene.js — Phaser 3
// Coordenadas calculadas y verificadas:
//   Canvas: 920 x 280
//   Suelo: franja y=238..280 (42px de alto)
//   Robot en reposo: pie en y=216 (22px sobre el suelo), origen(0.5,1)
//   Pino pie: y=222 (16px sobre suelo), origen(0,1)
//   Bonsai pie: y=222, origen(0,1)

class GameScene extends Phaser.Scene {

    constructor() { super({ key: 'GameScene' }); }

    initVars() {
        // Física manual (igual que procesamiento.js original)
        this.sueloY            = 22;      // bottom del robot cuando está en el suelo
        this.velY              = 0;
        this.impulso           = 900;
        this.gravedad          = 2500;
        this.robotPosX         = 42;
        this.robotPosY         = 22;      // empieza en el suelo

        this.velEscenario      = 1280 / 3;
        this.velocidadDelJuego = 1;

        this.varPuntajePalomas   = 0;
        this.varPuntajeDeErrores = 0;
        this.detenido  = false;
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
            frameWidth: 84, frameHeight: 84
        });
        this.load.image('suelo',  'img/suelo.png');
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
        this.fondoBase = this.add.rectangle(0, 0, 920, 280, 0xffe2d1)
            .setOrigin(0, 0).setDepth(0);

        // Gradiente cielo (tiras horizontales con alpha decreciente)
        const g = this.add.graphics().setDepth(0);
        for (let i = 0; i < 238; i++) {
            const a = Math.max(0, (1 - i / 238) * 0.5);
            g.fillStyle(0xb7d6c7, a);
            g.fillRect(0, i, 920, 1);
        }

        // ── Suelo ──────────────────────────────────────────────────
        // y=238, altura=42, origen top-left
        this.imgSuelo = this.add.tileSprite(0, 238, 920, 42, 'suelo')
            .setOrigin(0, 0).setDepth(1);

        // ── Animaciones ────────────────────────────────────────────
        if (!this.anims.exists('correr')) {
            this.anims.create({
                key: 'correr',
                frames: this.anims.generateFrameNumbers('lechuza', { frames: [1, 2] }),
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
        // PIE del robot en reposo: y = 238 - 22 = 216
        // Origen (0.5, 1) → ancla en el centro-abajo del sprite
        // x = 42 (left CSS) + 42 (mitad del ancho 84) = 84
        this.robot = this.add.sprite(84, 216, 'lechuza')
            .setOrigin(0.5, 1).setDepth(3);
        this.robot.play('correr');

        // ── UI ─────────────────────────────────────────────────────
        // Panel fondo izquierdo (solo para los 3 elementos de UI)
        this.add.rectangle(0, 0, 205, 74, 0x000000, 0.4)
            .setOrigin(0, 0).setDepth(8);

        const f = { fontFamily: 'Verdana', fontStyle: 'bold' };

        // Barra de vida: y=5, ancho máx 180px
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

        // Panel y texto de la palabra (esquina superior derecha)
        this.panelPalabra = this.add.rectangle(920, 0, 120, 26, 0x000000, 0.4)
            .setOrigin(1, 0).setDepth(8);
        this.txtPalabra = this.add.text(914, 5, '',
            { ...f, fontSize: '14px', color: '#ffffff' })
            .setOrigin(1, 0).setDepth(9);

        // ── Texto fin del juego ────────────────────────────────────
        this.txtFin = this.add.text(460, 140, 'Finalizó el juego',
            { ...f, fontSize: '30px', color: '#7e928b' })
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

        this.ConstruirPalabra();
        this.actualizarBarra();
    }

    // ═══════════════════════════════════════════════════════════
    //  UPDATE
    // ═══════════════════════════════════════════════════════════
    update(time, delta) {
        if (this.detenido) return;
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

    // ═══════════════════════════════════════════════════════════
    //  LÓGICA
    // ═══════════════════════════════════════════════════════════

    rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    ConstruirPalabra() {
        const p = this.palabras[this.rnd(0, this.palabras.length - 1)];
        this.varFormulaEnTexto = p.ingles;
        this.varResultado      = p.espanol;
        this.txtPalabra.setText(p.ingles);
        this.panelPalabra.width = this.txtPalabra.width + 14;
    }

    Saltar() {
        if (this.robotPosY === this.sueloY && !this.detenido) {
            this.saltando = true;
            this.velY     = this.impulso;
            this.sndBrinca.stop();
            this.sndBrinca.play();
        }
    }

    MoverElRobot(dt) {
        this.robotPosY += this.velY * dt;
        if (this.robotPosY < this.sueloY) {
            this.robotPosY = this.sueloY;
            this.velY      = 0;
            if (this.saltando) this.robot.play('correr');
            this.saltando  = false;
        }
        // robotPosY = cuánto sube el PIE por encima del suelo
        // suelo superior = y=238
        // pie del robot en Phaser = 238 - robotPosY
        this.robot.y = 238 - this.robotPosY;
    }

    // ── Nubes ────────────────────────────────────────────────────
    CrearNube() {
        // Nubes en el cielo: entre y=15 y y=110 (bien arriba)
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
        // Pie del árbol: 16px sobre el suelo → y = 238 - 16 = 222
        // Origen (0,1): el punto de anclaje es la esquina inferior-izquierda
        const obs = this.add.image(970, 222, key)
            .setOrigin(0, 1).setDepth(2);
        obs.posX     = 920;
        obs.esPaloma = false;
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

        // Paloma vuela entre 40 y 160px sobre el suelo
        // Pie de la paloma en Phaser: 238 - bottomPx
        const bottomPx = this.rnd(40, 160);
        const pieY     = 238 - bottomPx;   // ej: bottom=80 → pieY=158

        // imagen origen (0.5, 1): ancla pie-centro
        const img = this.add.image(944, pieY, 'paloma')
            .setOrigin(0.5, 1).setDepth(2);

        // etiqueta encima de la paloma
        const txt = this.add.text(944, pieY - 50, texto, {
            fontFamily: 'Verdana', fontSize: '13px', fontStyle: 'bold',
            color: '#111111', stroke: '#ffffff', strokeThickness: 3
        }).setOrigin(0.5, 1).setDepth(3);

        this.conjuntoDeObstaculos.push({
            posX: 920, esPaloma: true, texto,
            img, txt,
            pieY,           // Y del pie (fija, no cambia)
            width: 48, height: 48
        });

        this.tiempoHastaPaloma = this.tiempoPalomaMin +
            Math.random() * (this.tiempoPalomaMax - this.tiempoPalomaMin) / this.velocidadDelJuego;
    }

    // ── Mover todo ───────────────────────────────────────────────
    MoverObjetos(dt) {
        const desp = this.velEscenario * dt * this.velocidadDelJuego;

        // Nubes (más lentas)
        for (let i = this.conjuntoDeNubes.length - 1; i >= 0; i--) {
            const n = this.conjuntoDeNubes[i];
            n.posX -= desp * 0.5;
            n.x     = n.posX;
            if (n.posX < -92) { n.destroy(); this.conjuntoDeNubes.splice(i, 1); }
        }

        // Obstáculos y palomas
        for (let i = this.conjuntoDeObstaculos.length - 1; i >= 0; i--) {
            const o = this.conjuntoDeObstaculos[i];
            o.posX -= desp;

            if (o.esPaloma) {
                o.img.x = o.posX + 24;
                o.txt.x = o.posX + 24;
                if (o.posX < -60) {
                    o.img.destroy(); o.txt.destroy();
                    this.conjuntoDeObstaculos.splice(i, 1);
                }
            } else {
                o.x = o.posX;
                if (o.posX < -o.width) {
                    o.destroy();
                    this.conjuntoDeObstaculos.splice(i, 1);
                }
            }
        }
    }

    // ── Colisión ─────────────────────────────────────────────────
    DetectarColision() {
        // Robot: origen (0.5,1), pie en this.robot.y
        // left = 84 - 42 = 42,  right = 84 + 42 = 126
        const rPie    = this.robot.y;
        const rTop    = rPie  - 84;
        const rLeft   = 42;
        const rRight  = 126;

        for (let i = 0; i < this.conjuntoDeObstaculos.length; i++) {
            const o = this.conjuntoDeObstaculos[i];
            if (o.posX > rRight) break;

            let oL, oT, oR, oB;
            if (o.esPaloma) {
                // origen (0.5,1): pie en (posX+24, pieY)
                oL = o.posX;      oR = o.posX + 48;
                oB = o.pieY;      oT = o.pieY - 48;
            } else {
                // origen (0,1): pie en (posX, y=222)
                oL = o.posX;      oR = o.posX + o.width;
                oB = o.y;         oT = o.y - o.height;
            }

            // paddingTop:10, paddingRight:30, paddingBottom:15, paddingLeft:20
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

        if      (this.varPuntajePalomas === 10) { this.velocidadDelJuego = 1.2; this.cambiarFondo(0xffdf9e); }
        else if (this.varPuntajePalomas === 25) { this.velocidadDelJuego = 1.4; this.cambiarFondo(0xc86158); }
        else if (this.varPuntajePalomas === 50) { this.velocidadDelJuego = 1.7; this.cambiarFondo(0xaca8c7); }

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

    cambiarFondo(color) {
        this.tweens.addCounter({
            from: 0, to: 1, duration: 1000,
            onUpdate: (tw) => {
                const t   = tw.getValue();
                const cur = Phaser.Display.Color.ValueToColor(this.fondoBase.fillColor);
                const dst = Phaser.Display.Color.ValueToColor(color);
                this.fondoBase.setFillStyle(Phaser.Display.Color.GetColor(
                    Phaser.Math.Linear(cur.red,   dst.red,   t),
                    Phaser.Math.Linear(cur.green, dst.green, t),
                    Phaser.Math.Linear(cur.blue,  dst.blue,  t)
                ));
            }
        });
    }
}
