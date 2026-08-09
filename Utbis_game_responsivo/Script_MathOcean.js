
const eventWindowLoaded = () => {
		
	
	
    canvasApp();
}

window.addEventListener('load', eventWindowLoaded, false);

const canvasApp = () => {

		
		let 	varFondoEspacio                =	 document.querySelector('body');	
				
		let 	varNave		                   =	 document.getElementById('idNave');		
		let 	varTextoDeVidas   			   =	 document.getElementById('idContarVidas');
		let     varPuntajeEnLetreroDeAciertos  =     document.getElementById("idContarAciertos");
		let     varPuntajeEnLetreroDeErrores   =     document.getElementById("idContarErrores");		
		let 	varCronometro	  			   =	 document.getElementById('idCronometro');
		let     varExpresionMatematicaEnTexto  =     document.getElementById("idExpresionMatematica");	
		let     varBarraDeProgreso             =     document.getElementById("idBarraDeEstado");
		let     varNumeroNivel                 =     document.getElementById("idNumeroNivel");			
		
		let 	varSonidoLaser		  		   =	 document.getElementById('idSonidoLaser');
		let 	varSonidoExplosion	  		   =	 document.getElementById('idSonidoExplosion');	
		let     varSonidoAsteriodeCorrecto     =     document.getElementById("idSonidoAsteriodeCorrecto");
		let     varSonidoAsteriodeIncorrecto   =     document.getElementById("idSonidoAsteriodeIncorrecto");
		let     varSonidoDeFondo         	   =     document.getElementById("idSonidoDeFondo");	
		let     varSonidoFinDelJuego  		   =     document.getElementById("idSonidoDeFinDelJuego");
		let     varSonidoCambioDeNivel 		   =     document.getElementById("idSonidoCambioDeNivel");
		let juegoFinalizado = false;
		
		
		/* Se define el tiempo en segundos*/
		
		const   cantidadEnSegundos             =      60;
		
		/* Se define el numero de aciertos permitidos */
		
		const   cantidadDeAciertos			   =      5;

		
		let     varPuntajeDeAciertos   		   =      0;
		let     varPuntajeDeErrores    		   =      0;
		
		let 	varEstadoActualBarraDeProgreso =      0;
		let 	varDeltaBarraDeEstado          =      100/cantidadDeAciertos;
		
		let 	varVidas		               =      20;
		let 	tiempoSegundos	  	           =      cantidadEnSegundos;
		let     aparecer          	           =      0;
		
		let     varValorAsteroide 	           =      0;
		let     etapaDelJuego     	           =      1;
	
	    /* ----- variables para guardar puntajes de cada etapa superada del intento actual ---- */
	
	    let     etapa1IntentoActual                     =      0;  
	    let     etapa1IntentoActualPuntajeDeAciertos    =      0;
	    let     etapa1IntentoActualPuntajeDeErrores     =      0;
	    var     etapa1IntentoActualTiempoSegundos       =      0;
	
		let     etapa2IntentoActual                     =      0;	
	    let     etapa2IntentoActualPuntajeDeAciertos    =      0;
	    let     etapa2IntentoActualPuntajeDeErrores     =      0;
	    let     etapa2IntentoActualTiempoSegundos       =      0;	
	    /* ---------------------------------------------- */
	    /* ----- variables para guardar puntajes de cada etapa del intento anterior ---- */
		
	    let     etapa1IntentoAnterior                   =      0;  
	    let     etapa1IntentoAnteriorlPuntajeDeAciertos =      0;
	    let     etapa1IntentoAnteriorPuntajeDeErrores   =      0;
	    let     etapa1IntentoAnteriorTiempoSegundos     =      0;
	
		let     etapa2IntentoAnterior                   =      0;	
	    let     etapa2IntentoAnteriorPuntajeDeAciertos  =      0;
	    let     etapa2IntentoAnteriorPuntajeDeErrores   =      0;
	    let     etapa2IntentoAnteriorTiempoSegundos     =      0;	
		/* ---------------------------------------------- */
	    var     puntajeTotalIntentoActualAciertos       =      0;
	    var     puntajeTotalIntentoAnteriorAciertos     =      0;
	    var     cadenaInforme                           =      "";

		/*  Si varSigno = 1  realiza la suma              */
		/*  Si varSigno = 2  realiza la resta             */
		/*  Si varSigno = 3  realiza la multiplicacion    */
		/*  Si varSigno = 4  realiza la división          */

		let 	varSigno1         		       =      0;
		let 	varSigno2            		   =      0;
		
		/* ---------------------------------- */

		let 	varNumero1;
		let 	varNumero2;
		let 	varNumero3;
		let 	varResultado;
		let     varResParcial; 
		   
		let 	varFormulaEnTexto;
		let 	varFormulaParcialEnTexto;
		let     varFormulaParcialAux; 
		let     varValorEnTextoDelAsteroide;
		let     varValorTomadoDelAsteroide;
		
		function GanarPuntosEnAsteroides()
		{
			  varPuntajeDeAciertos++;
			  
			  varPuntajeEnLetreroDeAciertos.textContent  = varPuntajeDeAciertos;

			  /*  Mandamos un sonido de correcto     */

			  varSonidoAsteriodeCorrecto.currentTime = 0;
			  varSonidoAsteriodeCorrecto.play();
			   
		}
		
		function GenerarNumeroAleatorioConRango(numInferior, numSuperior)
		{
			var        numPosibilidades          =    numSuperior - numInferior;
			var        numAleatorio              =    Math.random() * (numPosibilidades + 1);

			numAleatorio                         =    Math.floor(numAleatorio);
			return numInferior + numAleatorio;
		}
		
		function ConstruyeExpresionMatematicaFase1()
{
         varSigno1   = 1;
         
         // 1. Decidir los tipos de bloques aleatoriamente
         // tipoBloque: 1 = Potencia al cuadrado, 2 = Raíz cuadrada
         let tipoBloque1 = GenerarNumeroAleatorioConRango(1, 2);
         let tipoBloque2 = GenerarNumeroAleatorioConRango(1, 2);

         let base1, base2;
         let termino1Texto, termino2Texto;
         let valorTermino1, valorTermino2;

         // --- PROCESAR BLOQUE 1 ---
         if (tipoBloque1 === 1) {
             // Es una potencia (ej. 4^2 = 16)
             base1 = GenerarNumeroAleatorioConRango(2, 9);
             valorTermino1 = Math.pow(base1, 2);
             termino1Texto = base1.toString() + "<sup>2</sup>";
         } else {
             // Es una raíz cuadrada exacta (ej. √16 = 4)
             let raiz1 = GenerarNumeroAleatorioConRango(2, 9);
             base1 = Math.pow(raiz1, 2); // Creamos un cuadrado perfecto (4, 9, 16, 25...)
             valorTermino1 = raiz1;
             termino1Texto = "&radic;" + base1.toString();
         }

         // --- PROCESAR BLOQUE 2 ---
         if (tipoBloque2 === 1) {
             // Es una potencia
             base2 = GenerarNumeroAleatorioConRango(2, 9);
             valorTermino2 = Math.pow(base2, 2);
             termino2Texto = base2.toString() + "<sup>2</sup>";
         } else {
             // Es una raíz cuadrada
             let raiz2 = GenerarNumeroAleatorioConRango(2, 9);
             base2 = Math.pow(raiz2, 2);
             valorTermino2 = raiz2;
             termino2Texto = "&radic;" + base2.toString();
         }

         // 2. Decidir la operación principal (1=Suma, 2=Resta, 3=Multiplicación)
         varSigno1 = GenerarNumeroAleatorioConRango(1, 3);

        switch(varSigno1)
        {
            case 1: // Suma
                    varResultado = valorTermino1 + valorTermino2;
                    varFormulaEnTexto = termino1Texto + " + " + termino2Texto;
                    break;

            case 2: // Resta
                    varResultado = valorTermino1 - valorTermino2;
                    varFormulaEnTexto = termino1Texto + " - " + termino2Texto;
                    break;

            case 3: // Multiplicación
                    varResultado = valorTermino1 * valorTermino2;
                    varFormulaEnTexto = termino1Texto + " * " + termino2Texto;
                    break;

            default:
                    varResultado = valorTermino1 + valorTermino2;
                    varFormulaEnTexto = termino1Texto + " + " + termino2Texto;
                    break;
        }
}

function ConstruyeExpresionMatematicaFase2()
{
         varSigno1     = 1;
         varSigno2     = 1;
         varResParcial = 0;
         varResultado  = 0;
    
         // En la Fase 2 combinamos 3 bloques usando la misma lógica universitaria
         let tipoBloque1 = GenerarNumeroAleatorioConRango(1, 2);
         let tipoBloque2 = GenerarNumeroAleatorioConRango(1, 2);
         let tipoBloque3 = GenerarNumeroAleatorioConRango(1, 2);

         let base1, base2, base3;
         let t1Texto, t2Texto, t3Texto;
         let v1, v2, v3;

         // Bloque 1
         if (tipoBloque1 === 1) {
             base1 = GenerarNumeroAleatorioConRango(2, 7);
             v1 = Math.pow(base1, 2);
             t1Texto = base1.toString() + "<sup>2</sup>";
         } else {
             let r1 = GenerarNumeroAleatorioConRango(2, 7);
             base1 = Math.pow(r1, 2);
             v1 = r1;
             t1Texto = "&radic;" + base1.toString();
         }

         // Bloque 2
         if (tipoBloque2 === 1) {
             base2 = GenerarNumeroAleatorioConRango(2, 7);
             v2 = Math.pow(base2, 2);
             t2Texto = base2.toString() + "<sup>2</sup>";
         } else {
             let r2 = GenerarNumeroAleatorioConRango(2, 7);
             base2 = Math.pow(r2, 2);
             v2 = r2;
             t2Texto = "&radic;" + base2.toString();
         }

         // Bloque 3
         if (tipoBloque3 === 1) {
             base3 = GenerarNumeroAleatorioConRango(2, 7);
             v3 = Math.pow(base3, 2);
             t3Texto = base3.toString() + "<sup>2</sup>";
         } else {
             let r3 = GenerarNumeroAleatorioConRango(2, 7);
             base3 = Math.pow(r3, 2);
             v3 = r3;
             t3Texto = "&radic;" + base3.toString();
         }

         varSigno1 = GenerarNumeroAleatorioConRango(1, 3);
         varSigno2 = GenerarNumeroAleatorioConRango(1, 3);
        
        // Operación parcial entre bloque 1 y bloque 2
        switch(varSigno1)
        {
            case 1: 
                    varResParcial = v1 + v2;
                    varFormulaParcialEnTexto = t1Texto + " + " + t2Texto;
                    break;
            case 2: 
                    varResParcial = v1 - v2;
                    varFormulaParcialEnTexto = t1Texto + " - " + t2Texto;
                    break;
            case 3: 
                    varResParcial = v1 * v2;
                    varFormulaParcialEnTexto = t1Texto + " * " + t2Texto;
                    break;
        }
        
        varFormulaParcialEnTexto = "(" + varFormulaParcialEnTexto + ")";

        // Operación final con el bloque 3
        switch(varSigno2)
        {
            case 1: 
                    varResultado = varResParcial + v3;
                    varFormulaEnTexto = varFormulaParcialEnTexto + " + " + t3Texto;
                    break;
            case 2: 
                    varResultado = varResParcial - v3;
                    varFormulaEnTexto = varFormulaParcialEnTexto + " - " + t3Texto;
                    break;
            case 3: 
                    varResultado = varResParcial * v3;
                    varFormulaEnTexto = varFormulaParcialEnTexto + " * " + t3Texto;
                    break;
        }
}

	    function crearInforme()
	    {
				// Recuperamos los registros del intento anterior
					
					puntajeTotalIntentoAnteriorAciertos     = localStorage.getItem("PuntajeGeneralDeAciertos");
					etapa1IntentoAnterior                   = localStorage.getItem("Etapa1");				
					
					etapa1IntentoAnteriorlPuntajeDeAciertos = localStorage.getItem("Etapa1PuntajeDeAciertos");
					etapa1IntentoAnteriorPuntajeDeErrores   = localStorage.getItem("Etapa1PuntajeDeErrores");
					etapa1IntentoAnteriorTiempoSegundos     = localStorage.getItem("Etapa1TiempoSegundos");
					
					etapa2IntentoAnterior                   = localStorage.getItem("Etapa2");
					etapa2IntentoAnteriorPuntajeDeAciertos  = localStorage.getItem("Etapa2PuntajeDeAciertos");
					etapa2IntentoAnteriorPuntajeDeErrores   = localStorage.getItem("Etapa2PuntajeDeErrores");
					etapa2IntentoAnteriorTiempoSegundos     = localStorage.getItem("Etapa2TiempoSegundos");	
					
			        if (puntajeTotalIntentoAnteriorAciertos == null)
					{
						puntajeTotalIntentoAnteriorAciertos = 0;
					}
			
					if (etapa1IntentoAnterior == null)
					{
						etapa1IntentoAnterior = 1;
					}
					if (etapa1IntentoAnteriorlPuntajeDeAciertos == null)
					{
						etapa1IntentoAnteriorlPuntajeDeAciertos = 0;
					}
					if ( etapa1IntentoAnteriorPuntajeDeErrores == null)
					{
						etapa1IntentoAnteriorPuntajeDeErrores = 0;
					}
					if ( etapa1IntentoAnteriorTiempoSegundos == null)
					{
						etapa1IntentoAnteriorTiempoSegundos = 0;
					}
					if ( etapa2IntentoAnterior == null)
					{
						etapa2IntentoAnterior = 0;
					}
					if ( etapa2IntentoAnteriorPuntajeDeAciertos == null)
					{
						etapa2IntentoAnteriorPuntajeDeAciertos = 0;
					}
					if ( etapa2IntentoAnteriorPuntajeDeErrores == null)
					{
						etapa2IntentoAnteriorPuntajeDeErrores = 0;
					}
					if ( etapa2IntentoAnteriorTiempoSegundos == null)
					{
						etapa2IntentoAnteriorTiempoSegundos = 0;
					}	
					
					// ********************************************************************************************
					// Guardamos los resultados de la etapa que se dejo
					switch (etapaDelJuego)
					{
						case 1: 
								etapa1IntentoActual                  =      etapaDelJuego;
								etapa1IntentoActualPuntajeDeAciertos =      varPuntajeDeAciertos;
								etapa1IntentoActualPuntajeDeErrores  =      varPuntajeDeErrores;
								etapa1IntentoActualTiempoSegundos    =      tiempoSegundos;																			   
																			   	  
								break;
						case 2: 
								etapa2IntentoActual                  =      etapaDelJuego;
								etapa2IntentoActualPuntajeDeAciertos =      varPuntajeDeAciertos;
								etapa2IntentoActualPuntajeDeErrores  =      varPuntajeDeErrores;
								etapa2IntentoActualTiempoSegundos    =      tiempoSegundos;	
								
								break;
					}					
					
					// ********************************************************************************************
					// Construimos el informe
					
					
					puntajeTotalIntentoActualAciertos    =  etapa1IntentoActualPuntajeDeAciertos     +  etapa2IntentoActualPuntajeDeAciertos;					
					
					cadenaInforme = "-----------------Informe del calculo mental ---------------- \n";
					
					if (puntajeTotalIntentoActualAciertos > puntajeTotalIntentoAnteriorAciertos )
					{					    
						// Guardo los datos actuales como el mejor puntaje hasta este momento
						
						localStorage.setItem("PuntajeGeneralDeAciertos", puntajeTotalIntentoActualAciertos);
						localStorage.setItem("Etapa1", 1);
						
						localStorage.setItem("Etapa1PuntajeDeAciertos", etapa1IntentoActualPuntajeDeAciertos);
						localStorage.setItem("Etapa1PuntajeDeErrores",  etapa1IntentoActualPuntajeDeErrores);
						localStorage.setItem("Etapa1TiempoSegundos",    etapa1IntentoActualTiempoSegundos);
						
						localStorage.setItem("Etapa2", 2);
						localStorage.setItem("Etapa2PuntajeDeAciertos", etapa2IntentoActualPuntajeDeAciertos);
						localStorage.setItem("Etapa2PuntajeDeErrores",  etapa2IntentoActualPuntajeDeErrores);
						localStorage.setItem("Etapa2TiempoSegundos",    etapa2IntentoActualTiempoSegundos);	
					}	
					
						
			
					cadenaInforme = cadenaInforme  + "            Puntaje general de aciertos\n";	
					cadenaInforme = cadenaInforme  + "          Intento Actual ---- Intento Anterior  \n";
					cadenaInforme = cadenaInforme  + "                                ";
					
			        cadenaInforme = cadenaInforme  + puntajeTotalIntentoActualAciertos.toString() + "  |  " + puntajeTotalIntentoAnteriorAciertos.toString()+"\n";
			
					cadenaInforme = cadenaInforme + "---------------------------------------------------------------- \n";
					// ********************************************************************************************************************************
					
				    cadenaInforme = cadenaInforme  + "                             Etapa 1 \n";		
					cadenaInforme = cadenaInforme  + "                  Numero de Aciertos \n";	
					cadenaInforme = cadenaInforme  + "          Intento Actual ---- Intento Anterior  \n";
					cadenaInforme = cadenaInforme  + "                                ";					
			
					cadenaInforme = cadenaInforme + etapa1IntentoActualPuntajeDeAciertos.toString() + "  |  " + etapa1IntentoAnteriorlPuntajeDeAciertos.toString()+"\n";
					
					cadenaInforme = cadenaInforme + "*********************************************** \n";
					cadenaInforme = cadenaInforme + "             Numero de Equivocaciones \n";		
					cadenaInforme = cadenaInforme + "          Intento Actual ---- Intento Anterior  \n";
					cadenaInforme = cadenaInforme + "                                ";	
			
			        cadenaInforme = cadenaInforme + etapa1IntentoActualPuntajeDeErrores.toString() + "  |  " + etapa1IntentoAnteriorPuntajeDeErrores.toString() + "\n";	
					
					cadenaInforme = cadenaInforme + "---------------------------------------------------------------- \n";
					cadenaInforme = cadenaInforme + "                              Etapa 2 \n";
					cadenaInforme = cadenaInforme + "                  Numero de Aciertos \n";
					
					cadenaInforme = cadenaInforme + "          Intento Actual ---- Intento Anterior  \n";
					cadenaInforme = cadenaInforme + "                                ";
					
					cadenaInforme = cadenaInforme + etapa2IntentoActualPuntajeDeAciertos.toString() +  "  |  " +  etapa2IntentoAnteriorPuntajeDeAciertos.toString() +  "\n";
			
					
					cadenaInforme = cadenaInforme + "*********************************************** \n";
					cadenaInforme = cadenaInforme + "             Numero de Equivocaciones \n";		
					cadenaInforme = cadenaInforme + "          Intento Actual ---- Intento Anterior  \n";
					cadenaInforme = cadenaInforme + "                                ";				
					
					cadenaInforme = cadenaInforme + etapa2IntentoActualPuntajeDeErrores.toString() + "  |  " + etapa2IntentoAnteriorPuntajeDeErrores.toString() + "\n";	
					
			
					alert(cadenaInforme);
						
		}
	
		const sensarTiempo = () => {
				tiempoSegundos--;
				varCronometro.textContent	=	tiempoSegundos;				
				
				// Si se termina el tiempo del jugador
				
				if (tiempoSegundos	==	0)
				{					
					varSonidoFinDelJuego.currentTime = 0;
					varSonidoFinDelJuego.play();
					varSonidoDeFondo.currentTime     = 0;
					varSonidoDeFondo.pause();
					
					alert('Se termino el tiempo, no superaste todos los niveles');
					
					//  Vamos a empezar a mostrar el registro del intento actual y el registro del intento anterior
					
					puntajeTotalIntentoAnteriorAciertos     = localStorage.getItem("PuntajeGeneralDeAciertos");
					
					// Si fue el primer intento
					if (puntajeTotalIntentoAnteriorAciertos == null)
					{
						alert("Este fue el primer intento");
						
						localStorage.setItem("PuntajeGeneralDeAciertos", 0);
						localStorage.setItem("Etapa1", 1);
						
						localStorage.setItem("Etapa1PuntajeDeAciertos", 0);
						localStorage.setItem("Etapa1PuntajeDeErrores",  0);
						localStorage.setItem("Etapa1TiempoSegundos",    0);
						
						localStorage.setItem("Etapa2", 2);
						localStorage.setItem("Etapa2PuntajeDeAciertos", 0);
						localStorage.setItem("Etapa2PuntajeDeErrores",  0);
						localStorage.setItem("Etapa2TiempoSegundos",    0);		
					}
					
					crearInforme();	
						
					
					location.reload();			
					
				}        
		}
		
		const crearDisparo = () => {
			
			let varDisparo           = document.createElement('div');
			
			varDisparo.classList.add('disparo');
			varDisparo.style.bottom  = 70+'px';
			varDisparo.style.left    =  (varNave.getBoundingClientRect().left+70)+'px';
			
			varFondoEspacio.append(varDisparo);
			
			varSonidoLaser.play();		       
		}		
	
		const moverDisparo = () => {
			
			let varTiros  =  document.querySelectorAll('.disparo');
			
			varTiros.forEach(varDisparo => {
				
				varDisparo.style.top =  (varDisparo.getBoundingClientRect().top-20)+'px';
						
				if (varDisparo.getBoundingClientRect().top <=0 )
				{
					varDisparo.remove();
				}

				//  Detectamos las colisiones entre el disparo y el asteroide
						
				let varMeteoros  =   document.querySelectorAll('.asteroide');

				varMeteoros.forEach(varAsteroide => {
							
					if (varDisparo.getBoundingClientRect().top   <=  varAsteroide.getBoundingClientRect().top+50)
					{
						if (varDisparo.getBoundingClientRect().left   >=  varAsteroide.getBoundingClientRect().left && varDisparo.getBoundingClientRect().left  <=   varAsteroide.getBoundingClientRect().left+80)
						{
							varAsteroide.style.backgroundImage = 'url("imagenes/Burbuja_Explosion.png")'; //Explosion abajo
							varSonidoExplosion.play();
									
							setTimeout(() => {
									   varAsteroide.remove();
									   varSonidoExplosion.stop();                       
							}, 100);

						}
					}
				});
			 });	       
		}	
		
		const crearMeteorito = () => {
			
				aparecer++;
				if (aparecer % 10 == 0)
				{
					let varAsteroide  = document.createElement('div');
					
					/* Colocamos un valor aleatorio al meteorito*/
					
					varValorAsteroide             =  GenerarNumeroAleatorioConRango(-100, 100);
					varAsteroide .innerText        =  varValorAsteroide.toString();
					varAsteroide.style.color      =  "blue";
					 
					
					/*  aumentar el tamaño de la letra en el asteroide (PENDIENTE) */
					/* Se aumento en el CSS*/
					
					/* ******************************************************************************************************** */
					
					/* Colocamos una condicion para colocar el resultado en un asteroide
					 * -cambiar la condicion */
					 
					if (Math.random() > 0.5)
                            varAsteroide.innerText = varResultado.toString();
                            
                    /* ********************************************************************************************************* */        
					
					
					varAsteroide.classList.add('asteroide');
					varFondoEspacio.append(varAsteroide);
					varAsteroide.style.left   =   (Math.random()*window.innerWidth-100)+'px';
				}
				
				let varMeteoros  =   document.querySelectorAll('.asteroide');
				
				varMeteoros.forEach(asteroide => {
					
						  asteroide.style.top = (asteroide.getBoundingClientRect().top+10)+'px';
						  
						  if (asteroide.getBoundingClientRect().top  >  varNave.getBoundingClientRect().top)
						  {
							        if (asteroide.getBoundingClientRect().left   <  varNave.getBoundingClientRect().left && asteroide.getBoundingClientRect().left  >   varNave.getBoundingClientRect().left)
							        {							  
										// Aun no hay colision		
									 }
									 else									   								
									 {    // La nave intersecta a un meteorito
										
										// ****** Comparamos si el asteroide tiene la respuesta correcta
																  
										/* obtengo el valor del asteroide en texto */
										   varValorEnTextoDelAsteroide = asteroide.innerText;

										/* Realizo la transformacion numerica del texto  de numeros */
										   varValorTomadoDelAsteroide = Number(varValorEnTextoDelAsteroide);
																		
										/* Si el asteroide no tiene el resultado correcto */
																									
										   if (varValorTomadoDelAsteroide != varResultado)
										   {
												 varPuntajeDeErrores++;
																			 
												 varPuntajeEnLetreroDeErrores.textContent = varPuntajeDeErrores;
																			  
																			 
												 /*  Mandamos un sonido de incorrecto  ---------------------------------------------   */
																			 
												 asteroide.style.backgroundImage          = 'url("imagenes/Burbuja_Explosion.png")';
												 asteroide.classList.remove('asteroide');
												 varSonidoAsteriodeIncorrecto.currentTime = 0;
												 varSonidoAsteriodeIncorrecto.play();	
																		  
												 setTimeout(() => {
												    				   asteroide.remove();
													    			   varSonidoAsteriodeIncorrecto.pause(); 													                        
																  }, 100);										  
																		  
												 varVidas --;
												 varTextoDeVidas.textContent = varVidas;
																			  
												 if (varVidas <= 0)
												 {
													  varVidas = 0;
													  varTextoDeVidas.textContent      = varVidas;
													 
													  varSonidoFinDelJuego.currentTime = 0;
													  varSonidoFinDelJuego.play();

													  varSonidoDeFondo.currentTime     = 0;
													  varSonidoDeFondo.pause();
													  alert('Se terminaron tus vidas');
													  
													  // ***************************** Generamos el reporte **************************************
													  //  Vamos a empezar a mostrar el registro del intento actual y el registro del intento anterior
					
														puntajeTotalIntentoAnteriorAciertos     = localStorage.getItem("PuntajeGeneralDeAciertos");
														
														// Si fue el primer intento
														if (puntajeTotalIntentoAnteriorAciertos == null)
														{
															alert("Este fue el primer intento");
															
															localStorage.setItem("PuntajeGeneralDeAciertos", 0);
															localStorage.setItem("Etapa1", 1);
															
															localStorage.setItem("Etapa1PuntajeDeAciertos", 0);
															localStorage.setItem("Etapa1PuntajeDeErrores",  0);
															localStorage.setItem("Etapa1TiempoSegundos",    0);
															
															localStorage.setItem("Etapa2", 2);
															localStorage.setItem("Etapa2PuntajeDeAciertos", 0);
															localStorage.setItem("Etapa2PuntajeDeErrores",  0);
															localStorage.setItem("Etapa2TiempoSegundos",    0);		
														}
														
														crearInforme();	
													  
													   // *****************************************************************************************
																				  
													  location.reload();
												  }							  

											 }
											 else   /*  Cuando el asteroide tiene la respuesta correcta   */
											 {
												 
												   /*  Verificamos si la nave logro atrapar el asteroide con la respuesta correcta */
												   if  (varNave.getBoundingClientRect().left    <= asteroide.getBoundingClientRect().right  &&  varNave.getBoundingClientRect().right >= asteroide.getBoundingClientRect().left)
												   {												   
																/* Si la nave logro atrapar el asteroide con las respuesta correcta.- Incrementamos sus puntos (Aciertos)  */
																  GanarPuntosEnAsteroides();
																  
																  varVidas++;
																  varTextoDeVidas.textContent = varVidas;
																  
																  // Actualizamos la barra de progreso

																  varEstadoActualBarraDeProgreso =  varEstadoActualBarraDeProgreso + varDeltaBarraDeEstado;

																  if (varEstadoActualBarraDeProgreso >= 100)
																  {
																				varEstadoActualBarraDeProgreso =100;
																   }	
																	
																								  
																  // Si el jugador llego al maximo de aciertos, sube al siguiente nivel
																								  
																  if(varPuntajeDeAciertos == cantidadDeAciertos)
																  {
																	   // Guardamos los resultados de la etapa que se dejo
																	   switch (etapaDelJuego)
																	   {
																		   case 1: 
																			       etapa1IntentoActual                  =      etapaDelJuego;
																			       etapa1IntentoActualPuntajeDeAciertos =      varPuntajeDeAciertos;
																			       etapa1IntentoActualPuntajeDeErrores  =      varPuntajeDeErrores;
																			       etapa1IntentoActualTiempoSegundos    =      tiempoSegundos;																			   
																			   	  
																			       break;
																		   case 2: 
																			       etapa2IntentoActual                  =      etapaDelJuego;
																			       etapa2IntentoActualPuntajeDeAciertos =      varPuntajeDeAciertos;
																			       etapa2IntentoActualPuntajeDeErrores  =      varPuntajeDeErrores;
																			       etapa2IntentoActualTiempoSegundos    =      tiempoSegundos;
																			   
																			       break;
																	   }		   
																		// Subimos de nivel
																		etapaDelJuego++;
																										  
																		// Inicializamos las variables Generales  
																										  
																		varPuntajeDeAciertos   		   =      0;
																		varPuntajeDeErrores    		   =      0;
																		
																		
																		
																		varEstadoActualBarraDeProgreso =      0;														
																		varDeltaBarraDeEstado          =      100/cantidadDeAciertos;
																		
																		varVidas		               =      5;														
																		tiempoSegundos	  	           =      cantidadEnSegundos;
																		aparecer          	           =      0;
																		
																		varValorAsteroide 	           =      0;
																			
																		varSigno1         		       =      0;
																		varSigno2            		   =      0;
																		
																		varPuntajeEnLetreroDeAciertos.textContent  = varPuntajeDeAciertos;
																		varPuntajeEnLetreroDeErrores.textContent   = varPuntajeDeErrores;
																		varTextoDeVidas.textContent                = varVidas;
																										  
																										  
																		// Inicializamos las variables particulares de cada nivel
																										  
																		switch(etapaDelJuego)
																		{
																			case 1: 					
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.pause();
																		
																					  varSonidoDeFondo.src                  = "Sonidos/Sonido_Juego1.mp3";
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.play();
																								
																					  varNave.style.backgroundImage         = 'url("imagenes/Tortuguita_Juego1.gif")';
																					  varFondoEspacio.style.backgroundImage = 'url("imagenes/Fondo_Marino_Juego.png")';
																					  
																					  varNumeroNivel.textContent            = etapaDelJuego;
																					  
																					  break;
																					  
																			case 2: 
																			          // Reproducimos el sonido de cambio de nivel
																					  varSonidoCambioDeNivel.currentTime    = 0;
																					  varSonidoCambioDeNivel.play();
																					  							
																					  // Cambiamos el fondo para el segundo nivel																			
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.pause();
																											
																					  // Reproducimos el sonido del 2do nivel						
																					  varSonidoDeFondo.src                  = "Sonidos/Sonido_Juego2.mp3";
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.play();
																													
																					  // Cambiamos el fondo y la nave para el segundo nivel																							  
																					  varNave.style.backgroundImage         = 'url("imagenes/Tortuguita_Juego2.png")';
																					  varFondoEspacio.style.backgroundImage = 'url("imagenes/Fondo_Marino_Juego2.png")';
																					  
																					  varNumeroNivel.textContent            = etapaDelJuego;
																					  
																					  break;
																			case 3:														
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.pause();
																											
																					  varSonidoDeFondo.src                  = "Sonidos/intro.mp3";
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.play();
																					  
																					  varEstadoActualBarraDeProgreso =  varEstadoActualBarraDeProgreso + varDeltaBarraDeEstado;
																					  if (varEstadoActualBarraDeProgreso >= 100)
																					  {
																						   varEstadoActualBarraDeProgreso = 100;
																					  }																  
																					  varBarraDeProgreso.value = varEstadoActualBarraDeProgreso;
																											
																					  alert("¡¡¡¡¡¡¡Haz completado los niveles!!!!!!!");	

																					   // ***************************** Generamos el reporte **************************************
																						//  Vamos a empezar a mostrar el registro del intento actual y el registro del intento anterior
					
																						puntajeTotalIntentoAnteriorAciertos     = localStorage.getItem("PuntajeGeneralDeAciertos");
																						
																						// Si fue el primer intento
																						if (puntajeTotalIntentoAnteriorAciertos == null)
																						{
																							alert("Este fue el primer intento");
																							
																							localStorage.setItem("PuntajeGeneralDeAciertos", 0);
																							localStorage.setItem("Etapa1", 1);
																							
																							localStorage.setItem("Etapa1PuntajeDeAciertos", 0);
																							localStorage.setItem("Etapa1PuntajeDeErrores",  0);
																							localStorage.setItem("Etapa1TiempoSegundos",    0);
																							
																							localStorage.setItem("Etapa2", 2);
																							localStorage.setItem("Etapa2PuntajeDeAciertos", 0);
																							localStorage.setItem("Etapa2PuntajeDeErrores",  0);
																							localStorage.setItem("Etapa2TiempoSegundos",    0);		
																						}
																						
																						crearInforme();	
													  
																					  // *****************************************************************************************
																					  
																					  location.reload();
																					  
																					  break;												
																			default:	
																																									
																					  alert("El juego comenzara de nuevo :)");
																													  
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.pause();
																											
																					  varSonidoDeFondo.src                  = "Sonido/Sonido_Juego1.mp3";
																					  varSonidoDeFondo.currentTime          = 0;
																					  varSonidoDeFondo.play();
																									
																					  varNave.style.backgroundImage         = 'url("imagenes/Tortuguita_Juego1")';
																					  varFondoEspacio.style.backgroundImage = 'url("imagenes/Fondo_Marino_Juego.png")';
																													  
																					  etapaDelJuego = 1;
																					  
																					  varNumeroNivel.textContent            = etapaDelJuego;
																					  location.reload();
																					  break;
																		 }										  
																	}
																									
																	switch(etapaDelJuego)
																	{
																			case 1: 
																					ConstruyeExpresionMatematicaFase1();
																					break;
																			case 2: 
																					ConstruyeExpresionMatematicaFase2();
																					break;														
																			default:						
																					break;
																	}	
																									
																	varExpresionMatematicaEnTexto.innerHTML = varFormulaEnTexto;
																									
																	asteroide.remove();
													}
													else
													{
															 varPuntajeDeErrores++;
																			 
															 varPuntajeEnLetreroDeErrores.textContent = varPuntajeDeErrores;
																						  
																						 
															 /*  Mandamos un sonido de incorrecto  ---------------------------------------------   */
																						 
															 asteroide.style.backgroundImage = 'url("imagenes/Burbuja_Explosion.png")';
															 varSonidoAsteriodeIncorrecto.currentTime = 0;
															 varSonidoAsteriodeIncorrecto.play();	
																					  
															 setTimeout(() => {
																				   asteroide.remove();
																				   varSonidoAsteriodeIncorrecto.stop(); 													                        
																			  }, 100);										  
																					  
															 varVidas--;
															 varTextoDeVidas.textContent = varVidas;
																						  
															 if (varVidas == 0)
															 {
																  varVidas = 0;
																  varTextoDeVidas.textContent = varVidas;
																 
																  varSonidoFinDelJuego.currentTime = 0;
																  varSonidoFinDelJuego.play();

																  varSonidoDeFondo.currentTime     = 0;
																  varSonidoDeFondo.pause();
																  alert('Se terminaron tus vidas');
																							  
																  location.reload();
															  }	
													}				
																	
																			
												}  // Fin del else	
																	  
												/* Actualizamos la barra de estado */

												varBarraDeProgreso.value = varEstadoActualBarraDeProgreso;
									}  								  	
						  }  // fin del if
					});      
		}
		
		
        //*********************** Inicio del programa ********************************************************* 
		
		varBarraDeProgreso.value     = varEstadoActualBarraDeProgreso;

		setInterval(sensarTiempo, 1000);	
		
        varSonidoDeFondo.currentTime = 0;
        varSonidoDeFondo.play();
		
		switch(etapaDelJuego)
		{
			case 1: 
					ConstruyeExpresionMatematicaFase1();
					break;
			case 2: 
					ConstruyeExpresionMatematicaFase2();
					break;														
			default:						

					break;
		}
        
        varExpresionMatematicaEnTexto.innerHTML = varFormulaEnTexto;
        

		document.addEventListener('mousemove',(e)=>{
			varNave.style.left=(e.clientX-40)+'px';
		});

		/* ---------- Controles táctiles (móvil/tablet) ---------- */
		/* Arrastrar con el dedo mueve la tortuga, igual que el mouse */

		document.addEventListener('touchmove',(e)=>{
			if (e.target.closest('.btn-regresar')) return;
			e.preventDefault();
			let varToque = e.touches[0];
			varNave.style.left=(varToque.clientX-40)+'px';
		}, { passive:false });

		/* Un toque también dispara, igual que el click */

		document.addEventListener('touchstart',(e)=>{
			if (e.target.closest('.btn-regresar')) return;
			e.preventDefault();
			let varToque = e.touches[0];
			varNave.style.left=(varToque.clientX-40)+'px';
			crearDisparo();
		}, { passive:false });

		/* -------------------------------------------------------- */


		// ********** Crear Disparo

		document.addEventListener('click',crearDisparo);

		//  ************ Crear el Movimiento de disparo
		setInterval(moverDisparo,100);

		// ************* Crear Meteoritos		

		setInterval(crearMeteorito,100);
}
