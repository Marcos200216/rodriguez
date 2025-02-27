const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables del juego
let score = 0;
let gameInterval;
let gameOver = false;
let ducks = [];
let bullets = [];
let shooter = { x: canvas.width / 2 - 40, y: canvas.height - 100, width: 80, height: 80, speed: 8 }; // posición inicial del tirador

// Cargar la imagen del fondo
const background = new Image();
background.src = "paisaje.png"; // Asegúrate de que la imagen esté en la misma carpeta o ajusta la ruta

// Cargar la imagen del tirador
const shooterImage = new Image();
shooterImage.src = "shooter.png"; // Cambia con la ruta de la imagen del tirador

// Cargar sonidos
const sonidoDisparo = new Audio("sounds/disparo.wav");
sonidoDisparo.volume = 0.2;
const sonidoImpacto = new Audio("sounds/impacto.wav");
const sonidoFondo = new Audio("sounds/fondo.mp3");

// Reproducir sonido de fondo en bucle
sonidoFondo.loop = true;
sonidoFondo.volume = 0.5; // Ajusta el volumen si es necesario
sonidoFondo.play();

window.onload = function() {
    // Recupera la puntuación guardada o establece 0 si no hay ninguna
    let savedScore = localStorage.getItem("gameScore");
    score = savedScore ? parseInt(savedScore) : 0;  // Recuperar o inicializar en 0
    document.getElementById('score').innerText = score;  // Actualiza la pantalla con el puntaje
};

// Puntuación inicial
document.getElementById('score').innerText = score;

// Definición del pato
class Duck {
    constructor() {
        this.width = 50;  // Ancho fijo del pato
        this.height = 50; // Alto fijo del pato
        this.x = Math.random() * (canvas.width - this.width); // Generar posición X dentro de los límites del canvas
        this.y = canvas.height - this.height;
        this.width = 50;
        this.height = 50;
        this.speed = 1.5;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.image = new Image();
        this.image.src = "duck.png"; // Cambia con la ruta de tu imagen de pato
    }

    move() {
        this.x += this.direction * this.speed;
        this.y -= this.speed;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.direction *= -1; // Cambiar dirección
        }
        
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    reset() {
      this.x = Math.random() * (canvas.width - this.width); // Generar nueva posición X dentro del canvas
        this.y = canvas.height - this.height; 
    }
}

// Definición de la bala
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 19;
    }

    move() {
        this.y -= 15; // Aumenta la velocidad de las balas aquí
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Detectar colisiones entre las balas y los patos
function detectCollisions() {
    for (let b of bullets) {
        for (let d of ducks) {
            if (b.x < d.x + d.width && b.x + b.width > d.x && b.y < d.y + d.height && b.y + b.height > d.y) {
                score += 10;
                document.getElementById('score').innerText = score;
                localStorage.setItem("gameScore", score);
                // Reproducir sonido de impacto
                sonidoImpacto.currentTime = 0;  // Reinicia el sonido para que se reproduzca inmediatamente
                sonidoImpacto.play();
                d.reset(); // Reiniciar pato
                bullets = bullets.filter(bullet => bullet !== b); // Eliminar bala

                 // Verificar si alcanzó 1000 puntos para avanzar de nivel
                 if (score >= 500) {
                    showLevelUpMessage();
                }
            }
        }
    }
}

// Función para mostrar el mensaje flotante y redirigir a otro nivel
function showLevelUpMessage() {
    // Crear el mensaje flotante
    let message = document.createElement("div");
    message.innerText = "🎉 ¡Felicidades! Has avanzado al siguiente nivel.";
    message.style.position = "fixed";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.background = "rgba(0, 0, 0, 0.8)";
    message.style.color = "white";
    message.style.padding = "20px";
    message.style.borderRadius = "10px";
    message.style.fontSize = "20px";
    message.style.fontWeight = "bold";
    message.style.zIndex = "9999";
    document.body.appendChild(message);

    // Redirigir a otro_nivel.html después de 2 segundos
    setTimeout(() => {
        window.location.href = "otro_nivel.html";
    }, 2000);
}

// Mover los patos
function moveDucks() {
    for (let d of ducks) {
        d.move();
    }
}

// Mover las balas
function moveBullets() {
    for (let b of bullets) {
        b.move();
    }
}

let missedDucks = 0; // Contador de patos que han escapado

// Función para actualizar el contador de patos perdidos
function updateLostDucks() {
    document.getElementById('lostDucks').innerText = `Patos perdidos: ${missedDucks}`;

    if (missedDucks >= 3) {
        setTimeout(() => {
            alert("¡Juego Terminado! Has perdido 3 patos.");
        }, 100); // Pequeño retraso para que la pantalla se actualice primero
    }
}

// Dibujar los elementos en el canvas
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el fondo
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    moveDucks();
    for (let d of ducks) {
        d.draw();
    }

    moveBullets();
    for (let b of bullets) {
        b.draw();
    }

    detectCollisions();

    // Dibujar el tirador por encima del fondo
    ctx.drawImage(shooterImage, shooter.x, shooter.y, shooter.width, shooter.height);

    // Si algún pato llega a la parte superior, se aumenta el contador
    for (let d of ducks) {
        if (d.y <= 0) {
            missedDucks++; // Incrementa el contador de patos que escapan
            ducks = ducks.filter(duck => duck !== d); // Elimina el pato de la lista
        }
    }
    updateLostDucks();
    // Función de redirección cuando los tres patos escapan
    function endGame() {
        // Guardar el puntaje antes de salir
        localStorage.setItem("gameScore", score);

        // Redirigir a preguntas.html después de 1 segundo
        setTimeout(() => {
            window.location.href = "preguntas.html";
        }, 1000);
    }

    // Función que maneja la lógica de cuando un pato escapa
    if (missedDucks >= 3) {
        gameOver = true;
        endGame();  // Redirige a preguntas.html
    }

    if (!gameOver) {
        requestAnimationFrame(drawGame);
    }
}

// Agregar un pato cada 2 segundos
function addDuck() {
    setInterval(() => {
        if (!gameOver) {
            ducks.push(new Duck());
        }
    }, 5000);
}

// Variables para controlar el movimiento del tirador
let moveLeft = false;
let moveRight = false;

// Control de teclas (movimiento y disparo)
document.addEventListener('keydown', function (e) {
    if (e.key === "ArrowLeft" && !gameOver) {
        moveLeft = true;
    } else if (e.key === "ArrowRight" && !gameOver) {
        moveRight = true;
    } else if (e.key === " " && !gameOver) {
        bullets.push(new Bullet(shooter.x + shooter.width / 2 - 2, shooter.y));
        sonidoDisparo.currentTime = 0;  // Reinicia el sonido para que se reproduzca inmediatamente
        sonidoDisparo.play(); // Reproducir el sonido de disparo
    } 
});

// Control de teclas cuando se sueltan (para detener el movimiento)
document.addEventListener('keyup', function (e) {
    if (e.key === "ArrowLeft") {
        moveLeft = false;
    } else if (e.key === "ArrowRight") {
        moveRight = false;
    }
});

// Actualizar la posición del tirador según las teclas presionadas
function updateShooterPosition() {
    if (moveLeft && shooter.x > 0) {
        shooter.x -= shooter.speed;
    }
    if (moveRight && shooter.x + shooter.width < canvas.width) {
        shooter.x += shooter.speed;
    }
}

// Obtener el botón de inicio
const startButton = document.getElementById('startButton');

// Función para iniciar el juego
function startGame() {
    startButton.style.display = "none"; // Ocultar el botón al iniciar
    let savedScore = localStorage.getItem("gameScore");
    score = savedScore ? parseInt(savedScore) : 0;  // Si hay puntaje guardado, usa ese; si no, comienza en 0.
    document.getElementById('score').innerText = score;  // Actualiza el puntaje en la interfaz

    gameOver = false;
    ducks = [];
    bullets = [];
    addDuck(); // Agregar patos al juego sin preguntas
    drawGame(); // Iniciar el juego sin generar preguntas
    setInterval(updateShooterPosition, 1000 / 60);
}

// Evento para iniciar el juego al hacer clic en el botón
startButton.addEventListener("click", startGame);
