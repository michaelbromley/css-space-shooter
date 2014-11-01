/**
 * Globals
 */
var ship,
    track,
    hit,
    score = 0,
    lives = 3,
    keysDown = [],
    gameStarted = false,
    gamePaused = false,
    shipStartingX = 3000,
    shipStartingY = 6000,
    sfxGun,
    sfxShip;

/**
 * Initialize
 */
function init() {
    ship = new Ship(document.querySelector('.ship-container'),
        document.documentElement.clientWidth,
        document.documentElement.clientHeight);
    ship.y = shipStartingY;
    ship.x = shipStartingX;
    track = new Track(document.querySelector('.midground'));

    display.setAnnouncerElement(document.querySelector('.announcement'));
    display.setFirepowerElement(document.querySelector('.firepower-meter-container'));
    display.setScoreElement(document.querySelector('.score'));
    display.setLivesElement(document.querySelector('.lives-container'));
    shotFactory.setTemplate(document.querySelector('.shot'));
    alienFactory.setTemplate(document.querySelector('.alien-container'));
    levelPlayer.setLevel(levelData);

    // set up the audio
    sfxGun = new Sound( "assets/sfx/gun.mp3" );
    sfxGun.setVolume(0.5);
    sfxShip = new Sound( "assets/sfx/ship_drone.mp3", true);
    Sound.setListener( sfxListener );
    Sound.load();

    window.requestAnimationFrame(tick);
}

function sfxListener(sound, state) {

}

function start() {
    gameStarted = true;

    display.showAll();

    sfxShip.play();

    setInterval(setSfxShipPan, 100);

    setTimeout(track.show, 3000);
}

/**
 * Game loop
 */
function tick(timestamp) {
    var event;

    if (gameStarted) {
        if (0 < keysDown.length) {
            if (keysDown.indexOf(39) !== -1) {
                ship.moveLeft();
            }
            if (keysDown.indexOf(37) !== -1) {
                ship.moveRight();
            }
            if (keysDown.indexOf(38) !== -1) {
                ship.moveUp();
            }
            if (keysDown.indexOf(40) !== -1) {
                ship.moveDown();
            }
            if (keysDown.indexOf(32) !== -1) {
                shotFactory.create(ship);
            }
        }

        event = levelPlayer.getEvents(timestamp);

        if (lives === 0) {
            event = { type: 'announcement', data: { title: 'You Died!', subtitle: 'Better luck next time!!!!'}};
        }

        alienFactory.spawn(event);
        display.update(event, shotFactory.firepower(), score);


    } else {
        ship.x = shipStartingX;
        ship.y = shipStartingY;
    }


    ship.updatePosition(timestamp);
    track.update(ship);
    shotFactory.updatePositions(ship, timestamp);
    alienFactory.updatePositions(ship, timestamp);
    collisionDetector.check(shotFactory.shots(), alienFactory.aliens());

    window.requestAnimationFrame(tick);
}

function setSfxShipPan() {
    var pan = (ship.x / document.documentElement.clientWidth) * 2;
    pan = Math.max(Math.min(pan, 1), -1);
    console.log('ship pan: ' + pan);
    sfxShip.setPan(pan)
}

/**
 * Event handlers
 */
document.addEventListener('keydown', function(e) {
    var keyCode = e.which;
    if (keysDown.indexOf(keyCode) === -1) {
        keysDown.push(keyCode);
        if (keyCode === 65) {
            alienFactory.spawn();
        }
    }
});
document.addEventListener('keyup', function(e) {
    var keyCode = e.which;
    keysDown.splice(keysDown.indexOf(keyCode), 1);
});

document.addEventListener('hit', function(e) {
    score += e.detail * shotFactory.firepower();
    levelPlayer.alienRemoved();
});

document.addEventListener('shot', function(e) {
    var windowWidth = document.documentElement.clientWidth;
    var pan = e.detail.x / windowWidth;
    sfxGun.play();
    sfxGun.setPan(pan);
});

document.addEventListener('miss', function(e) {
    if (0 < lives) {
        lives--;
        display.updateLives(lives);
    }
    levelPlayer.alienRemoved();
});