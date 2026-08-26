// ============================================================
// ANIME RUNNER
// FULL PC + PHONE VERSION
// ============================================================


// ============================================================
// HTML ELEMENTS
// ============================================================

const introScreen = document.getElementById("introScreen");
const nameScreen = document.getElementById("nameScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const surpriseScreen = document.getElementById("surpriseScreen");

const startIntroButton =
    document.getElementById("startIntroButton");

const nameButton =
    document.getElementById("nameButton");

const playButton =
    document.getElementById("playButton");

const retryButton =
    document.getElementById("retryButton");

const playerNameInput =
    document.getElementById("playerName");

const nameError =
    document.getElementById("nameError");

const welcomeText =
    document.getElementById("welcomeText");

const gamePlayerName =
    document.getElementById("gamePlayerName");

const timerElement =
    document.getElementById("timer");

const endMessage =
    document.getElementById("endMessage");

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================================
// CANVAS SETTINGS
// ============================================================

ctx.imageSmoothingEnabled = false;


// ============================================================
// SCREEN SYSTEM
// ============================================================

function showScreen(screen) {

    const screens = [
        introScreen,
        nameScreen,
        lobbyScreen,
        gameScreen,
        endScreen,
        surpriseScreen
    ];

    screens.forEach(screenItem => {
        screenItem.classList.remove("active");
    });

    screen.classList.add("active");
}


// ============================================================
// PLAYER NAME
// ============================================================

let playerName = "";


// ============================================================
// INTRO
// ============================================================

startIntroButton.addEventListener("click", () => {

    showScreen(nameScreen);

    setTimeout(() => {
        playerNameInput.focus();
    }, 300);
});


// ============================================================
// NAME
// ============================================================

nameButton.addEventListener("click", () => {

    const name =
        playerNameInput.value.trim();

    if (name === "") {

        nameError.textContent =
            "PLEASE ENTER YOUR NAME";

        return;
    }

    playerName = name;

    nameError.textContent = "";

    welcomeText.textContent =
        playerName;

    showScreen(lobbyScreen);
});


playerNameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            nameButton.click();
        }
    }
);


// ============================================================
// START / RETRY
// ============================================================

playButton.addEventListener(
    "click",
    startGame
);

retryButton.addEventListener(
    "click",
    startGame
);


// ============================================================
// CANVAS RESIZE
// ============================================================

function resizeCanvas() {

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        window.innerWidth * dpr;

    canvas.height =
        window.innerHeight * dpr;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.imageSmoothingEnabled = false;
}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ============================================================
// CHARACTER SPRITE
// ============================================================

const playerSprite =
    new Image();

playerSprite.src =
    "assets/character-run.png";

let spriteLoaded = false;

playerSprite.onload = () => {

    spriteLoaded = true;

    console.log(
        "Character sprite loaded."
    );
};

playerSprite.onerror = () => {

    console.error(
        "Could not load assets/character-run.png"
    );
};


// ============================================================
// GAME VARIABLES
// ============================================================

let gameRunning = false;

let gameAnimationId = null;

let gameStartTime = 0;

let lastTime = 0;

let elapsedTime = 0;

let groundY = 0;


// ============================================================
// PLAYER
// ============================================================

const player = {

    x: 110,

    y: 0,

    width: 105,

    height: 150,

    velocityY: 0,

    /*
       Strong enough to clearly jump
       over the obstacles on phone.
    */
    jumpPower: -1000,

    /*
       Gravity controls how quickly
       the character comes back down.
    */
    gravity: 2200,

    grounded: true,

    frame: 0,

    frameTimer: 0,

    frameSpeed: 0.09
};


// ============================================================
// SPRITE SHEET
// ============================================================

const FRAME_COUNT = 8;


/*
   These values assume your character-run.png
   contains the 8-frame running sheet.

   If your sheet is a single horizontal row,
   the code automatically uses the whole image
   height instead.
*/

let spriteSourceY = 0;

let spriteSourceHeight = 0;


// ============================================================
// OBSTACLES
// ============================================================

let obstacles = [];

let obstacleTimer = 0;

let obstacleInterval = 1.8;

const gameSpeed = 420;


// ============================================================
// START GAME
// ============================================================

function startGame() {

    if (gameAnimationId !== null) {

        cancelAnimationFrame(
            gameAnimationId
        );

        gameAnimationId = null;
    }


    gameRunning = true;

    elapsedTime = 0;

    obstacles = [];

    obstacleTimer = 0;

    obstacleInterval =
        1.7 +
        Math.random() * 0.7;


    player.frame = 0;

    player.frameTimer = 0;

    player.velocityY = 0;

    player.grounded = true;


    resizeCanvas();


    groundY =
        window.innerHeight - 105;


    player.y =
        groundY - player.height;


    gamePlayerName.textContent =
        playerName;


    timerElement.textContent =
        "30";


    showScreen(gameScreen);


    lastTime =
        performance.now();

    gameStartTime =
        performance.now();


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


    elapsedTime =
        (currentTime - gameStartTime) / 1000;


    // --------------------------------------------------------
    // TIMER
    // --------------------------------------------------------

    const remaining =
        Math.max(
            0,
            Math.ceil(30 - elapsedTime)
        );


    timerElement.textContent =
        remaining;


    // --------------------------------------------------------
    // WIN
    // --------------------------------------------------------

    if (elapsedTime >= 30) {

        finishGame();

        return;
    }


    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    updatePlayer(deltaTime);

    updateObstacles(deltaTime);

    updateSprite(deltaTime);

    checkCollisions();


    // --------------------------------------------------------
    // DRAW
    // --------------------------------------------------------

    drawGame();


    gameAnimationId =
        requestAnimationFrame(
            gameLoop
        );
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


    // --------------------------------------------------------
    // LANDING
    // --------------------------------------------------------

    const floorY =
        groundY - player.height;


    if (player.y >= floorY) {

        player.y = floorY;

        player.velocityY = 0;

        player.grounded = true;

    } else {

        player.grounded = false;
    }
}


// ============================================================
// JUMP
// ============================================================

function jump() {

    if (!gameRunning) {
        return;
    }


    /*
       No double jump.

       The character must touch the ground
       before another jump is allowed.
    */

    if (!player.grounded) {
        return;
    }


    player.velocityY =
        player.jumpPower;

    player.grounded = false;


    console.log("JUMP");
}


// ============================================================
// PC KEYBOARD
// ============================================================

window.addEventListener(
    "keydown",
    event => {

        if (
            document.activeElement ===
            playerNameInput
        ) {
            return;
        }


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
// PHONE + MOUSE
// ANYWHERE ON THE GAME SCREEN
// ============================================================

/*
   IMPORTANT:

   We listen on DOCUMENT rather than only the canvas.

   Therefore, when the game is active:

       TAP ANYWHERE ON PHONE SCREEN
                     ↓
                   JUMP

   This avoids problems caused by the canvas,
   game UI, or other layers covering the screen.
*/

document.addEventListener(
    "pointerdown",
    event => {

        if (!gameRunning) {
            return;
        }


        /*
           Prevent browser gestures while playing.
        */

        event.preventDefault();


        jump();

    },
    {
        passive: false
    }
);


// ============================================================
// EXTRA MOBILE TOUCH FALLBACK
// ============================================================

document.addEventListener(
    "touchstart",
    event => {

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

        player.frame++;

        if (
            player.frame >=
            FRAME_COUNT
        ) {

            player.frame = 0;
        }
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

    obstacleTimer +=
        deltaTime;


    if (
        obstacleTimer >=
        obstacleInterval
    ) {

        obstacleTimer = 0;


        createObstacle();


        obstacleInterval =
            1.7 +
            Math.random() * 0.8;
    }


    obstacles.forEach(
        obstacle => {

            obstacle.x -=
                gameSpeed *
                deltaTime;
        }
    );


    obstacles =
        obstacles.filter(
            obstacle => {

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

    /*
       Smaller player hitbox.

       This prevents transparent parts
       of the PNG from causing false collisions.
    */

    const playerBox = {

        x:
            player.x + 28,

        y:
            player.y + 20,

        width:
            player.width - 56,

        height:
            player.height - 25
    };


    for (
        const obstacle of obstacles
    ) {

        const obstacleBox = {

            x:
                obstacle.x + 3,

            y:
                obstacle.y + 3,

            width:
                obstacle.width - 6,

            height:
                obstacle.height - 6
        };


        const collision = (

            playerBox.x <
            obstacleBox.x +
            obstacleBox.width

            &&

            playerBox.x +
            playerBox.width >
            obstacleBox.x

            &&

            playerBox.y <
            obstacleBox.y +
            obstacleBox.height

            &&

            playerBox.y +
            playerBox.height >
            obstacleBox.y
        );


        if (collision) {

            gameOver();

            return;
        }
    }
}


// ============================================================
// DRAW EVERYTHING
// ============================================================

function drawGame() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    // ========================================================
    // SKY
    // ========================================================

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );


    sky.addColorStop(
        0,
        "#09051a"
    );

    sky.addColorStop(
        0.35,
        "#111433"
    );

    sky.addColorStop(
        0.70,
        "#101a2c"
    );

    sky.addColorStop(
        1,
        "#05070d"
    );


    ctx.fillStyle =
        sky;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // ========================================================
    // PURPLE ATMOSPHERE
    // ========================================================

    const purpleGlow =
        ctx.createRadialGradient(
            width * 0.5,
            height * 0.25,
            20,
            width * 0.5,
            height * 0.25,
            500
        );


    purpleGlow.addColorStop(
        0,
        "rgba(105,65,180,0.20)"
    );

    purpleGlow.addColorStop(
        0.5,
        "rgba(60,40,120,0.10)"
    );

    purpleGlow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        purpleGlow;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // ========================================================
    // MOON
    // ========================================================

    const moonX =
        width * 0.78;

    const moonY =
        height * 0.18;

    const moonRadius = 48;


    const moonGlow =
        ctx.createRadialGradient(
            moonX,
            moonY,
            10,
            moonX,
            moonY,
            160
        );


    moonGlow.addColorStop(
        0,
        "rgba(210,210,255,0.22)"
    );

    moonGlow.addColorStop(
        1,
        "rgba(150,150,255,0)"
    );


    ctx.fillStyle =
        moonGlow;


    ctx.beginPath();

    ctx.arc(
        moonX,
        moonY,
        160,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#d9dcff";


    ctx.beginPath();

    ctx.arc(
        moonX,
        moonY,
        moonRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Moon details

    ctx.fillStyle =
        "rgba(120,125,170,0.15)";


    ctx.beginPath();

    ctx.arc(
        moonX - 15,
        moonY - 10,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        moonX + 15,
        moonY + 15,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ========================================================
    // STARS
    // ========================================================

    drawStars(
        width,
        height
    );


    // ========================================================
    // MOUNTAINS
    // ========================================================

    drawMountains(
        width,
        height
    );


    // ========================================================
    // GROUND
    // ========================================================

    groundY =
        height - 105;


    ctx.fillStyle =
        "#060911";


    ctx.fillRect(
        0,
        groundY,
        width,
        height - groundY
    );


    ctx.fillStyle =
        "rgba(130,110,210,0.25)";


    ctx.fillRect(
        0,
        groundY,
        width,
        2
    );


    // ========================================================
    // ROAD LINES
    // ========================================================

    ctx.fillStyle =
        "rgba(150,140,190,0.12)";


    const roadLineWidth = 65;

    const roadGap = 75;


    const roadOffset =
        (elapsedTime * gameSpeed) %
        (roadLineWidth + roadGap);


    for (
        let x = -roadOffset;
        x < width;
        x +=
            roadLineWidth +
            roadGap
    ) {

        ctx.fillRect(
            x,
            groundY + 32,
            roadLineWidth,
            3
        );
    }


    // ========================================================
    // OBSTACLES
    // ========================================================

    drawObstacles();


    // ========================================================
    // PLAYER
    // ========================================================

    drawPlayer();
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


    stars.forEach(star => {

        ctx.beginPath();

        ctx.arc(
            width * star[0],
            height * star[1],
            star[2],
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}


// ============================================================
// MOUNTAINS
// ============================================================

function drawMountains(
    width,
    height
) {

    // Far mountains

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


    // Near mountains

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


    // Trees

    ctx.fillStyle =
        "#060a12";


    const trees = [

        width * 0.05,
        width * 0.16,
        width * 0.31,
        width * 0.48,
        width * 0.69,
        width * 0.84,
        width * 0.94
    ];


    trees.forEach(x => {

        const base =
            groundY;


        ctx.beginPath();

        ctx.moveTo(
            x,
            base - 125
        );

        ctx.lineTo(
            x - 38,
            base - 25
        );

        ctx.lineTo(
            x + 38,
            base - 25
        );

        ctx.closePath();

        ctx.fill();


        ctx.fillRect(
            x - 5,
            base - 25,
            10,
            25
        );
    });
}


// ============================================================
// DRAW OBSTACLES
// ============================================================

function drawObstacles() {

    obstacles.forEach(
        obstacle => {

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


            // Body

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


            ctx.lineWidth = 1;


            ctx.strokeRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );


            // Top highlight

            ctx.fillStyle =
                "rgba(220,200,255,0.18)";


            ctx.fillRect(
                obstacle.x + 4,
                obstacle.y + 4,
                obstacle.width - 8,
                3
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


    /*
       The entire image height is used.

       This avoids cutting off the character's
       head or body if your PNG is a normal
       horizontal 8-frame sprite sheet.
    */

    const sourceHeight =
        playerSprite.naturalHeight;


    const sourceX =
        player.frame *
        frameWidth;


    ctx.drawImage(

        playerSprite,

        sourceX,
        0,

        frameWidth,
        sourceHeight,

        player.x,
        player.y,

        player.width,
        player.height
    );
}


// ============================================================
// FALLBACK CHARACTER
// ============================================================

function drawFallbackPlayer() {

    const x =
        player.x;

    const y =
        player.y;


    // Glow

    const glow =
        ctx.createRadialGradient(
            x + 52,
            y + 70,
            5,
            x + 52,
            y + 70,
            80
        );


    glow.addColorStop(
        0,
        "rgba(150,100,255,0.35)"
    );

    glow.addColorStop(
        1,
        "rgba(150,100,255,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();

    ctx.arc(
        x + 52,
        y + 70,
        80,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.fillStyle =
        "#493477";


    ctx.fillRect(
        x + 27,
        y + 58,
        50,
        65
    );


    // Head

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


    // Hair

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


    // Legs

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
// GAME OVER
// ============================================================

function gameOver() {

    if (!gameRunning) {
        return;
    }


    gameRunning = false;


    if (gameAnimationId !== null) {

        cancelAnimationFrame(
            gameAnimationId
        );

        gameAnimationId = null;
    }


    endMessage.textContent =
        "THE JOURNEY ENDED TOO SOON.";


    showScreen(endScreen);
}


// ============================================================
// WIN
// ============================================================

function finishGame() {

    if (!gameRunning) {
        return;
    }


    gameRunning = false;


    if (gameAnimationId !== null) {

        cancelAnimationFrame(
            gameAnimationId
        );

        gameAnimationId = null;
    }


    showScreen(
        surpriseScreen
    );
}


// ============================================================
// INITIAL SCREEN
// ============================================================

showScreen(
    introScreen
);