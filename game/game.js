console.log("========================================");
console.log("ANIME RUNNER GAME.JS STARTED");
console.log("========================================");


// ============================================================
// ANIME RUNNER
// Complete standalone game
//
// IMPORTANT FILE STRUCTURE:
//
// game/
// ├── index.html
// ├── game.css
// ├── game.js
// └── assets/
//     ├── character-run.png
//     └── surprise.png
//
// CHARACTER SPRITE:
// character-run.png must contain 8 equal horizontal frames.
//
// Example:
//
// | FRAME 1 | FRAME 2 | FRAME 3 | FRAME 4 |
// | FRAME 5 | FRAME 6 | FRAME 7 | FRAME 8 |
//
// The complete image height is used.
// No hard-coded source Y cropping is used.
// ============================================================



// ============================================================
// 1. GET HTML ELEMENTS
// ============================================================

const introScreen =
    document.getElementById("introScreen");

const lobbyScreen =
    document.getElementById("lobbyScreen");

const gameScreen =
    document.getElementById("gameScreen");

const surpriseScreen =
    document.getElementById("surpriseScreen");


const startIntroButton =
    document.getElementById("startIntroButton");

const playButton =
    document.getElementById("playButton");

const retryButton =
    document.getElementById("retryButton");


const canvas =
    document.getElementById("gameCanvas");

const scoreElement =
    document.getElementById("score");

const resultScore =
    document.getElementById("resultScore");

const surpriseImage =
    document.getElementById("surpriseImage");

const resultPanel =
    document.getElementById("resultPanel");


// ============================================================
// 2. BASIC HTML CHECK
// ============================================================

console.log("HTML elements:");

console.log(
    "introScreen:",
    introScreen
);

console.log(
    "lobbyScreen:",
    lobbyScreen
);

console.log(
    "gameScreen:",
    gameScreen
);

console.log(
    "surpriseScreen:",
    surpriseScreen
);

console.log(
    "startIntroButton:",
    startIntroButton
);

console.log(
    "playButton:",
    playButton
);

console.log(
    "retryButton:",
    retryButton
);

console.log(
    "canvas:",
    canvas
);


// ============================================================
// 3. STOP IF CANVAS IS MISSING
// ============================================================

if (!canvas) {

    console.error(
        "ERROR: gameCanvas was not found."
    );

    throw new Error(
        "gameCanvas is missing from game/index.html"
    );
}


// ============================================================
// 4. CANVAS CONTEXT
// ============================================================

const ctx =
    canvas.getContext("2d");


if (!ctx) {

    console.error(
        "ERROR: Could not create canvas context."
    );

    throw new Error(
        "Canvas 2D context unavailable."
    );
}


// ============================================================
// 5. IMAGE PATHS
// ============================================================

const CHARACTER_IMAGE_PATH =
    "assets/character-run.png";

const SURPRISE_IMAGE_PATH =
    "assets/surprise.png";


// ============================================================
// 6. CHARACTER SPRITE
// ============================================================

const characterSprite =
    new Image();

characterSprite.src =
    CHARACTER_IMAGE_PATH;


let characterSpriteLoaded = false;

let characterSpriteFailed = false;


characterSprite.onload =
    function () {

        characterSpriteLoaded = true;

        characterSpriteFailed = false;

        console.log(
            "========================================"
        );

        console.log(
            "CHARACTER SPRITE LOADED"
        );

        console.log(
            "Natural width:",
            characterSprite.naturalWidth
        );

        console.log(
            "Natural height:",
            characterSprite.naturalHeight
        );

        console.log(
            "Expected frames:",
            FRAME_COUNT
        );

        console.log(
            "Frame width:",
            characterSprite.naturalWidth /
            FRAME_COUNT
        );

        console.log(
            "Frame height:",
            characterSprite.naturalHeight
        );

        console.log(
            "========================================"
        );
    };


characterSprite.onerror =
    function () {

        characterSpriteLoaded = false;

        characterSpriteFailed = true;

        console.error(
            "========================================"
        );

        console.error(
            "CHARACTER SPRITE FAILED TO LOAD"
        );

        console.error(
            "Expected file:",
            CHARACTER_IMAGE_PATH
        );

        console.error(
            "Make sure character-run.png is inside:"
        );

        console.error(
            "game/assets/"
        );

        console.error(
            "========================================"
        );
    };


// ============================================================
// 7. SURPRISE IMAGE
// ============================================================

if (surpriseImage) {

    surpriseImage.src =
        SURPRISE_IMAGE_PATH;
}


// ============================================================
// 8. SPRITE SETTINGS
// ============================================================
//
// IMPORTANT:
//
// Your character image is an 8-frame horizontal sprite.
//
// Therefore:
//
// FRAME_COUNT = 8
//
// frameWidth = imageWidth / 8
//
// frameHeight = imageHeight
//
// There is intentionally NO:
//
// SPRITE_SOURCE_Y
// SPRITE_SOURCE_HEIGHT
//
// This prevents the old head/leg/previous-frame
// cropping problem.
// ============================================================

const FRAME_COUNT = 8;


// ============================================================
// 9. GAME STATE
// ============================================================

let gameRunning = false;

let gameAnimationId = null;

let lastTime = 0;

let elapsedTime = 0;

let score = 0;


// ============================================================
// 10. SPEED
// ============================================================
//
// The game does NOT start extremely fast.
//
// It starts at BASE_SPEED.
//
// It then gradually increases.
//
// MAX_SPEED prevents it from becoming impossible.
// ============================================================

const BASE_SPEED = 300;

const MAX_SPEED = 620;

const SPEED_INCREASE = 16;


// ============================================================
// 11. WORLD
// ============================================================

let groundY = 0;

let roadHeight = 105;


// ============================================================
// 12. PLAYER
// ============================================================

const player = {

    x: 110,

    y: 0,

    width: 105,

    height: 150,

    velocityY: 0,

    jumpPower: -820,

    gravity: 2200,

    grounded: true,

    frame: 0,

    frameTimer: 0,

    frameDuration: 0.085
};


// ============================================================
// 13. OBSTACLES
// ============================================================

let obstacles = [];

let distanceToNextObstacle = 0;


// ============================================================
// 14. SCREEN SWITCHING
// ============================================================

function showScreen(screen) {

    if (!screen) {

        console.error(
            "showScreen received a missing element."
        );

        return;
    }


    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(
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
// 15. INTRO → LOBBY
// ============================================================

if (startIntroButton) {

    startIntroButton.addEventListener(
        "click",
        function () {

            console.log(
                "ENTER GAME 1 clicked."
            );

            showLobby();
        }
    );

} else {

    console.error(
        "ENTER GAME 1 button not found."
    );
}


// ============================================================
// 16. SHOW LOBBY
// ============================================================

function showLobby() {

    stopGame();

    showScreen(
        lobbyScreen
    );

    console.log(
        "Lobby displayed."
    );
}


// ============================================================
// 17. CONTINUE BUTTON
// ============================================================
//
// This is the important part.
//
// Your HTML has:
//
// id="playButton"
//
// Therefore this listener is attached directly
// to that button.
// ============================================================

if (playButton) {

    playButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            console.log(
                "========================================"
            );

            console.log(
                "CONTINUE BUTTON CLICKED"
            );

            console.log(
                "Starting game..."
            );

            console.log(
                "========================================"
            );

            startGame();
        }
    );

} else {

    console.error(
        "========================================"
    );

    console.error(
        "CONTINUE BUTTON NOT FOUND!"
    );

    console.error(
        "Expected HTML:"
    );

    console.error(
        '<button id="playButton">'
    );

    console.error(
        "========================================"
    );
}


// ============================================================
// 18. RETRY BUTTON
// ============================================================

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            console.log(
                "RETRY clicked."
            );

            startGame();
        }
    );

} else {

    console.error(
        "Retry button not found."
    );
}


// ============================================================
// 19. RESIZE CANVAS
// ============================================================

function resizeCanvas() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.floor(
            width * dpr
        );


    canvas.height =
        Math.floor(
            height * dpr
        );


    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


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


    groundY =
        height - roadHeight;
}


window.addEventListener(
    "resize",
    function () {

        resizeCanvas();

        if (gameRunning) {

            player.y =
                Math.min(
                    player.y,
                    groundY -
                    player.height
                );
        }
    }
);


// ============================================================
// 20. RESET PLAYER
// ============================================================

function resetPlayer() {

    groundY =
        window.innerHeight -
        roadHeight;


    player.x = 110;


    player.y =
        groundY -
        player.height;


    player.velocityY =
        0;


    player.grounded =
        true;


    player.frame =
        0;


    player.frameTimer =
        0;
}


// ============================================================
// 21. RANDOM OBSTACLE DISTANCE
// ============================================================
//
// This is distance in world pixels, not milliseconds.
//
// The gaps are randomized.
// ============================================================

function randomObstacleDistance() {

    const minimum =
        480;

    const maximum =
        900;


    return (
        minimum +
        Math.random() *
        (
            maximum -
            minimum
        )
    );
}


// ============================================================
// 22. START GAME
// ============================================================

function startGame() {

    console.log(
        "========================================"
    );

    console.log(
        "START GAME"
    );

    console.log(
        "========================================"
    );


    stopGame();


    resizeCanvas();


    gameRunning =
        true;


    elapsedTime =
        0;


    score =
        0;


    obstacles =
        [];


    distanceToNextObstacle =
        randomObstacleDistance();


    resetPlayer();


    updateScoreDisplay();


    showScreen(
        gameScreen
    );


    lastTime =
        performance.now();


    drawGame();


    gameAnimationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ============================================================
// 23. STOP GAME
// ============================================================

function stopGame() {

    gameRunning =
        false;


    if (
        gameAnimationId !== null
    ) {

        cancelAnimationFrame(
            gameAnimationId
        );


        gameAnimationId =
            null;
    }
}


// ============================================================
// 24. GAME LOOP
// ============================================================

function gameLoop(currentTime) {

    if (!gameRunning) {

        return;
    }


    let deltaTime =
        (
            currentTime -
            lastTime
        ) / 1000;


    lastTime =
        currentTime;


    // Prevent huge physics jumps if the browser
    // freezes for a moment.
    deltaTime =
        Math.min(
            deltaTime,
            0.033
        );


    // --------------------------------------------------------
    // TIME
    // --------------------------------------------------------

    elapsedTime +=
        deltaTime;


    // --------------------------------------------------------
    // GRADUAL SPEED
    // --------------------------------------------------------

    currentSpeed =
        Math.min(
            MAX_SPEED,
            BASE_SPEED +
            elapsedTime *
            SPEED_INCREASE
        );


    // --------------------------------------------------------
    // SCORE
    // --------------------------------------------------------

    score =
        Math.floor(
            elapsedTime *
            10
        );


    updateScoreDisplay();


    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    updatePlayer(
        deltaTime
    );


    updateObstacles(
        deltaTime
    );


    updateCharacterAnimation(
        deltaTime
    );


    checkCollisions();


    // --------------------------------------------------------
    // DRAW
    // --------------------------------------------------------

    drawGame();


    // --------------------------------------------------------
    // NEXT FRAME
    // --------------------------------------------------------

    if (gameRunning) {

        gameAnimationId =
            requestAnimationFrame(
                gameLoop
            );
    }
}


// ============================================================
// 25. CURRENT SPEED
// ============================================================

let currentSpeed =
    BASE_SPEED;


// ============================================================
// 26. SCORE DISPLAY
// ============================================================

function updateScoreDisplay() {

    if (scoreElement) {

        scoreElement.textContent =
            String(score);
    }
}


// ============================================================
// 27. PLAYER PHYSICS
// ============================================================

function updatePlayer(deltaTime) {

    groundY =
        window.innerHeight -
        roadHeight;


    // Gravity
    player.velocityY +=
        player.gravity *
        deltaTime;


    // Movement
    player.y +=
        player.velocityY *
        deltaTime;


    const floorY =
        groundY -
        player.height;


    // Floor collision
    if (
        player.y >=
        floorY
    ) {

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
// 28. JUMP
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
// 29. KEYBOARD CONTROLS
// ============================================================

window.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            if (gameRunning) {

                event.preventDefault();

                jump();
            }
        }
    }
);


// ============================================================
// 30. MOUSE / TOUCH CONTROLS
// ============================================================

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


// ============================================================
// 31. CHARACTER ANIMATION
// ============================================================
//
// VERY IMPORTANT:
//
// The image is divided into 8 equal-width cells.
//
// We NEVER use a hard-coded Y value.
//
// We NEVER use a hard-coded source height.
//
// We use:
//
// sourceX = frame * frameWidth
// sourceY = 0
// sourceWidth = frameWidth
// sourceHeight = entire image height
//
// Therefore every frame gets the complete character cell.
// ============================================================

function updateCharacterAnimation(
    deltaTime
) {

    if (
        !characterSpriteLoaded
    ) {

        return;
    }


    player.frameTimer +=
        deltaTime;


    while (
        player.frameTimer >=
        player.frameDuration
    ) {

        player.frameTimer -=
            player.frameDuration;


        player.frame =
            (
                player.frame + 1
            ) %
            FRAME_COUNT;
    }
}


// ============================================================
// 32. CREATE OBSTACLE
// ============================================================

function createObstacle() {

    const width =
        42 +
        Math.random() *
        24;


    const height =
        48 +
        Math.random() *
        32;


    const obstacle = {

        x:
            window.innerWidth +
            60,

        y:
            groundY -
            height,

        width:
            width,

        height:
            height
    };


    obstacles.push(
        obstacle
    );
}


// ============================================================
// 33. UPDATE OBSTACLES
// ============================================================

function updateObstacles(
    deltaTime
) {

    distanceToNextObstacle -=
        currentSpeed *
        deltaTime;


    if (
        distanceToNextObstacle <=
        0
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
// 34. COLLISION BOX
// ============================================================
//
// The visible sprite is slightly larger than the
// actual character body.
//
// So we use a smaller collision box.
// This makes the game feel fair.
// ============================================================

function getPlayerCollisionBox() {

    return {

        x:
            player.x +
            28,

        y:
            player.y +
            25,

        width:
            player.width -
            56,

        height:
            player.height -
            32
    };
}


// ============================================================
// 35. COLLISION CHECK
// ============================================================

function checkCollisions() {

    if (!gameRunning) {

        return;
    }


    const playerBox =
        getPlayerCollisionBox();


    for (
        let i = 0;
        i < obstacles.length;
        i++
    ) {

        const obstacle =
            obstacles[i];


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
// 36. GAME OVER
// ============================================================

function gameOver() {

    if (!gameRunning) {

        return;
    }


    console.log(
        "GAME OVER"
    );


    console.log(
        "Final score:",
        score
    );


    gameRunning =
        false;


    if (
        gameAnimationId !== null
    ) {

        cancelAnimationFrame(
            gameAnimationId
        );


        gameAnimationId =
            null;
    }


    // Show current score.
    if (resultScore) {

        resultScore.textContent =
            String(score);
    }


    // Make sure the surprise image is visible.
    if (surpriseImage) {

        surpriseImage.style.display =
            "block";
    }


    // Remove any previous record class.
    if (resultPanel) {

        resultPanel.classList.remove(
            "new-record"
        );
    }


    showScreen(
        surpriseScreen
    );
}


// ============================================================
// 37. DRAW GAME
// ============================================================

function drawGame() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawBackground(
        width,
        height
    );


    drawGround(
        width,
        height
    );


    drawObstacles();


    drawPlayer();
}


// ============================================================
// 38. BACKGROUND
// ============================================================

function drawBackground(
    width,
    height
) {

    // --------------------------------------------------------
    // SKY GRADIENT
    // --------------------------------------------------------

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
        0.45,
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


    // --------------------------------------------------------
    // STARS
    // --------------------------------------------------------

    drawStars(
        width,
        height
    );


    // --------------------------------------------------------
    // MOUNTAINS
    // --------------------------------------------------------

    drawMountains(
        width,
        height
    );
}


// ============================================================
// 39. STARS
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

        [0.62, 0.31, 1],

        [0.77, 0.19, 1],

        [0.48, 0.35, 1],

        [0.03, 0.25, 1],

        [0.98, 0.18, 1]
    ];


    ctx.fillStyle =
        "rgba(220,215,255,0.7)";


    stars.forEach(
        function (star) {

            ctx.beginPath();


            ctx.arc(

                width *
                star[0],

                height *
                star[1],

                star[2],

                0,

                Math.PI * 2
            );


            ctx.fill();
        }
    );
}


// ============================================================
// 40. MOUNTAINS
// ============================================================

function drawMountains(
    width,
    height
) {

    // --------------------------------------------------------
    // BACK MOUNTAINS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // FRONT MOUNTAINS
    // --------------------------------------------------------

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
// 41. GROUND
// ============================================================

function drawGround(
    width,
    height
) {

    const roadY =
        height -
        roadHeight;


    // --------------------------------------------------------
    // ROAD
    // --------------------------------------------------------

    ctx.fillStyle =
        "#111116";


    ctx.fillRect(
        0,
        roadY,
        width,
        roadHeight
    );


    // --------------------------------------------------------
    // TOP EDGE
    // --------------------------------------------------------

    ctx.fillStyle =
        "#38383f";


    ctx.fillRect(
        0,
        groundY,
        width,
        3
    );


    // --------------------------------------------------------
    // ROAD MARKINGS
    // --------------------------------------------------------

    const markWidth =
        55;


    const gap =
        90;


    const cycle =
        markWidth +
        gap;


    const offset =
        (
            elapsedTime *
            currentSpeed
        ) %
        cycle;


    ctx.fillStyle =
        "#55555c";


    for (
        let x = -offset;
        x < width;
        x += cycle
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
// 42. DRAW OBSTACLES
// ============================================================

function drawObstacles() {

    obstacles.forEach(
        function (obstacle) {

            // ------------------------------------------------
            // SHADOW
            // ------------------------------------------------

            ctx.fillStyle =
                "rgba(0,0,0,0.45)";


            ctx.fillRect(

                obstacle.x + 6,

                obstacle.y +
                obstacle.height,

                obstacle.width,

                7
            );


            // ------------------------------------------------
            // OBSTACLE BODY
            // ------------------------------------------------

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


            // ------------------------------------------------
            // OUTLINE
            // ------------------------------------------------

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
// 43. DRAW PLAYER
// ============================================================
//
// THIS IS THE MOST IMPORTANT SPRITE FUNCTION.
//
// We calculate the source frame from the actual image size.
//
// If the image is 1600 x 200:
//
// frameWidth = 1600 / 8 = 200
// frameHeight = 200
//
// Frame 0:
//
// sourceX = 0
// sourceY = 0
// sourceWidth = 200
// sourceHeight = 200
//
// Frame 1:
//
// sourceX = 200
//
// etc.
//
// NO OLD Y-CROP.
// NO 280.
// NO 350.
// NO HALF-BODY CROP.
// ============================================================

function drawPlayer() {

    // --------------------------------------------------------
    // SPRITE NOT LOADED
    // --------------------------------------------------------

    if (
        !characterSpriteLoaded ||
        characterSprite.naturalWidth <= 0 ||
        characterSprite.naturalHeight <= 0
    ) {

        drawFallbackPlayer();

        return;
    }


    // --------------------------------------------------------
    // IMAGE DIMENSIONS
    // --------------------------------------------------------

    const imageWidth =
        characterSprite.naturalWidth;


    const imageHeight =
        characterSprite.naturalHeight;


    // --------------------------------------------------------
    // EACH FRAME GETS EXACTLY 1/8 OF THE IMAGE WIDTH
    // --------------------------------------------------------

    const frameWidth =
        imageWidth /
        FRAME_COUNT;


    // --------------------------------------------------------
    // CURRENT FRAME
    // --------------------------------------------------------

    const frame =
        Math.max(
            0,
            Math.min(
                FRAME_COUNT - 1,
                Math.floor(player.frame)
            )
        );


    // --------------------------------------------------------
    // SOURCE RECTANGLE
    // --------------------------------------------------------

    const sourceX =
        frame *
        frameWidth;


    const sourceY =
        0;


    const sourceWidth =
        frameWidth;


    const sourceHeight =
        imageHeight;


    // --------------------------------------------------------
    // DRAW COMPLETE FRAME
    // --------------------------------------------------------

    ctx.drawImage(

        characterSprite,

        sourceX,

        sourceY,

        sourceWidth,

        sourceHeight,

        player.x,

        player.y,

        player.width,

        player.height
    );
}


// ============================================================
// 44. FALLBACK CHARACTER
// ============================================================
//
// This is ONLY used if character-run.png hasn't loaded.
// It prevents a completely blank player area.
// ============================================================

function drawFallbackPlayer() {

    const x =
        player.x;


    const y =
        player.y;


    // --------------------------------------------------------
    // BODY
    // --------------------------------------------------------

    ctx.fillStyle =
        "#493477";


    ctx.fillRect(
        x + 27,
        y + 55,
        50,
        68
    );


    // --------------------------------------------------------
    // HEAD
    // --------------------------------------------------------

    ctx.fillStyle =
        "#d7ad8b";


    ctx.beginPath();


    ctx.arc(
        x + 52,
        y + 39,
        23,
        0,
        Math.PI * 2
    );


    ctx.fill();


    // --------------------------------------------------------
    // HAIR
    // --------------------------------------------------------

    ctx.fillStyle =
        "#11101d";


    ctx.beginPath();


    ctx.moveTo(
        x + 28,
        y + 39
    );


    ctx.lineTo(
        x + 37,
        y + 8
    );


    ctx.lineTo(
        x + 48,
        y + 27
    );


    ctx.lineTo(
        x + 59,
        y + 5
    );


    ctx.lineTo(
        x + 69,
        y + 28
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


    // --------------------------------------------------------
    // LEGS
    // --------------------------------------------------------

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
// 45. PREVENT DOUBLE-START FROM MULTIPLE INPUTS
// ============================================================

let lastJumpTime =
    0;


function safeJump() {

    const now =
        performance.now();


    if (
        now -
        lastJumpTime <
        120
    ) {

        return;
    }


    lastJumpTime =
        now;


    jump();
}


// ============================================================
// 46. IMPROVED KEYBOARD INPUT
// ============================================================

window.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            if (!gameRunning) {

                return;
            }


            event.preventDefault();


            safeJump();
        }
    }
);


// ============================================================
// 47. MOUSE / TOUCH INPUT
// ============================================================

canvas.addEventListener(
    "pointerdown",
    function (event) {

        if (!gameRunning) {

            return;
        }


        event.preventDefault();


        safeJump();
    },
    {
        passive: false
    }
);


// ============================================================
// 48. DRAW INITIAL FRAME
// ============================================================

function drawInitialScene() {

    resizeCanvas();


    drawGame();
}


// ============================================================
// 49. PRELOAD CHARACTER
// ============================================================

function waitForCharacterThenDraw() {

    if (
        characterSprite.complete &&
        characterSprite.naturalWidth > 0
    ) {

        characterSpriteLoaded =
            true;

        console.log(
            "Character image was already cached."
        );

        return;
    }


    console.log(
        "Waiting for character sprite..."
    );
}


// ============================================================
// 50. INITIALIZATION
// ============================================================

resizeCanvas();

waitForCharacterThenDraw();

showScreen(
    introScreen
);

console.log(
    "========================================"
);

console.log(
    "ANIME RUNNER READY"
);

console.log(
    "Click ENTER GAME 1."
);

console.log(
    "Then click CONTINUE."
);

console.log(
    "========================================"
);