var game = (function() {

    var module = {};

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
        gameLost = false,
        gameWon = false,
        shipStartingX = 3000,
        shipStartingY = 6000,
        onCompleted,
        onDied;

    /**
     * Initialize
     */
    module.init = function(callback) {

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
        sfx.loadSounds(function() {
            callback();
        });

        window.requestAnimationFrame(tick);
    };

    module.onCompleted = function(fn) {
        onCompleted = fn;
    };

    module.onDied = function(fn) {
        onDied = fn;
    };

    module.start = function() {
        gameStarted = true;

        display.showAll();

        sfx.sounds.ship.play(ship.x, ship.y);

        setTimeout(track.start, 1000);

        registerEventHandlers();
        hideCursor();
    };

    module.pause = function() {
        gamePaused = true;
        display.showPausedMessage();
        track.stop();
        sfx.setGain(0);
        showCursor();
    };

    module.resume = function() {
        gamePaused = false;
        display.hidePausedMessage();
        track.start();
        sfx.setGain(1);
        hideCursor();
        requestAnimationFrame(tick);
    };

    module.state = function() {
        var status;

        if (gameWon) {
            status = 'won';
        } else if (gameLost) {
            status = 'lost';
        } else if (!gameStarted) {
            status = 'initialized';
        } else {
            if (gamePaused) {
                status = 'paused';
            } else {
                status = 'running';
            }
        }

        return status;
    };

    module.getScoreCardInfo = function() {
        return {
            score: Math.round(score).toLocaleString(),
            stage: levelPlayer.getCurrentStage()
        };
    };

    /**
     * Game loop
     */
    function tick(timestamp) {
        var event;

        if (!gameStarted) {
            ship.x = shipStartingX;
            ship.y = shipStartingY;
        }

        if (gameStarted && !gameLost) {
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

            alienFactory.spawn(event);
            display.update(event, shotFactory.firepower(), score);

            doSfx();

        }


        ship.updatePosition(timestamp);
        track.update(ship);
        shotFactory.updatePositions(ship, timestamp);
        alienFactory.updatePositions(ship, timestamp);
        collisionDetector.check(shotFactory.shots(), alienFactory.aliens());

        checkForGameOver(event, lives);

        if (!gamePaused) {
            window.requestAnimationFrame(tick);
        }
    }

    function doSfx() {
        sfx.sounds.ship.setParameters(ship.x, ship.y, ship.vx, ship.vy);

        // randomly make alien noises
        if (Math.random() < 0.001) {
            var aliens = alienFactory.aliens();
            if (0 < aliens.length) {
                var alien = aliens[Math.floor(Math.random() * aliens.length)];
                sfx.sounds.alien.play(alien.x, alien.y, alien.z);
            }
        }
        // update alien drone noises and add the sfx if not already there
        alienFactory.aliens().forEach(function(alien) {
            if (typeof alien.sound === 'undefined') {
                alien.sound = sfx.sounds.alienDrone.create();
            }
            sfx.sounds.alienDrone.setParameters(alien.sound, alien, ship);
        })
    }

    function checkForGameOver(event, lives) {
        if (event && event.type === 'completed') {
            if (!gameWon) {
                onCompleted();
                gameWon = true;
            }
        }
        if (lives === 0) {
            if (!gameLost) {
                onDied();
                gameLost = true;
            }
        }
    }

    function hideCursor() {
        document.body.style.cursor = 'none';
    }
    function showCursor() {
        document.body.style.cursor = 'inherit';
    }

    function registerEventHandlers() {
        /**
         * Event handlers
         */
        document.addEventListener('keydown', function (e) {
            var keyCode = e.which;
            if (keysDown.indexOf(keyCode) === -1) {
                keysDown.push(keyCode);
                if (keyCode === 65) {
                    alienFactory.spawn();
                }
            }
        });
        document.addEventListener('keyup', function (e) {
            var keyCode = e.which;
            keysDown.splice(keysDown.indexOf(keyCode), 1);
        });

        document.addEventListener('hit', function (e) {
            var position = e.detail;
            score += 100 * shotFactory.firepower();
            levelPlayer.alienRemoved();
            sfx.sounds.explosion.play(position.x, position.y, position.z);
        });

        document.addEventListener('shot', function (e) {
            sfx.sounds.gun.play(ship, e.detail.firepower);
        });

        document.addEventListener('miss', function (e) {
            if (0 < lives) {
                lives--;
                display.updateLives(lives);
                sfx.sounds.alarm.play();
            }
            levelPlayer.alienRemoved();
        });
    }

    return module;

})();