const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src = 'pics/Cannon.png';

const bulletImg = new Image();
bulletImg.src = 'pics/Bullet.png';

const enemyImg = new Image();
enemyImg.src = 'pics/Enemy_green.png';

const enemyImgR = new Image();
enemyImgR.src = 'pics/Enemy_red.png';

let lastFiredTime = Date.now(); // 前回の弾の発射時刻を記録
let players = [];
let bullets = [];
let score = 0; // スコアの初期値
const playerWidth = 50;
const playerHeight = 50;
const playerCount = 5;
const playerSpacing = 100; // プレイヤー間のスペース
let selectedPlayerIndex = 0;
const playerScaleFactor = 1.5; // プレイヤーの大きさを変更する係数
const bulletCooldown = 1000; // 弾の射出間隔（ミリ秒）

let gameStarted = false;

for (let i = 0; i < playerCount; i++) {
    let player = {
        x: (canvas.width / 2) - (playerCount * playerSpacing / 2) + i * playerSpacing,
        y: canvas.height - 50,
        width: playerWidth,
        height: playerHeight
    };
    players.push(player);
}

let enemies = [];
let isGameOver = false; // ゲームオーバーフラグ

const createEnemies = () => {
    for (let c = 0; c < enemyColCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            let enemy = {
                x: c * (enemyWidth + enemyPadding) + enemyOffsetLeft,
                y: r * (enemyHeight + enemyPadding) + enemyOffsetTop,
                width: enemyWidth,
                height: enemyHeight,
                hits: 0,
                color: '#00FF00'
            };
            enemies.push(enemy);
        }
    }
};

const resetGame = () => {
    isGameOver = false;
    score = 0;
    enemies = [];
    createEnemies();
};

const enemyRowCount = 3;
const enemyColCount = 6;
const enemyWidth = 50;
const enemyHeight = 50;
const enemyPadding = 10; // 敵間の余白
const enemyOffsetTop = 30;
const enemyOffsetLeft = 30;
let enemySpeed = 1; // 敵の移動速度


for (let c = 0; c < enemyColCount; c++) {
    for (let r = 0; r < enemyRowCount; r++) {
        let enemy = {
            x: c * (enemyWidth + enemyPadding) + enemyOffsetLeft,
            y: r * (enemyHeight + enemyPadding) + enemyOffsetTop,
            width: enemyWidth,
            height: enemyHeight,
            hits: 0,
            color: '#00FF00'
        };
        enemies.push(enemy);
    }
}

// キーボードイベントのリスン
document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
        selectedPlayerIndex = Math.max(0, selectedPlayerIndex - 1);
    } else if (event.key === 'ArrowRight') {
        selectedPlayerIndex = Math.min(playerCount - 1, selectedPlayerIndex + 1);
    } else if (event.key === ' ') {
        event.preventDefault(); // デフォルトのスクロール動作を防止する
        const currentTime = Date.now();
        if (currentTime - lastFiredTime > bulletCooldown) {
            fireBullet(players[selectedPlayerIndex]);
            lastFiredTime = currentTime;
        }
    }
});

function fireBullet(player) {
    let bullet = {
        x: player.x + player.width / 2 - 5, // 弾の位置を調整
        y: player.y - 10,
        width: 10,
        height: 10,
        speed: 5 // 弾の速度
    };
    bullets.push(bullet);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 10, 30); // スコアの表示

    players.forEach((player, index) => {
        let scaleFactor = index === selectedPlayerIndex ? playerScaleFactor : 1;
        let drawWidth = player.width * scaleFactor;
        let drawHeight = player.height * scaleFactor;
        let drawX = player.x - (drawWidth - player.width) / 2;
        let drawY = player.y - (drawHeight - player.height) / 2;
        ctx.drawImage(playerImg, drawX, drawY, drawWidth, drawHeight);
    });
    bullets.forEach((bullet) => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });
    enemies.forEach((enemy, enemyIndex) => {
        if (enemy.hits === 1) {
            ctx.drawImage(enemyImgR, enemy.x, enemy.y, enemy.width, enemy.height);
        } else if (enemy.hits < 1) {
            ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
        }
        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1); // 弾を削除
                enemy.hits += 1;
                if (enemy.hits >= 2) {
                    enemies.splice(enemyIndex, 1); // 敵を削除
                    score += 10; // スコアを更新
                } else if (enemy.hits === 1) {
                    score += 5;
                }
            }
        });
    });
    if (enemies.length === 0 && isGameOver) {
        ctx.fillStyle = "#000000";
        ctx.font = "30px Arial";
        ctx.fillText("Game Clear!", canvas.width / 2 - 80, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Press 'R' to restart", canvas.width / 2 - 80, canvas.height / 2 + 30);
    };
}

function update() {
    let isReversed = false;
    // 敵の位置を更新
    enemies.forEach((enemy) => {
        enemy.x += enemySpeed;
        // もし画面端に到達したら反転させる
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
            isReversed = true;
        }
    });

    if (isReversed) {
        enemies.forEach((enemy) => {
            enemy.y += 10; // 画面下に移動させる
        });
        enemySpeed = -enemySpeed; // 速度を反転させる
    }

    // 弾の位置を更新
    bullets.forEach((bullet) => {
        bullet.y -= bullet.speed;
    });
    // 画面外に出た弾を削除
    bullets = bullets.filter((bullet) => bullet.y > 0);

    if (enemies.length === 0 && !isGameOver) {
        isGameOver = true;
    }

    if (isGameOver) {
        document.addEventListener('keydown', function (event) {
            if (event.key === 'r' || event.key === 'R') {
                resetGame();
            }
        });
    }
}


// 既存のコードからの変更部分
function drawStartScreen() {
    ctx.fillStyle = "#000000";
    ctx.font = "30px Arial";
    ctx.fillText("Press any key to start", canvas.width / 2 - 150, canvas.height / 2);
}

function startGame(event) {
    if (!gameStarted) {
        if (event.code.includes("Key")) {
            gameStarted = true;
            window.removeEventListener('keydown', startGame);
        }
    }
}

window.addEventListener('keydown', startGame);

function gameLoop() {
    if (!gameStarted) {
        drawStartScreen();
    } else {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
