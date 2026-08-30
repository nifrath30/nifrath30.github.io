// ============================================================
// ANIME RUNNER
// Simple Game Version
// No accounts / No Supabase / No saved player data
// ============================================================

console.log("GAME.JS FILE STARTED");


// ============================================================
// ELEMENTS
// ============================================================

const introScreen = document.getElementById("introScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const surpriseScreen = document.getElementById("surpriseScreen");

const startIntroButton =
    document.getElementById("startIntroButton");

const playButton =
    document.getElementById("playButton");

const retryButton =
    document.getElementById("retryButton");

const scoreElement =
    document.getElementById("score");

const resultPanel =
    document.getElementById("resultPanel");

const resultScore =
    document.getElementById("resultScore");

const resultHighScore =
    document.getElementById("resultHighScore");

const canvas =
    document.getElementById("gameCanvas");


// ============================================================
// SAFETY CHECK
// ============================================================

if (!canvas) {

    console.error(
        "ERROR: gameCanvas was not found."
    );

} else {

    console.log(
        "gameCanvas found."
    );
}


const ctx =
    canvas
        ? canvas.getContext("2d")
        : null;


// ============================================================
// SCREEN SYSTEM
// ============================================================

function showScreen(screen) {

    if (!screen) {

        console.error(
            "Screen element not found."
        );

        return;
    }


    document
        .querySelectorAll(".screen")
        .forEach(
            function (element) {

                element.classList.remove(
                    "active"
                );
            }
        );


    screen.classList.add(
        "active"
    );
}


// ============================================================
// BEGIN / ENTER GAME 1
// ============================================================

if (startIntroButton) {

    startIntroButton.addEventListener(
        "click",
        function () {

            console.log(
                "ENTER GAME 1 clicked."
            );


            showScreen(
                lobbyScreen
            );

        }
    );

} else {

    console.error(
        "ENTER GAME 1 button not found."
    );
}


// ============================================================
// CONTINUE
// ============================================================

if (playButton) {

    playButton.addEventListener(
        "click",
        function () {

            console.log(
                "CONTINUE clicked."
            );


            startGame();

        }
    );

} else {

    console.error(
        "CONTINUE button not found."
    );
}


// ============================================================
// RETRY
// ============================================================

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function () {

            console.log(
                "RETRY clicked."
            );


            startGame();

        }
    );

}


// ============================================================
// GAME VARIABLES
// ============================================================

let gameRunning = false;

let gameAnimationId = null;

let lastTime = 0;

let elapsedTime = 0;

let score = 0;

let groundY = 0;

let currentSpeed = 360;

const BASE_SPEED = 360;

const MAX_SPEED = 620;

const SPEED_INCREASE = 3.2;


// ============================================================
// PLAYER
// ============================================================

const player = {

    x: 110,

    y: 0,

    width: 105,

    height: 165,

    velocityY: 0,

    jumpPower: -920,

    gravity: 2200,

    grounded: true,

    frame: 0,

    frameTimer: 0,

    frameSpeed: 0.09

};


// ============================================================
// PLAYER SPRITE
// ============================================================

const playerSprite =
    new Image();


// IMPORTANT:
// game.js is inside the "game" folder.
// The sprite is inside "game/assets".
playerSprite.src =
    "assets/character-run.png";


let spriteLoaded = false;


playerSprite.onload =
    function () {

        spriteLoaded = true;

        console.log(
            "Character sprite loaded successfully."
        );

    };


playerSprite.onerror =
    function () {

        spriteLoaded = false;

        console.error(
            "ERROR: character-run.png could not be loaded."
        );

    };


const FRAME_COUNT = 8;


// These values are based on your existing sprite.
const SPRITE_SOURCE_Y = 280;

const SPRITE_SOURCE_HEIGHT = 350;


// ============================================================
// OBSTACLES
// ============================================================

let obstacles = [];

let distanceToNextObstacle = 0;


function randomObstacleDistance() {

    return (
        420 +
        Math.random() * 520
    );

}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    if (!canvas || !ctx) {

        console.error(
            "Cannot start game: canvas is missing."
        );

        return;
    }


    // Stop previous animation.
    if (
        gameAnimationId !== null
    ) {

        cancelAnimationFrame(
            gameAnimationId
        );

        gameAnimationId = null;

    }


    gameRunning = true;


    elapsedTime = 0;

    score = 0;

    currentSpeed =
        BASE_SPEED;


    obstacles = [];


    distanceToNextObstacle =
        randomObstacleDistance();


    player.frame = 0;

    player.frameTimer = 0;

    player.velocityY = 0;

    player.grounded = true;


    resizeCanvas();


    groundY =
        window.innerHeight - 105;


    player.y =
        groundY -
        player.height;


    if (scoreElement) {

        scoreElement.textContent =
            "0";

    }


    showScreen(
        gameScreen
    );


    lastTime =
        performance.now();


    console.log(
        "Game started."
    );


    gameAnimationId =
        requestAnimationFrame(
            gameLoop
        );

}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop(currentTime) {

    if (!gameRunning) {

        return;
    }


    const deltaTime =
        Math.min(
            (currentTime - lastTime) / 1000,
            0.033
        );


    lastTime =
        currentTime;


    elapsedTime +=
        deltaTime;


    // Gradually increase speed.
    currentSpeed =
        Math.min(
            MAX_SPEED,
            BASE_SPEED +
            elapsedTime *
            SPEED_INCREASE
        );


    // Score.
    score =
        Math.floor(
            elapsedTime *
            currentSpeed /
            10
        );


    if (scoreElement) {

        scoreElement.textContent =
            score;

    }


    updatePlayer(
        deltaTime
    );


    updateObstacles(
        deltaTime
    );


    updateSprite(
        deltaTime
    );


    checkCollisions();


    drawGame();


    if (gameRunning) {

        gameAnimationId =
            requestAnimationFrame(
                gameLoop
            );

    }

}


// ============================================================
// PLAYER PHYSICS
// ============================================================

function updatePlayer(deltaTime) {

    groundY =
        window.innerHeight - 105;


    player.velocityY +=
        player.gravity *
        deltaTime;


    player.y +=
        player.velocityY *
        deltaTime;


    const floorY =
        groundY -
        player.height;


    if (player.y >= floorY) {

        player.y =
            floorY;

        player.velocityY =
            0;

        player.grounded =
            true;

    } else {

        player.grounded =
            false;

    }

}


// ============================================================
// JUMP
// ============================================================

function jump() {

    if (!gameRunning) {

        return;
    }


    if (!player.grounded) {

        return;
    }


    player.velocityY =
        player.jumpPower;


    player.grounded =
        false;

}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

window.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            jump();

        }

    }
);


// ============================================================
// TOUCH / MOUSE CONTROLS
// ============================================================

if (canvas) {

    canvas.addEventListener(
        "pointerdown",
        function (event) {

            if (!gameRunning) {

                return;
            }


            event.preventDefault();

            jump();

        },
        {
            passive: false
        }
    );

}


// ============================================================
// SPRITE ANIMATION
// ============================================================

function updateSprite(deltaTime) {

    if (!spriteLoaded) {

        return;
    }


    player.frameTimer +=
        deltaTime;


    if (
        player.frameTimer >=
        player.frameSpeed
    ) {

        player.frameTimer = 0;


        player.frame =
            (
                player.frame + 1
            ) %
            FRAME_COUNT;

    }

}


// ============================================================
// CREATE OBSTACLE
// ============================================================

function createObstacle() {

    const width =
        45 +
        Math.random() * 20;


    const height =
        50 +
        Math.random() * 30;


    obstacles.push({

        x:
            window.innerWidth + 40,

        y:
            groundY - height,

        width:
            width,

        height:
            height

    });

}


// ============================================================
// UPDATE OBSTACLES
// ============================================================

function updateObstacles(deltaTime) {

    distanceToNextObstacle -=
        currentSpeed *
        deltaTime;


    if (
        distanceToNextObstacle <= 0
    ) {

        createObstacle();


        distanceToNextObstacle =
            randomObstacleDistance();

    }


    obstacles.forEach(
        function (obstacle) {

            obstacle.x -=
                currentSpeed *
                deltaTime;

        }
    );


    obstacles =
        obstacles.filter(
            function (obstacle) {

                return (
                    obstacle.x +
                    obstacle.width >
                    -100
                );

            }
        );

}


// ============================================================
// COLLISION DETECTION
// ============================================================

function checkCollisions() {

    const playerBox = {

        x:
            player.x + 29,

        y:
            player.y + 28,

        width:
            player.width - 58,

        height:
            player.height - 34

    };


    for (
        const obstacle of obstacles
    ) {

        const collision =

            playerBox.x <
            obstacle.x +
            obstacle.width

            &&

            playerBox.x +
            playerBox.width >
            obstacle.x

            &&

            playerBox.y <
            obstacle.y +
            obstacle.height

            &&

            playerBox.y +
            playerBox.height >
            obstacle.y;


        if (collision) {

            gameOver();

            return;
        }

    }

}


// ============================================================
// GAME OVER
// ============================================================

function gameOver() {

    if (!gameRunning) {

        return;
    }


    gameRunning = false;


    if (
        gameAnimationId !== null
    ) {

        cancelAnimationFrame(
            gameAnimationId
        );

        gameAnimationId = null;

    }


    console.log(
        "Game over. Score:",
        score
    );


    // Show current score.
    if (resultScore) {

        resultScore.textContent =
            score;

    }


    // There is NO high score anymore.
    if (resultHighScore) {

        resultHighScore.textContent =
            "";

    }


    if (resultPanel) {

        resultPanel.classList.remove(
            "new-record"
        );

    }


    // Show surprise screen.
    showScreen(
        surpriseScreen
    );

}


// ============================================================
// DRAW GAME
// ============================================================

function drawGame() {

    if (!ctx) {

        return;
    }


    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    drawBackground();

    drawGround();

    drawObstacles();

    drawPlayer();

}


// ============================================================
// BACKGROUND
// ============================================================

function drawBackground() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );


    gradient.addColorStop(
        0,
        "#050509"
    );


    gradient.addColorStop(
        0.55,
        "#0b1020"
    );


    gradient.addColorStop(
        1,
        "#15131d"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawStars(
        width,
        height
    );


    drawMountains(
        width,
        height
    );

}


// ============================================================
// STARS
// ============================================================

function drawStars(
    width,
    height
) {

    const stars = [

        [0.08, 0.15, 2],
        [0.18, 0.08, 1],
        [0.29, 0.20, 2],
        [0.42, 0.10, 1],
        [0.55, 0.18, 2],
        [0.67, 0.07, 1],
        [0.88, 0.10, 2],
        [0.93, 0.28, 1],
        [0.12, 0.34, 1],
        [0.36, 0.30, 1],
        [0.62, 0.31, 1]

    ];


    ctx.fillStyle =
        "rgba(220,215,255,0.7)";


    stars.forEach(
        function (star) {

            ctx.beginPath();


            ctx.arc(

                width * star[0],

                height * star[1],

                star[2],

                0,

                Math.PI * 2

            );


            ctx.fill();

        }
    );

}


// ============================================================
// MOUNTAINS
// ============================================================

function drawMountains(
    width,
    height
) {

    ctx.fillStyle =
        "#151936";


    ctx.beginPath();


    ctx.moveTo(
        0,
        height * 0.48
    );


    ctx.lineTo(
        width * 0.14,
        height * 0.29
    );


    ctx.lineTo(
        width * 0.29,
        height * 0.43
    );


    ctx.lineTo(
        width * 0.46,
        height * 0.25
    );


    ctx.lineTo(
        width * 0.64,
        height * 0.45
    );


    ctx.lineTo(
        width * 0.80,
        height * 0.30
    );


    ctx.lineTo(
        width,
        height * 0.44
    );


    ctx.lineTo(
        width,
        height * 0.62
    );


    ctx.lineTo(
        0,
        height * 0.62
    );


    ctx.closePath();


    ctx.fill();


    ctx.fillStyle =
        "#0b1120";


    ctx.beginPath();


    ctx.moveTo(
        0,
        height * 0.57
    );


    ctx.lineTo(
        width * 0.18,
        height * 0.40
    );


    ctx.lineTo(
        width * 0.35,
        height * 0.56
    );


    ctx.lineTo(
        width * 0.53,
        height * 0.39
    );


    ctx.lineTo(
        width * 0.72,
        height * 0.56
    );


    ctx.lineTo(
        width * 0.88,
        height * 0.43
    );


    ctx.lineTo(
        width,
        height * 0.55
    );


    ctx.lineTo(
        width,
        height * 0.68
    );


    ctx.lineTo(
        0,
        height * 0.68
    );


    ctx.closePath();


    ctx.fill();

}


// ============================================================
// GROUND
// ============================================================

function drawGround() {

    const roadHeight =
        105;


    const roadY =
        window.innerHeight -
        roadHeight;


    ctx.fillStyle =
        "#111116";


    ctx.fillRect(
        0,
        roadY,
        window.innerWidth,
        roadHeight
    );


    ctx.fillStyle =
        "#38383f";


    ctx.fillRect(
        0,
        groundY,
        window.innerWidth,
        3
    );


    const markWidth =
        55;

    const gap =
        90;


    const offset =
        (
            elapsedTime *
            currentSpeed
        ) %
        (
            markWidth +
            gap
        );


    ctx.fillStyle =
        "#55555c";


    for (
        let x = -offset;
        x < window.innerWidth;
        x += markWidth + gap
    ) {

        ctx.fillRect(
            x,
            groundY + 32,
            markWidth,
            3
        );

    }

}


// ============================================================
// DRAW OBSTACLES
// ============================================================

function drawObstacles() {

    obstacles.forEach(
        function (obstacle) {

            // Shadow
            ctx.fillStyle =
                "rgba(0,0,0,0.45)";


            ctx.fillRect(

                obstacle.x + 6,

                obstacle.y +
                obstacle.height,

                obstacle.width,

                7

            );


            // Obstacle gradient
            const gradient =
                ctx.createLinearGradient(

                    obstacle.x,
                    obstacle.y,

                    obstacle.x,
                    obstacle.y +
                    obstacle.height

                );


            gradient.addColorStop(
                0,
                "#514563"
            );


            gradient.addColorStop(
                0.5,
                "#30273f"
            );


            gradient.addColorStop(
                1,
                "#15131d"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(

                obstacle.x,
                obstacle.y,

                obstacle.width,
                obstacle.height

            );


            // Border
            ctx.strokeStyle =
                "rgba(195,165,235,0.65)";


            ctx.lineWidth =
                1;


            ctx.strokeRect(

                obstacle.x,
                obstacle.y,

                obstacle.width,
                obstacle.height

            );

        }
    );

}


// ============================================================
// DRAW PLAYER
// ============================================================

function drawPlayer() {

    if (!spriteLoaded) {

        drawFallbackPlayer();

        return;
    }


    const frameWidth =
        playerSprite.naturalWidth /
        FRAME_COUNT;


    const sourceX =
        player.frame *
        frameWidth;


    ctx.drawImage(

        playerSprite,

        sourceX,

        SPRITE_SOURCE_Y,

        frameWidth,

        SPRITE_SOURCE_HEIGHT,

        player.x,

        player.y,

        player.width,

        player.height

    );

}


// ============================================================
// FALLBACK PLAYER
// ============================================================

function drawFallbackPlayer() {

    const x =
        player.x;

    const y =
        player.y;


    ctx.fillStyle =
        "#493477";


    ctx.fillRect(
        x + 27,
        y + 58,
        50,
        65
    );


    ctx.fillStyle =
        "#d7ad8b";


    ctx.beginPath();


    ctx.arc(
        x + 52,
        y + 42,
        24,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
        "#11101d";


    ctx.beginPath();


    ctx.moveTo(
        x + 29,
        y + 39
    );


    ctx.lineTo(
        x + 38,
        y + 8
    );


    ctx.lineTo(
        x + 48,
        y + 28
    );


    ctx.lineTo(
        x + 59,
        y + 5
    );


    ctx.lineTo(
        x + 68,
        y + 27
    );


    ctx.lineTo(
        x + 79,
        y + 15
    );


    ctx.lineTo(
        x + 76,
        y + 43
    );


    ctx.closePath();


    ctx.fill();


    ctx.fillStyle =
        "#171426";


    ctx.fillRect(
        x + 30,
        y + 120,
        17,
        30
    );


    ctx.fillRect(
        x + 58,
        y + 120,
        17,
        30
    );

}


// ============================================================
// RESIZE CANVAS
// ============================================================

function resizeCanvas() {

    if (!canvas || !ctx) {

        return;
    }


    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        window.innerWidth *
        dpr;


    canvas.height =
        window.innerHeight *
        dpr;


    canvas.style.width =
        window.innerWidth +
        "px";


    canvas.style.height =
        window.innerHeight +
        "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.imageSmoothingEnabled =
        false;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// INITIALIZATION
// ============================================================

resizeCanvas();

showScreen(
    introScreen
);


console.log(
    "Anime Runner loaded successfully."
);