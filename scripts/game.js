/**
 * Initialize
 */
var ship = new Ship(
    document.querySelector('.ship-container'),
    document.documentElement.clientWidth,
    document.documentElement.clientHeight);
var track = new Track(document.querySelector('.midground'));
var hit, missedAlienCount, score = 0;
var keysDown = [];

display.setAnnouncerElement(document.querySelector('.announcement'));
display.setFirepowerElement(document.querySelector('.firepower-meter-container'));
display.setScoreElement(document.querySelector('.score'));
shotFactory.setTemplate(document.querySelector('.shot'));
alienFactory.setTemplate(document.querySelector('.alien-container'));
levelPlayer.setLevel(levelData);

/**
 * Game loop
 */
function tick(timestamp) {
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
            shotFactory.create(ship.x, ship.y);
        }
    }

    var event = levelPlayer.getEvents(timestamp);

    ship.updatePosition(timestamp);
    track.update(ship);
    shotFactory.updatePositions(ship, timestamp);
    alienFactory.spawn(event);
    missedAlienCount = alienFactory.updatePositions(ship, timestamp);
    hit = collisionDetector.check(shotFactory.shots(), alienFactory.aliens());



    display.update(event, shotFactory.firepower(), score);

    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);

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
});

document.addEventListener('miss', function(e) {
    score += e.detail;
});