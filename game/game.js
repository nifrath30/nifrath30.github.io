// ==========================================
// ANIME RUNNER - PROTOTYPE
// ==========================================


// ---------- SCREEN SYSTEM ----------

const screens = {
    intro: document.getElementById("introScreen"),
    name: document.getElementById("nameScreen"),
    lobby: document.getElementById("lobbyScreen"),
    game: document.getElementById("gameScreen"),
    end: document.getElementById("endScreen"),
    surprise: document.getElementById("surpriseScreen")
};


function showScreen(screen) {

    Object.values(screens).forEach(item => {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


// ---------- PLAYER ----------

let playerName = "Traveler";

const nameInput = document.getElementById("playerName");
const nameError = document.getElementById("nameError");


// ---------- INTRO ----------

document
    .getElementById("startIntroButton")
    .addEventListener("click", () => {

        showScreen(screens.name);

        setTimeout(() => {
            nameInput.focus();
        }, 300);
    });


// ---------- NAME ----------

document
    .getElementById("nameButton")
    .addEventListener("click", enterName);


nameInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        enterName();
    }

});


function enterName() {

    const enteredName = nameInput.value.trim();

    if (enteredName.length === 0) {

        nameError.textContent = "Please enter your name.";

        return;
    }

    playerName = enteredName;

    document.getElementById("welcomeText").textContent =
        playerName.toUpperCase();

    document.getElementById("gamePlayerName").textContent =
        playerName.toUpperCase();

    showScreen(screens.lobby);
}


// ---------- PLAY ----------

document
    .getElementById("playButton")
    .addEventListener("click", () => {

        showScreen(screens.game);

        startGame();

    });


// ==========================================
// GAME ENGINE
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;

let gameRunning = false;

let gameStartTime = 0;

const GAME_DURATION = 30000;

let lastTime = 0;


// ---------- PLAYER OBJECT ----------

const player = {

    x: 0,

    y: 0,

    width: 45,
    height: 80,

    velocityY: 0,

    gravity: 1800,

    jumpPower: -700,

    grounded: true,

    runFrame: 0

};


// ---------- WORLD ----------

let worldSpeed = 350;

let worldOffset = 0;

let obstacles = [];

let particles = [];

let lastObstacle = 0;


// ---------- RESIZE ----------

function resizeCanvas() {

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    player.x = width * 0.18;

    player.y = height * 0.65;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// ==========================================
// START GAME
// ==========================================

function startGame() {

    gameRunning = true;

    gameStartTime = performance.now();

    lastTime = gameStartTime;

    obstacles = [];

    particles = [];

    worldOffset = 0;

    lastObstacle = 0;

    player.x = width * 0.18;

    player.y = height * 0.65;

    player.velocityY = 0;

    player.grounded = true;

    requestAnimationFrame(gameLoop);
}


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(time) {

    if (!gameRunning) return;

    const delta = Math.min(
        (time - lastTime) / 1000,
        0.033
    );

    lastTime = time;

    const elapsed = time - gameStartTime;

    const remaining = Math.max(
        0,
        Math.ceil((GAME_DURATION - elapsed) / 1000)
    );

    document.getElementById("timer").textContent =
        remaining;


    update(delta, elapsed);

    draw();


    if (elapsed >= GAME_DURATION) {

        finishGame();

        return;
    }


    requestAnimationFrame(gameLoop);
}


// ==========================================
// UPDATE
// ==========================================

function update(delta, elapsed) {

    // World movement

    worldOffset += worldSpeed * delta;


    // Player physics

    player.velocityY += player.gravity * delta;

    player.y += player.velocityY * delta;


    const groundY = height * 0.72;

    if (player.y + player.height >= groundY) {

        player.y = groundY - player.height;

        player.velocityY = 0;

        player.grounded = true;

    }


    // Running animation

    player.runFrame += delta * 10;


    // Obstacles

    lastObstacle += delta;

    if (lastObstacle > 1.4) {

        createObstacle();

        lastObstacle = 0;

    }


    obstacles.forEach(obstacle => {

        obstacle.x -= worldSpeed * delta;

    });


    obstacles = obstacles.filter(
        obstacle => obstacle.x + obstacle.width > -100
    );


    // Particles

    particles.forEach(particle => {

        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        particle.life -= delta;

    });


    particles = particles.filter(
        particle => particle.life > 0
    );


    // Add running dust

    if (Math.random() < 0.25) {

        createDust();

    }


    // Collision

    checkCollisions();
}


// ==========================================
// CREATE OBSTACLE
// ==========================================

function createObstacle() {

    const groundY = height * 0.72;

    const size = 30 + Math.random() * 35;

    obstacles.push({

        x: width + 50,

        y: groundY - size,

        width: size,

        height: size

    });

}


// ==========================================
// PARTICLES
// ==========================================

function createDust() {

    const groundY = height * 0.72;

    particles.push({

        x: player.x + 10,

        y: groundY - 5,

        vx: -40 - Math.random() * 40,

        vy: -20 - Math.random() * 40,

        life: 0.5,

        size: 2 + Math.random() * 4

    });

}


// ==========================================
// COLLISION
// ==========================================

function checkCollisions() {

    for (const obstacle of obstacles) {

        const padding = 10;

        if (

            player.x + player.width - padding >
                obstacle.x &&

            player.x + padding <
                obstacle.x + obstacle.width &&

            player.y + player.height - padding >
                obstacle.y &&

            player.y + padding <
                obstacle.y + obstacle.height

        ) {

            // For this prototype,
            // collision simply makes the
            // character jump away.

            player.velocityY = player.jumpPower * 0.7;

            createImpact(obstacle);

        }

    }

}


// ==========================================
// IMPACT EFFECT
// ==========================================

function createImpact(obstacle) {

    for (let i = 0; i < 10; i++) {

        particles.push({

            x: obstacle.x + obstacle.width / 2,

            y: obstacle.y,

            vx: (Math.random() - 0.5) * 300,

            vy: (Math.random() - 0.5) * 300,

            life: 0.5,

            size: 2 + Math.random() * 3

        });

    }

}


// ==========================================
// DRAW
// ==========================================

function draw() {

    ctx.clearRect(0, 0, width, height);


    drawSky();

    drawBackground();

    drawGround();

    drawObstacles();

    drawParticles();

    drawPlayer();

}


// ==========================================
// SKY
// ==========================================

function drawSky() {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        height
    );

    gradient.addColorStop(0, "#10152f");
    gradient.addColorStop(0.55, "#243b61");
    gradient.addColorStop(1, "#10151d");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}


// ==========================================
// BACKGROUND
// ==========================================

function drawBackground() {

    // Moon

    ctx.beginPath();

    ctx.arc(
        width * 0.78,
        height * 0.2,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(230, 235, 255, 0.9)";

    ctx.shadowBlur = 40;

    ctx.shadowColor =
        "rgba(170, 190, 255, 0.7)";

    ctx.fill();

    ctx.shadowBlur = 0;


    // Distant mountains

    ctx.fillStyle = "#151c2c";

    ctx.beginPath();

    ctx.moveTo(0, height * 0.62);

    for (
        let x = 0;
        x <= width + 100;
        x += 100
    ) {

        const y =
            height * 0.55 -
            Math.sin(
                (x + worldOffset * 0.15) * 0.008
            ) * 60;

        ctx.lineTo(x, y);

    }

    ctx.lineTo(width, height * 0.72);

    ctx.lineTo(0, height * 0.72);

    ctx.closePath();

    ctx.fill();


    // Trees

    const treeSpacing = 150;

    const offset =
        worldOffset * 0.3 %
        treeSpacing;

    for (
        let x = -treeSpacing + offset;
        x < width + treeSpacing;
        x += treeSpacing
    ) {

        drawTree(
            x,
            height * 0.72,
            0.8
        );

    }

}


// ==========================================
// TREE
// ==========================================

function drawTree(x, groundY, scale) {

    const h = 100 * scale;

    ctx.fillStyle = "#0b1018";

    ctx.fillRect(
        x - 6 * scale,
        groundY - h * 0.45,
        12 * scale,
        h * 0.45
    );

    ctx.beginPath();

    ctx.moveTo(
        x,
        groundY - h
    );

    ctx.lineTo(
        x - 45 * scale,
        groundY - h * 0.25
    );

    ctx.lineTo(
        x + 45 * scale,
        groundY - h * 0.25
    );

    ctx.closePath();

    ctx.fill();

}


// ==========================================
// GROUND
// ==========================================

function drawGround() {

    const groundY = height * 0.72;

    ctx.fillStyle = "#0a0e14";

    ctx.fillRect(
        0,
        groundY,
        width,
        height - groundY
    );


    ctx.strokeStyle =
        "rgba(130, 150, 180, 0.15)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        0,
        groundY
    );

    ctx.lineTo(
        width,
        groundY
    );

    ctx.stroke();


    // Moving ground lines

    const spacing = 100;

    const offset =
        worldOffset %
        spacing;

    ctx.strokeStyle =
        "rgba(255, 255, 255, 0.08)";

    for (
        let x = -spacing + offset;
        x < width + spacing;
        x += spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            groundY + 25
        );

        ctx.lineTo(
            x + 50,
            groundY + 25
        );

        ctx.stroke();

    }

}


// ==========================================
// OBSTACLES
// ==========================================

function drawObstacles() {

    obstacles.forEach(obstacle => {

        ctx.fillStyle = "#151526";

        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );

        ctx.strokeStyle =
            "rgba(160, 130, 255, 0.7)";

        ctx.strokeRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );

    });

}


// ==========================================
// PLAYER
// ==========================================

function drawPlayer() {

    const x = player.x;
    const y = player.y;

    const frame =
        Math.floor(player.runFrame) % 2;


    // Glow

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "rgba(140, 120, 255, 0.7)";


    // Body

    ctx.fillStyle = "#c9c9dc";

    ctx.fillRect(
        x + 10,
        y + 25,
        25,
        40
    );


    // Head

    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 15,
        15,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#f1d2c0";

    ctx.fill();


    // Hair

    ctx.fillStyle = "#151521";

    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 10,
        16,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Legs

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#c9c9dc";

    ctx.lineWidth = 7;

    ctx.lineCap = "round";

    ctx.beginPath();

    if (frame === 0) {

        ctx.moveTo(
            x + 17,
            y + 65
        );

        ctx.lineTo(
            x + 10,
            y + 80
        );

        ctx.moveTo(
            x + 29,
            y + 65
        );

        ctx.lineTo(
            x + 38,
            y + 78
        );

    } else {

        ctx.moveTo(
            x + 17,
            y + 65
        );

        ctx.lineTo(
            x + 8,
            y + 76
        );

        ctx.moveTo(
            x + 29,
            y + 65
        );

        ctx.lineTo(
            x + 34,
            y + 81
        );

    }

    ctx.stroke();

}


// ==========================================
// PARTICLES
// ==========================================

function drawParticles() {

    particles.forEach(particle => {

        ctx.fillStyle =
            `rgba(200, 210, 255, ${particle.life * 2})`;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

}


// ==========================================
// CONTROLS
// ==========================================

function jump() {

    if (!gameRunning) return;

    if (player.grounded) {

        player.velocityY =
            player.jumpPower;

        player.grounded = false;

    }

}


// Keyboard

window.addEventListener("keydown", event => {

    if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "KeyW"
    ) {

        event.preventDefault();

        jump();

    }

});


// Touch

window.addEventListener(
    "touchstart",
    event => {

        if (!gameRunning) return;

        event.preventDefault();

        jump();

    },
    { passive: false }
);


// Mouse

window.addEventListener(
    "mousedown",
    event => {

        if (!gameRunning) return;

        jump();

    }
);


// ==========================================
// FINISH
// ==========================================

function finishGame() {

    gameRunning = false;

    document.getElementById("timer").textContent = "0";

    document.getElementById("endMessage").textContent =
        `${playerName}, this is only the beginning...`;

    showScreen(screens.end);


    // ======================================
    // SURPRISE IMAGE
    //
    // CHANGE THIS NUMBER IF YOU WANT
    // A DIFFERENT DELAY.
    // ======================================

    setTimeout(() => {

        showScreen(screens.surprise);

    }, 1000);

}