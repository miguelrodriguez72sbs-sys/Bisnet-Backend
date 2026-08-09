


/* Comentario
   largo
 */


// Comentario corto


//*************** Datos del juego ***************//
// ------ Datos del Piso ------//

var sueloY                = 22;

// -------------------------//
var velY                  = 0;
var impulso               = 900;
var gravedad              = 2500;
// -------------------------//
var robotPosX             = 42;
var robotPosY             = sueloY;
// -------------------------//
var sueloX                = 0;
var velEscenario          = 1280/3;
var velocidadDelJuego     = 1; /* 1  */

var varPuntajePalomas     = 0;

var cuentaPalomas         = 0;

var varValorPalomita      = 0;

var varPuntajeDeErrores   = 0;
// -------------------------//
var detenido              = false;
var pausado               = false;
var saltando              = false;
// -------------------------//

var tiempoHastaPaloma     = 2;
var tiempoPalomaMin       = 0.3;
var tiempoPalomaMax       = 1.8;
var palomaMinY            = 5;
var palomaMaxY            = 320;

// -------------------------//
var tiempoHastaObstaculo  = 2;
var tiempoObstaculoMin    = 0.7;
var tiempoObstaculoMax    = 1.8;
// -------------------------//

var obstaculoPosY         = 16;
var conjuntoDeObstaculos  = [];

// -------------------------//
var tiempoHastaNube       = 0.5;
var tiempoNubeMin         = 0.7;
var tiempoNubeMax         = 2.7;
var maxNubeY              = 270;
var minNubeY              = 100;
var conjuntoDeNubes       = [];
var velNube               = 0.5;
// -------------------------//
var palabras = [
    { ingles: "House", espanol: "Casa" },
    { ingles: "Dog", espanol: "Perro" },
    { ingles: "Cat", espanol: "Gato" },
    { ingles: "Book", espanol: "Libro" },
    { ingles: "Water", espanol: "Agua" },
    { ingles: "School", espanol: "Escuela" },
    { ingles: "Food", espanol: "Comida" },
    { ingles: "Car", espanol: "Carro" },
    { ingles: "Sun", espanol: "Sol" },
    { ingles: "Moon", espanol: "Luna" }
];

var palabraActual = {};

var varEntornoDelJuego;
var varRobot;
var puntajeEnTextoPalomas;

var puntajeDeErroresEnTexto;


var varBarraDeProgreso;

var varEstadoActualBarraDeProgreso  = 50;
var varDeltaBarraDeEstado           = 10;

/* ---------------------------------- */

/*  Si varSigno = 1  realiza la suma              */
/*  Si varSigno = 2  realiza la resta             */
/*  Si varSigno = 3  realiza la multiplicacion    */
/*  Si varSigno = 4  realiza la división          */

var varSigno              = 0;
/* ---------------------------------- */

var varNumero1;
var varNumero2;
var varResultado;

var varFormulaEnTexto;
var varValorEnTextoDeLaPaloma;

var varValorTomadoDeLaPaloma;

/* ---------------------------------- */

var expresionMatematicaEnTexto;
var varSuelo;
var varFinDelJuego;
// -------------------------//

var   audioPalomaBuena;
var   audioPalomaMala;
var   audioBrinca;
var   audioFinDelJuego;
var   audioFondo;

//****** Ciclo del juego ********//

  var time       = new Date();
  var deltaTime  = 0;

  if  (document.readyState === "complete" || document.readyState === "interactive")
  {
      setTimeout(Iniciando, 1);
  }
  else
  {
      document.addEventListener("DOMContentLoaded", Iniciando);
  }

  //****** Escenario responsivo ********//
  // El escenario del juego mide 920x280px de forma fija (así lo espera
  // toda la lógica de arriba, que usa clientWidth para posicionar cosas).
  // Aquí solo lo escalamos visualmente con CSS transform para que quepa
  // en cualquier pantalla, sin cambiar ninguna medida interna del juego.

  var ANCHO_ESCENARIO  = 920;
  var ALTO_ESCENARIO   = 280;

  function AjustarEscalaDelEscenario()
  {
      var wrapper   = document.querySelector(".stageWrapper");
      var escenario = document.querySelector(".entornoDelJuego");

      if (!wrapper || !escenario) return;

      var anchoDisponible  = window.innerWidth  * 0.98;
      var altoDisponible   = window.innerHeight * 0.92;

      var escala = Math.min(1, anchoDisponible / ANCHO_ESCENARIO, altoDisponible / ALTO_ESCENARIO);

      escenario.style.transform = "scale(" + escala + ")";
      wrapper.style.width       = (ANCHO_ESCENARIO * escala) + "px";
      wrapper.style.height      = (ALTO_ESCENARIO  * escala) + "px";
  }

  window.addEventListener("resize", AjustarEscalaDelEscenario);
  window.addEventListener("orientationchange", AjustarEscalaDelEscenario);

  //****** Controles táctiles ********//
  // Un toque en cualquier parte del escenario hace saltar al personaje,
  // igual que la flecha ↑ en escritorio.

  function ManejarToqueParaSaltar(ev)
  {
      // No interceptamos toques sobre los botones de pausa/reiniciar
      if (ev.target.closest("#btnPausa, #btnReiniciar")) return;

      ev.preventDefault();
      Saltar();
  }

  function Iniciando()
  {
      time = new Date();
      AjustarEscalaDelEscenario();
      Comenzando();
      CicloDelJuego();

      var wrapper = document.querySelector(".stageWrapper");
      if (wrapper)
      {
          wrapper.addEventListener("touchstart", ManejarToqueParaSaltar, { passive: false });
      }
  }

  function CicloDelJuego()
  {
      deltaTime = (new Date() - time) / 1000;
      time      = new Date();
      Actualizando();
      requestAnimationFrame(CicloDelJuego);
  }

  function GenerarNumeroAleatorioConRango(numInferior, numSuperior)
  {
    var        numPosibilidades          =    numSuperior - numInferior;
    var        numAleatorio              =    Math.random() * (numPosibilidades + 1);

        numAleatorio                     =    Math.floor(numAleatorio);
        return numInferior + numAleatorio;
  }

 function ConstruirPalabra()
{
    var indice = GenerarNumeroAleatorioConRango(0, palabras.length - 1);

    palabraActual = palabras[indice];

    varFormulaEnTexto = palabraActual.ingles;
    varResultado = palabraActual.espanol;
}

  function Comenzando()
  {
        varFinDelJuego               = document.querySelector(".finDelJuego");
        varSuelo                     = document.querySelector(".suelo");
        varEntornoDelJuego           = document.querySelector(".entornoDelJuego");
        puntajeEnTextoPalomas        = document.querySelector(".puntajePalomas");

        puntajeDeErroresEnTexto      = document.querySelector(".puntajeDeErrores");

       expresionMatematicaEnTexto = document.querySelector(".palabraIngles");

        varBarraDeProgreso           = document.querySelector(".barraDeEstado");

        varRobot                     = document.querySelector(".robotito");
    
        // Botones de pausa y reinicio :) 
        const btnPausa = document.getElementById("btnPausa");
        const btnReiniciar = document.getElementById("btnReiniciar");
        btnReiniciar.addEventListener("click", function(){
    location.reload();
        });

     btnPausa.addEventListener("click", function(){
    pausado = !pausado;
    if(pausado){
        btnPausa.innerHTML = "▶";
        audioFondo.pause();

    }else{
        btnPausa.innerHTML = "⏸";
        // Reiniciamos el reloj del juego
        time = new Date();
        audioFondo.play();
    }

});



        ConstruirPalabra();

        expresionMatematicaEnTexto.innerText = varFormulaEnTexto;

        varBarraDeProgreso.value     = varEstadoActualBarraDeProgreso;

        audioBrinca        = document.querySelector(".audio-brinca");
        audioPalomaBuena   = document.querySelector(".audio-palomaBuena");
        audioPalomaMala    = document.querySelector(".audio-palomaMala");

        audioFinDelJuego   = document.querySelector(".audio-finDelJuego");

        audioFondo         = document.querySelector(".audio-fondo");
        audioFondo.currentTime = 0;
        audioFondo.play();

        document.addEventListener("keydown", OprimeTeclaArriba);
  }

 function Actualizando()
{

    if(detenido || pausado)
        return;

    MoverElRobot();

    MoverElSuelo();

    DecidirCrearPalomas();
    DecidirCrearObstaculos();
    DecidirCrearNubes();

    MoverLosObstaculos();
    MoverNubes();

    DetectarColision();

    velY -= gravedad * deltaTime;

}
 
  //-------------- Código de teclas--------------------//
  //----- Barra espaciadora   32 ----------------------//
  //----- Flecha Izquierda    37 ----------------------//
  //----- Flecha Arriba       38 ----------------------//
  //----- Flecha Derecha      39 ----------------------//
  //----- Flecha Abajo        40 ----------------------//

function OprimeTeclaArriba(ev)
{

    if(pausado)
        return;

    if(ev.keyCode == 38)
    {
        Saltar();
    }

}
  function Saltar()
  {
      if(robotPosY === sueloY)
      {
          saltando = true;
          velY     = impulso;
          varRobot.classList.remove("robotito-corriendo");

          audioBrinca.currentTime = 0;
          audioBrinca.play();
      }
  }

  function MoverElRobot()
  {
    robotPosY += velY * deltaTime;
    if(robotPosY < sueloY)
    {
        TocarSuelo();
    }
    varRobot.style.bottom = robotPosY+"px";
  }

  function TocarSuelo()
  {
      robotPosY  = sueloY;
      velY       = 0;

      if(saltando)
      {
        varRobot.classList.add("robotito-corriendo");
      }
      saltando = false;
  }

  function MoverElSuelo()
  {
      sueloX               +=   CalcularDesplazamiento();
      varSuelo.style.left  =    -(sueloX % varEntornoDelJuego.clientWidth)   + "px";
  }

  function CalcularDesplazamiento()
  {
      return velEscenario * deltaTime * velocidadDelJuego;
  }

  function Estrellarse()
  {
      varRobot.classList.remove("robotito-corriendo");
      varRobot.classList.add("robotito-estrellado");
      detenido = true;
  }

  function DecidirCrearNubes()
  {
      tiempoHastaNube -= deltaTime;
      if (tiempoHastaNube <= 0)
      {
        CrearNube();
      }
  }

  function DecidirCrearObstaculos()
  {
      tiempoHastaObstaculo -= deltaTime;
      if (tiempoHastaObstaculo <= 0)
      {
        CrearObstaculo();
      }
  }
  // +++++++++++++++++++++++++//
  function DecidirCrearPalomas()
  {
      tiempoHastaPaloma -= deltaTime;
      if(tiempoHastaPaloma <= 0)
      {
        CrearPaloma();
      }
  }

  function CrearNube()
  {
      var nube          = document.createElement("div");
      varEntornoDelJuego.appendChild(nube);
      nube.classList.add("nube");
      nube.posX         = varEntornoDelJuego.clientWidth;
      nube.style.left   = varEntornoDelJuego.clientWidth+"px";
      nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";

      conjuntoDeNubes.push(nube);
      tiempoHastaNube   = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / velocidadDelJuego;
  }

  // +++++++++++++++++++++++++/////////////////////////////////
 function CrearPaloma()
{
    var varPaloma = document.createElement("div");

    // 50% probabilidad de respuesta correcta
    if (Math.random() > 0.5)
    {
        varPaloma.innerText = varResultado;
    }
    else
    {
        // Elegimos una traducción incorrecta aleatoria
        var palabraIncorrecta =
            palabras[GenerarNumeroAleatorioConRango(0, palabras.length - 1)].espanol;

        // Evitamos repetir la correcta
        while (palabraIncorrecta == varResultado)
        {
            palabraIncorrecta =
                palabras[GenerarNumeroAleatorioConRango(0, palabras.length - 1)].espanol;
        }

        varPaloma.innerText = palabraIncorrecta;
    }

    varEntornoDelJuego.appendChild(varPaloma);

    varPaloma.classList.add("paloma");

    varPaloma.posX = varEntornoDelJuego.clientWidth;

    varPaloma.style.left =
        varEntornoDelJuego.clientWidth + "px";

    varPaloma.style.bottom =
        palomaMinY +
        Math.random() * (palomaMaxY - palomaMinY) + "px";

    conjuntoDeObstaculos.push(varPaloma);

    tiempoHastaPaloma =
        tiempoPalomaMin +
        Math.random() *
        (tiempoPalomaMax - tiempoPalomaMin) /
        velocidadDelJuego;
}

  // +++++++++++++++++++++++++//

  function CrearObstaculo()
  {
      var obstaculo        = document.createElement("div");
      varEntornoDelJuego.appendChild(obstaculo);

      obstaculo.classList.add("pino");

      if (Math.random() > 0.5)
            obstaculo.classList.add("bonsai");

      obstaculo.posX       = varEntornoDelJuego.clientWidth;
      obstaculo.style.left = varEntornoDelJuego.clientWidth+"px";

      conjuntoDeObstaculos.push(obstaculo);

      tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / velocidadDelJuego;
  }

  function MoverLosObstaculos()
  {
      for (var i = conjuntoDeObstaculos.length - 1; i >= 0; i--)
      {
          if(conjuntoDeObstaculos[i].posX < - conjuntoDeObstaculos[i].clientWidth)
          {
              conjuntoDeObstaculos[i].parentNode.removeChild(conjuntoDeObstaculos[i]);
              conjuntoDeObstaculos.splice(i, 1);
              /*  GanarPuntosSaltos(); */    /* Cuando salta gana muntos*/
          }
          else
          {
              conjuntoDeObstaculos[i].posX        -=   CalcularDesplazamiento();
              conjuntoDeObstaculos[i].style.left   =   conjuntoDeObstaculos[i].posX+"px";
          }
      }
  }

  function MoverNubes()
  {
      for (var i = conjuntoDeNubes.length - 1; i >= 0; i--)
      {
          if(conjuntoDeNubes[i].posX < -conjuntoDeNubes[i].clientWidth)
          {
              conjuntoDeNubes[i].parentNode.removeChild(conjuntoDeNubes[i]);
              conjuntoDeNubes.splice(i, 1);
          }
          else
          {
              conjuntoDeNubes[i].posX -= CalcularDesplazamiento() * velNube;
              conjuntoDeNubes[i].style.left = conjuntoDeNubes[i].posX+"px";
          }
      }
  }

  function GanarPuntosPalomas()
  {
      varPuntajePalomas++;

      puntajeEnTextoPalomas.innerText = "Aciertos:"+ varPuntajePalomas.toString();

      /*  Mandamos un sonido de correcto     */

      audioPalomaBuena.currentTime = 0;
      audioPalomaBuena.play();


      if(varPuntajePalomas == 10)
      {
          velocidadDelJuego = 1.2;   /*   1.2     */
          varEntornoDelJuego.classList.add("mediodia");
      }
      else
          if(varPuntajePalomas == 25)
          {
              velocidadDelJuego = 1.4;   /* 1.4   */
              varEntornoDelJuego.classList.add("tarde");
          }
          else if(varPuntajePalomas == 50)
          {
              velocidadDelJuego = 1.7;   /*  1.7  */
              varEntornoDelJuego.classList.add("noche");
          }
      varSuelo.style.animationDuration = (3/velocidadDelJuego)+"s";
  }

  function FinDelJuego()
  {
        Estrellarse();
        varSuelo.style.animationPlayState  = "paused";
        varFinDelJuego.style.display       = "block";

        audioFinDelJuego.currentTime = 0;
        audioFinDelJuego.play();

        audioFondo.currentTime = 0;
        audioFondo.pause();

  }

  function DetectarColision()
  {
      for (let i = 0; i < conjuntoDeObstaculos.length; i++)
      {
          if(conjuntoDeObstaculos[i].posX > robotPosX + varRobot.clientWidth)
          {
              //EVADE
              break; //al estar en orden, no puede chocar con más
          }
          else
          {
              if(HayColision(varRobot, conjuntoDeObstaculos[i], 10, 30, 15, 20))
              {
                  if(conjuntoDeObstaculos[i].classList.contains("paloma"))
                  {
                    /* obtengo el valor de la paloma en texto */
                      varValorEnTextoDeLaPaloma = conjuntoDeObstaculos[i].innerText;

                      /* Realizo la transformacion numerica del texto  de numeros */
                      

                      /* Si el valor de la paloma es el resultado*/
                      if (varValorEnTextoDeLaPaloma == varResultado)
                      {
                          /* Gana puntos   */
                          GanarPuntosPalomas();

                          /* Se construye una nueva expresion matematica*/
                          ConstruirPalabra();

                          expresionMatematicaEnTexto.innerText = varFormulaEnTexto;

                        /*  Se actualiza la barra de progreso                         */

                          varEstadoActualBarraDeProgreso =  varEstadoActualBarraDeProgreso + varDeltaBarraDeEstado;

                          if (varEstadoActualBarraDeProgreso >= 100)
                          {
                                varEstadoActualBarraDeProgreso =100;
                          }


                      }
                      else   /*   En caso de que no sea el valor, se van acumulando puntos  malos     */
                      {
                          varPuntajeDeErrores++;
                          puntajeDeErroresEnTexto.innerText = "Desaciertos:"+ varPuntajeDeErrores.toString();

                          /*  Mandamos un sonido de incorrecto     */

                          audioPalomaMala.currentTime = 0;
                          audioPalomaMala.play();

                          /* ----------- */

                          /*  Se actualiza la barra de progreso                         */
                          varEstadoActualBarraDeProgreso =  varEstadoActualBarraDeProgreso - varDeltaBarraDeEstado;
                          if (varEstadoActualBarraDeProgreso <= 0)
                          {
                                varEstadoActualBarraDeProgreso =0;
                                FinDelJuego();
                          }

                      }

                      /* Actualizamos la barra de estado */

                         varBarraDeProgreso.value = varEstadoActualBarraDeProgreso;

                    /* ----------------------------------------------------- */
                    conjuntoDeObstaculos[i].parentNode.removeChild(conjuntoDeObstaculos[i]);
                    conjuntoDeObstaculos.splice(i, 1);

                  }
                  else
                  {
                      FinDelJuego();
                  }
              }
          }
      }
  }

  function HayColision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft)
  {
      var aRect = a.getBoundingClientRect();
      var bRect = b.getBoundingClientRect();

      return !(
      ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
      (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
      ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
      (aRect.left + paddingLeft > (bRect.left + bRect.width))
      );
  }
