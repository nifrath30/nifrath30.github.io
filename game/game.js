// ============================================================
// ANIME RUNNER
// Supabase Auth + Player Data + Game
// ============================================================

// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_KEY;

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase client initialized.");


// ============================================================
// ELEMENTS
// ============================================================

const introScreen = document.getElementById("introScreen");
const nameScreen = document.getElementById("nameScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");
const surpriseScreen = document.getElementById("surpriseScreen");

const startIntroButton = document.getElementById("startIntroButton");
const nameButton = document.getElementById("nameButton");
const playButton = document.getElementById("playButton");
const retryButton = document.getElementById("retryButton");

const playerNameInput = document.getElementById("playerName");
const playerEmailInput = document.getElementById("playerEmail");
const playerPasswordInput = document.getElementById("playerPassword");

const nameError = document.getElementById("nameError");

const welcomeText = document.getElementById("welcomeText");
const welcomeLabel = document.getElementById("welcomeLabel");
const savedHighScore = document.getElementById("savedHighScore");

const gamePlayerName = document.getElementById("gamePlayerName");
const scoreElement = document.getElementById("score");

const resultPanel = document.getElementById("resultPanel");
const resultScore = document.getElementById("resultScore");
const resultHighScore = document.getElementById("resultHighScore");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// ============================================================
// PLAYER DATA
// ============================================================

const PLAYER_STORAGE_KEY = "animeRunnerPlayer";

let playerName = "";
let highScore = 0;
let currentUser = null;


// ============================================================
// SCREEN
// ============================================================

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach(element => {
        element.classList.remove("active");
    });

    screen.classList.add("active");
}


// ============================================================
// SHOW ERROR
// ============================================================

function showAccountError(message) {

    if (nameError) {
        nameError.textContent = message;
    }

    console.error(message);
}


// ============================================================
// CLEAR ERROR
// ============================================================

function clearAccountError() {

    if (nameError) {
        nameError.textContent = "";
    }
}


// ============================================================
// SAVE LOCAL PLAYER
// ============================================================

function saveLocalPlayer() {

    try {

        localStorage.setItem(
            PLAYER_STORAGE_KEY,
            JSON.stringify({
                name: playerName,
                highScore: highScore
            })
        );

    } catch (error) {

        console.error("Local save error:", error);
    }
}


// ============================================================
// LOAD SAVED SESSION
// ============================================================

async function loadExistingSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            return false;
        }

        if (!data || !data.session || !data.session.user) {
            return false;
        }

        currentUser = data.session.user;

        console.log(
            "Existing Supabase session found:",
            currentUser.id
        );

        const loaded = await loadPlayerFromDatabase(
            currentUser.id
        );

        if (!loaded) {
            console.warn(
                "Session exists, but player row was not found."
            );
        }

        return true;

    } catch (error) {

        console.error(
            "Error loading existing session:",
            error
        );

        return false;
    }
}


// ============================================================
// LOAD PLAYER FROM DATABASE
// ============================================================

async function loadPlayerFromDatabase(userId) {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("players")
            .select("id,user_id,name,highscore")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

        if (error) {

            console.error(
                "Error loading player:",
                error
            );

            return false;
        }

        if (!data) {

            console.warn(
                "No player row found for user:",
                userId
            );

            return false;
        }

        playerName = data.name || "";

        highScore =
            Number(data.highscore) || 0;

        saveLocalPlayer();

        console.log(
            "Player loaded:",
            playerName,
            "High score:",
            highScore
        );

        return true;

    } catch (error) {

        console.error(
            "Database player load exception:",
            error
        );

        return false;
    }
}


// ============================================================
// CREATE PLAYER ROW
// ============================================================

async function createPlayerRow(userId, username) {

    try {

        console.log(
            "Creating player row for:",
            userId,
            username
        );

        const {
            data,
            error
        } = await supabaseClient
            .from("players")
            .insert({
                user_id: userId,
                name: username,
                highscore: 0
            })
            .select()
            .single();

        if (error) {

            console.error(
                "Error creating player row:",
                error
            );

            return false;
        }

        console.log(
            "Player row created successfully:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "Player row creation exception:",
            error
        );

        return false;
    }
}


// ============================================================
// FIND PLAYER BY USER ID
// ============================================================

async function findPlayerByUserId(userId) {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("players")
            .select("id,user_id,name,highscore")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

        if (error) {

            console.error(
                "Error finding player:",
                error
            );

            return null;
        }

        return data;

    } catch (error) {

        console.error(
            "Find player exception:",
            error
        );

        return null;
    }
}


// ============================================================
// SAVE HIGH SCORE TO DATABASE
// ============================================================

async function saveHighScoreToDatabase() {

    if (!currentUser) {

        console.warn(
            "Cannot save high score: no authenticated user."
        );

        return false;
    }

    try {

        const {
            error
        } = await supabaseClient
            .from("players")
            .update({
                highscore: highScore
            })
            .eq("user_id", currentUser.id);

        if (error) {

            console.error(
                "Error saving high score:",
                error
            );

            return false;
        }

        console.log(
            "High score saved:",
            highScore
        );

        return true;

    } catch (error) {

        console.error(
            "High score save exception:",
            error
        );

        return false;
    }
}


// ============================================================
// ACCOUNT CREATION / LOGIN
// ============================================================

async function createOrLoginAccount() {

    clearAccountError();

    const username =
        playerNameInput.value.trim();

    const email =
        playerEmailInput.value.trim();

    const password =
        playerPasswordInput.value;


    // --------------------------------------------------------
    // USERNAME VALIDATION
    // --------------------------------------------------------

    if (username === "") {

        showAccountError(
            "PLEASE ENTER YOUR USERNAME"
        );

        playerNameInput.focus();

        return;
    }


    if (username.length < 2) {

        showAccountError(
            "USERNAME MUST HAVE AT LEAST 2 CHARACTERS"
        );

        playerNameInput.focus();

        return;
    }


    if (username.length > 16) {

        showAccountError(
            "USERNAME MUST BE 16 CHARACTERS OR LESS"
        );

        playerNameInput.focus();

        return;
    }


    const validUsername =
        /^[a-zA-Z0-9 _-]+$/;


    if (!validUsername.test(username)) {

        showAccountError(
            "USE LETTERS, NUMBERS, SPACES, _ OR - ONLY"
        );

        playerNameInput.focus();

        return;
    }


    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    if (email === "") {

        showAccountError(
            "PLEASE ENTER YOUR EMAIL"
        );

        playerEmailInput.focus();

        return;
    }


    if (!email.includes("@")) {

        showAccountError(
            "PLEASE ENTER A VALID EMAIL"
        );

        playerEmailInput.focus();

        return;
    }


    // --------------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------------

    if (password.length < 6) {

        showAccountError(
            "PASSWORD MUST HAVE AT LEAST 6 CHARACTERS"
        );

        playerPasswordInput.focus();

        return;
    }


    nameButton.disabled = true;
    nameButton.textContent = "PLEASE WAIT...";


    try {

        // ====================================================
        // FIRST TRY LOGIN
        // ====================================================

        console.log(
            "Trying to sign in existing account..."
        );

        const {
            data: loginData,
            error: loginError
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        if (!loginError && loginData.user) {

            currentUser =
                loginData.user;

            console.log(
                "Login successful:",
                currentUser.id
            );

            const player =
                await findPlayerByUserId(
                    currentUser.id
                );

            if (player) {

                playerName =
                    player.name;

                highScore =
                    Number(player.highscore) || 0;

                saveLocalPlayer();

                showLobby();

                return;
            }


            // ------------------------------------------------
            // Auth account exists but player row doesn't.
            // Create it using the CORRECT user_id.
            // ------------------------------------------------

            const created =
                await createPlayerRow(
                    currentUser.id,
                    username
                );

            if (!created) {

                showAccountError(
                    "ACCOUNT LOGIN WORKED, BUT PLAYER DATA COULD NOT BE CREATED."
                );

                return;
            }

            playerName =
                username;

            highScore = 0;

            saveLocalPlayer();

            showLobby();

            return;
        }


        // ====================================================
        // LOGIN FAILED
        // ====================================================

        console.log(
            "Login failed. Trying account creation..."
        );


        // ====================================================
        // CREATE NEW AUTH ACCOUNT
        // ====================================================

        const {
            data: signupData,
            error: signupError
        } = await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {
                    username: username
                }

            }

        });


        if (signupError) {

            console.error(
                "Supabase signup error:",
                signupError
            );


            if (
                signupError.message
                    .toLowerCase()
                    .includes("rate limit")
            ) {

                showAccountError(
                    "TOO MANY SIGNUP ATTEMPTS. PLEASE WAIT A FEW MINUTES AND TRY AGAIN."
                );

            } else if (
                signupError.message
                    .toLowerCase()
                    .includes("already registered")
            ) {

                showAccountError(
                    "THIS EMAIL ALREADY HAS AN ACCOUNT. USE THE CORRECT PASSWORD."
                );

            } else {

                showAccountError(
                    signupError.message ||
                    "COULD NOT CREATE ACCOUNT."
                );
            }

            return;
        }


        if (
            !signupData ||
            !signupData.user
        ) {

            showAccountError(
                "ACCOUNT CREATION FAILED."
            );

            return;
        }


        currentUser =
            signupData.user;


        console.log(
            "New Auth account created:",
            currentUser.id
        );


        // ====================================================
        // IMPORTANT:
        // Because Confirm Email is OFF, a session should
        // normally exist immediately.
        // ====================================================

        if (!signupData.session) {

            const {
                data: sessionData
            } =
                await supabaseClient.auth.getSession();

            if (
                sessionData &&
                sessionData.session
            ) {

                currentUser =
                    sessionData.session.user;
            }
        }


        // ====================================================
        // CREATE PLAYER ROW
        // ====================================================

        const playerCreated =
            await createPlayerRow(
                currentUser.id,
                username
            );


        if (!playerCreated) {

            showAccountError(
                "ACCOUNT CREATED, BUT PLAYER DATA COULD NOT BE SAVED."
            );

            return;
        }


        playerName =
            username;

        highScore = 0;

        saveLocalPlayer();

        showLobby();

    } catch (error) {

        console.error(
            "Account operation error:",
            error
        );

        showAccountError(
            error.message ||
            "SOMETHING WENT WRONG. PLEASE TRY AGAIN."
        );

    } finally {

        nameButton.disabled = false;

        nameButton.textContent =
            "CONTINUE";
    }
}


// ============================================================
// SHOW LOBBY
// ============================================================

function showLobby() {

    welcomeText.textContent =
        playerName;

    gamePlayerName.textContent =
        playerName;


    if (highScore > 0) {

        welcomeLabel.textContent =
            "WELCOME BACK";

        savedHighScore.textContent =
            "HIGH SCORE: " + highScore;

    } else {

        welcomeLabel.textContent =
            "WELCOME";

        savedHighScore.textContent =
            "HIGH SCORE: 0";
    }


    showScreen(lobbyScreen);
}


// ============================================================
// BEGIN
// ============================================================

if (startIntroButton) {

    startIntroButton.onclick = async function () {

        startIntroButton.disabled = true;

        const loggedIn =
            await loadExistingSession();


        if (loggedIn && playerName) {

            showLobby();

        } else {

            showScreen(nameScreen);

            setTimeout(function () {

                playerNameInput.focus();

            }, 100);
        }


        startIntroButton.disabled = false;
    };
}


// ============================================================
// CONTINUE
// ============================================================

if (nameButton) {

    nameButton.onclick = function () {

        createOrLoginAccount();

    };
}


// ============================================================
// ENTER KEY
// ============================================================

[
    playerNameInput,
    playerEmailInput,
    playerPasswordInput
].forEach(function (input) {

    if (!input) {
        return;
    }

    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                createOrLoginAccount();
            }
        }
    );
});


// ============================================================
// PLAY
// ============================================================

if (playButton) {

    playButton.onclick = function () {

        startGame();

    };
}


// ============================================================
// RETRY
// ============================================================

if (retryButton) {

    retryButton.onclick = function () {

        startGame();

    };
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
// CHARACTER SPRITE
// ============================================================

const playerSprite =
    new Image();

playerSprite.src =
    "assets/character-run.png";

let spriteLoaded = false;


playerSprite.onload =
    function () {

        spriteLoaded = true;

    };


playerSprite.onerror =
    function () {

        console.warn(
            "character-run.png could not be loaded."
        );

    };


const FRAME_COUNT = 8;

const SPRITE_SOURCE_Y = 280;

const SPRITE_SOURCE_HEIGHT = 350;


// ============================================================
// OBSTACLES
// ============================================================

let obstacles = [];

let distanceToNextObstacle = 0;


// ============================================================
// RANDOM DISTANCE
// ============================================================

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

    if (!playerName) {

        showScreen(nameScreen);

        return;
    }


    if (gameAnimationId !== null) {

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


    gamePlayerName.textContent =
        playerName;


    scoreElement.textContent =
        "0";


    showScreen(gameScreen);


    lastTime =
        performance.now();


    gameAnimationId =
        requestAnimationFrame(gameLoop);
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


    currentSpeed =
        Math.min(
            MAX_SPEED,
            BASE_SPEED +
            elapsedTime *
            SPEED_INCREASE
        );


    score =
        Math.floor(
            elapsedTime *
            currentSpeed /
            10
        );


    scoreElement.textContent =
        score;


    updatePlayer(deltaTime);

    updateObstacles(deltaTime);

    updateSprite(deltaTime);

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


    if (!player.grounded) {
        return;
    }


    player.velocityY =
        player.jumpPower;


    player.grounded = false;
}


// ============================================================
// KEYBOARD
// ============================================================

window.addEventListener(
    "keydown",
    function (event) {

        if (
            document.activeElement ===
            playerNameInput ||
            document.activeElement ===
            playerEmailInput ||
            document.activeElement ===
            playerPasswordInput
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
// TOUCH
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
// SPRITE
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
// COLLISION
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

async function gameOver() {

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


    const oldHighScore =
        highScore;


    const isNewHighScore =
        score > oldHighScore;


    if (isNewHighScore) {

        highScore =
            score;

        saveLocalPlayer();

        await saveHighScoreToDatabase();
    }


    resultScore.textContent =
        score;


    resultHighScore.textContent =
        "HIGH SCORE: " +
        highScore;


    resultPanel.classList.toggle(
        "new-record",
        isNewHighScore
    );


    showScreen(
        surpriseScreen
    );
}


// ============================================================
// DRAW GAME
// ============================================================

function drawGame() {

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

    const roadHeight = 105;

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


    const markWidth = 55;

    const gap = 90;


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
// OBSTACLES DRAW
// ============================================================

function drawObstacles() {

    obstacles.forEach(
        function (obstacle) {

            ctx.fillStyle =
                "rgba(0,0,0,0.45)";


            ctx.fillRect(

                obstacle.x + 6,

                obstacle.y +
                obstacle.height,

                obstacle.width,

                7
            );


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


            ctx.strokeStyle =
                "rgba(195,165,235,0.65)";


            ctx.lineWidth = 1;


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
// PLAYER DRAW
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
// RESIZE
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

showScreen(introScreen);

console.log(
    "Anime Runner loaded successfully."
);