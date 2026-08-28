// ============================================================
// ANIME RUNNER - AUTHENTICATION + GAME
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

let supabaseClient = null;

if (
    typeof window.SUPABASE_URL === "string" &&
    typeof window.SUPABASE_KEY === "string" &&
    window.SUPABASE_URL &&
    window.SUPABASE_KEY &&
    typeof window.supabase !== "undefined"
) {

    try {

        supabaseClient =
            window.supabase.createClient(
                window.SUPABASE_URL,
                window.SUPABASE_KEY
            );

        console.log(
            "Supabase client initialized."
        );

    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );
    }

} else {

    console.error(
        "Supabase configuration is missing."
    );
}


// ============================================================
// ELEMENTS
// ============================================================

const introScreen =
    document.getElementById("introScreen");

const nameScreen =
    document.getElementById("nameScreen");

const lobbyScreen =
    document.getElementById("lobbyScreen");

const gameScreen =
    document.getElementById("gameScreen");

const surpriseScreen =
    document.getElementById("surpriseScreen");


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

const playerEmailInput =
    document.getElementById("playerEmail");

const playerPasswordInput =
    document.getElementById("playerPassword");

const nameError =
    document.getElementById("nameError");


const welcomeText =
    document.getElementById("welcomeText");

const welcomeLabel =
    document.getElementById("welcomeLabel");

const savedHighScore =
    document.getElementById("savedHighScore");


const gamePlayerName =
    document.getElementById("gamePlayerName");

const scoreElement =
    document.getElementById("score");


const resultPanel =
    document.getElementById("resultPanel");

const resultScore =
    document.getElementById("resultScore");

const resultHighScore =
    document.getElementById("resultHighScore");


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================================
// ACCOUNT DATA
// ============================================================

let playerName = "";

let highScore = 0;

let playerId = null;

let currentUser = null;


// ============================================================
// SCREEN
// ============================================================

function showScreen(screen) {

    document.querySelectorAll(
        ".screen"
    ).forEach(
        function (element) {

            element.classList.remove(
                "active"
            );

        }
    );


    if (screen) {

        screen.classList.add(
            "active"
        );
    }
}


// ============================================================
// GET CURRENT SESSION
// ============================================================

async function getCurrentSession() {

    if (!supabaseClient) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return null;
        }


        return data.session || null;

    } catch (error) {

        console.error(
            "Unexpected session error:",
            error
        );

        return null;
    }
}


// ============================================================
// GET PLAYER ROW
// ============================================================

async function getPlayerForUser(userId) {

    if (
        !supabaseClient ||
        !userId
    ) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("players")
                .select(
                    "id,name,highscore,user_id"
                )
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "========== PLAYER LOAD ERROR =========="
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Details:",
                error.details
            );

            console.error(
                "Hint:",
                error.hint
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "========================================"
            );

            return null;
        }


        return data || null;

    } catch (error) {

        console.error(
            "Unexpected player load error:",
            error
        );

        return null;
    }
}


// ============================================================
// CREATE PLAYER ROW
// ============================================================

async function createPlayerRow(
    userId,
    username
) {

    if (
        !supabaseClient ||
        !userId
    ) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("players")
                .insert({

                    user_id:
                        userId,

                    name:
                        username,

                    highscore:
                        0

                })
                .select(
                    "id,name,highscore,user_id"
                )
                .single();


        if (error) {

            console.error(
                "========== PLAYER CREATE ERROR =========="
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Details:",
                error.details
            );

            console.error(
                "Hint:",
                error.hint
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "=========================================="
            );

            return null;
        }


        return data || null;

    } catch (error) {

        console.error(
            "Unexpected player creation error:",
            error
        );

        return null;
    }
}


// ============================================================
// LOAD PLAYER DATA
// ============================================================

async function loadPlayerData() {

    const session =
        await getCurrentSession();


    if (!session) {

        return false;
    }


    currentUser =
        session.user;


    const player =
        await getPlayerForUser(
            currentUser.id
        );


    if (!player) {

        console.warn(
            "Authenticated user has no player row yet."
        );

        return false;
    }


    playerId =
        player.id;


    playerName =
        player.name;


    highScore =
        Number(
            player.highscore
        ) || 0;


    return true;
}


// ============================================================
// UPDATE HIGH SCORE
// ============================================================

async function updateHighScoreInDatabase(
    newScore
) {

    if (
        !supabaseClient ||
        !playerId
    ) {

        console.error(
            "Cannot update high score."
        );

        return false;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("players")
                .update({

                    highscore:
                        newScore

                })
                .eq(
                    "id",
                    playerId
                );


        if (error) {

            console.error(
                "========== HIGH SCORE UPDATE ERROR =========="
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Details:",
                error.details
            );

            console.error(
                "Hint:",
                error.hint
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "============================================="
            );

            return false;
        }


        console.log(
            "High score saved:",
            newScore
        );


        return true;

    } catch (error) {

        console.error(
            "Unexpected high score error:",
            error
        );

        return false;
    }
}


// ============================================================
// REGISTER NEW ACCOUNT
// ============================================================

async function registerNewAccount(
    username,
    email,
    password
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email:
                    email,

                password:
                    password

            });


        if (error) {

            console.error(
                "Signup error:",
                error
            );

            nameError.textContent =
                error.message;

            return false;
        }


        if (!data.user) {

            nameError.textContent =
                "ACCOUNT COULD NOT BE CREATED.";

            return false;
        }


        currentUser =
            data.user;


        /*
         * If email confirmation is required,
         * session may be null here.
         */

        if (!data.session) {

            nameError.textContent =
                "CHECK YOUR EMAIL TO CONFIRM YOUR ACCOUNT, THEN LOG IN.";

            return false;
        }


        const newPlayer =
            await createPlayerRow(
                data.user.id,
                username
            );


        if (!newPlayer) {

            nameError.textContent =
                "ACCOUNT CREATED, BUT PLAYER DATA COULD NOT BE SAVED.";

            return false;
        }


        playerId =
            newPlayer.id;


        playerName =
            newPlayer.name;


        highScore =
            Number(
                newPlayer.highscore
            ) || 0;


        return true;

    } catch (error) {

        console.error(
            "Unexpected signup error:",
            error
        );

        nameError.textContent =
            "ACCOUNT CREATION FAILED.";

        return false;
    }
}


// ============================================================
// LOGIN EXISTING ACCOUNT
// ============================================================

async function loginExistingAccount(
    email,
    password,
    username
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email:
                    email,

                password:
                    password

            });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            nameError.textContent =
                "WRONG EMAIL OR PASSWORD.";

            return false;
        }


        if (!data.user) {

            nameError.textContent =
                "LOGIN FAILED.";

            return false;
        }


        currentUser =
            data.user;


        let player =
            await getPlayerForUser(
                data.user.id
            );


        /*
         * If the authenticated account doesn't
         * have a player row yet, create one.
         */

        if (!player) {

            player =
                await createPlayerRow(
                    data.user.id,
                    username
                );
        }


        if (!player) {

            nameError.textContent =
                "PLAYER DATA COULD NOT BE LOADED.";

            return false;
        }


        playerId =
            player.id;


        playerName =
            player.name;


        highScore =
            Number(
                player.highscore
            ) || 0;


        return true;

    } catch (error) {

        console.error(
            "Unexpected login error:",
            error
        );

        nameError.textContent =
            "LOGIN FAILED.";

        return false;
    }
}


// ============================================================
// CONTINUE / ACCOUNT BUTTON
// ============================================================

async function registerPlayer() {

    if (
        !supabaseClient
    ) {

        nameError.textContent =
            "DATABASE CONNECTION FAILED.";

        return;
    }


    const username =
        playerNameInput.value.trim();


    const email =
        playerEmailInput.value.trim();


    const password =
        playerPasswordInput.value;


    // --------------------------------------------------------
    // USERNAME
    // --------------------------------------------------------

    if (username === "") {

        nameError.textContent =
            "PLEASE ENTER YOUR USERNAME.";

        playerNameInput.focus();

        return;
    }


    if (username.length < 2) {

        nameError.textContent =
            "USERNAME MUST HAVE AT LEAST 2 CHARACTERS.";

        playerNameInput.focus();

        return;
    }


    if (username.length > 16) {

        nameError.textContent =
            "USERNAME MUST BE 16 CHARACTERS OR LESS.";

        playerNameInput.focus();

        return;
    }


    const validName =
        /^[a-zA-Z0-9 _-]+$/;


    if (!validName.test(username)) {

        nameError.textContent =
            "USE LETTERS, NUMBERS, SPACES, _ OR - ONLY.";

        playerNameInput.focus();

        return;
    }


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if (email === "") {

        nameError.textContent =
            "PLEASE ENTER YOUR EMAIL.";

        playerEmailInput.focus();

        return;
    }


    // --------------------------------------------------------
    // PASSWORD
    // --------------------------------------------------------

    if (password.length < 6) {

        nameError.textContent =
            "PASSWORD MUST HAVE AT LEAST 6 CHARACTERS.";

        playerPasswordInput.focus();

        return;
    }


    nameButton.disabled =
        true;


    nameButton.textContent =
        "CONNECTING...";


    nameError.textContent =
        "";


    /*
     * Check whether this email already has
     * an account.
     *
     * Supabase does not allow us to directly
     * search Auth users from the browser.
     *
     * We therefore try login first.
     */

    const loginResult =
        await loginExistingAccount(
            email,
            password,
            username
        );


    if (loginResult) {

        nameButton.disabled =
            false;

        nameButton.textContent =
            "CONTINUE";


        showLobby();

        return;
    }


    /*
     * Login failed.
     *
     * Try creating a new account.
     */

    nameError.textContent =
        "CREATING ACCOUNT...";


    const signupResult =
        await registerNewAccount(
            username,
            email,
            password
        );


    nameButton.disabled =
        false;


    nameButton.textContent =
        "CONTINUE";


    if (!signupResult) {

        return;
    }


    showLobby();
}


// ============================================================
// BEGIN BUTTON
// ============================================================

if (startIntroButton) {

    startIntroButton.onclick =
        async function () {

            startIntroButton.disabled =
                true;


            /*
             * First check whether this device
             * already has a Supabase session.
             */

            const loaded =
                await loadPlayerData();


            startIntroButton.disabled =
                false;


            if (loaded) {

                /*
                 * Existing session:
                 *
                 * No password required.
                 */

                showLobby();

                return;
            }


            /*
             * No session:
             * show login/account screen.
             */

            playerNameInput.value =
                "";


            playerEmailInput.value =
                "";


            playerPasswordInput.value =
                "";


            nameError.textContent =
                "";


            showScreen(
                nameScreen
            );


            setTimeout(
                function () {

                    playerNameInput.focus();

                },
                100
            );
        };
}


// ============================================================
// CONTINUE BUTTON
// ============================================================

if (nameButton) {

    nameButton.onclick =
        function () {

            registerPlayer();

        };
}


// ============================================================
// ENTER KEY
// ============================================================

if (playerPasswordInput) {

    playerPasswordInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                registerPlayer();
            }
        }
    );
}


// ============================================================
// PLAY BUTTON
// ============================================================

if (playButton) {

    playButton.onclick =
        function () {

            startGame();

        };
}


// ============================================================
// RETRY BUTTON
// ============================================================

if (retryButton) {

    retryButton.onclick =
        function () {

            startGame();

        };
}


// ============================================================
// GAME VARIABLES
// ============================================================

let gameRunning =
    false;

let gameAnimationId =
    null;

let lastTime =
    0;

let elapsedTime =
    0;

let score =
    0;

let groundY =
    0;

let currentSpeed =
    360;


const BASE_SPEED =
    360;

const MAX_SPEED =
    620;

const SPEED_INCREASE =
    3.2;


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


let spriteLoaded =
    false;


playerSprite.onload =
    function () {

        spriteLoaded =
            true;
    };


playerSprite.onerror =
    function () {

        console.warn(
            "character-run.png could not be loaded."
        );
    };


const FRAME_COUNT =
    8;

const SPRITE_SOURCE_Y =
    280;

const SPRITE_SOURCE_HEIGHT =
    350;


// ============================================================
// OBSTACLES
// ============================================================

let obstacles =
    [];

let distanceToNextObstacle =
    0;


// ============================================================
// RANDOM OBSTACLE DISTANCE
// ============================================================

function randomObstacleDistance() {

    return (
        420 +
        Math.random() *
        520
    );
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    if (!playerName) {

        showScreen(
            nameScreen
        );

        return;
    }


    if (
        gameAnimationId !== null
    ) {

        cancelAnimationFrame(
            gameAnimationId
        );

        gameAnimationId =
            null;
    }


    gameRunning =
        true;


    elapsedTime =
        0;


    score =
        0;


    currentSpeed =
        BASE_SPEED;


    obstacles =
        [];


    distanceToNextObstacle =
        randomObstacleDistance();


    player.frame =
        0;


    player.frameTimer =
        0;


    player.velocityY =
        0;


    player.grounded =
        true;


    resizeCanvas();


    groundY =
        window.innerHeight -
        105;


    player.y =
        groundY -
        player.height;


    gamePlayerName.textContent =
        playerName;


    scoreElement.textContent =
        "0";


    showScreen(
        gameScreen
    );


    lastTime =
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
            (
                currentTime -
                lastTime
            ) / 1000,
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
        window.innerHeight -
        105;


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
// POINTER / TOUCH
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

        player.frameTimer =
            0;


        player.frame =
            (
                player.frame +
                1
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
        Math.random() *
        20;


    const height =
        50 +
        Math.random() *
        30;


    obstacles.push({

        x:
            window.innerWidth +
            40,

        y:
            groundY -
            height,

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
// COLLISION
// ============================================================

function checkCollisions() {

    const playerBox = {

        x:
            player.x +
            29,

        y:
            player.y +
            28,

        width:
            player.width -
            58,

        height:
            player.height -
            34
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


    const oldHighScore =
        highScore;


    const isNewHighScore =
        score >
        oldHighScore;


    if (isNewHighScore) {

        highScore =
            score;


        /*
         * Save to Supabase.
         *
         * RLS ensures this update can only
         * affect the logged-in user's row.
         */

        updateHighScoreInDatabase(
            highScore
        );
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
        x +=
            markWidth +
            gap
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
// OBSTACLES
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
// AUTH STATE LISTENER
// ============================================================

if (supabaseClient) {

    supabaseClient.auth.onAuthStateChange(
        function (
            event,
            session
        ) {

            console.log(
                "Auth event:",
                event
            );


            if (session) {

                currentUser =
                    session.user;
            }
        }
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

resizeCanvas();

showScreen(
    introScreen
);
```
