/**
 * ALien class.
 *
 * @param el
 * @param x
 * @param y
 * @param config
 * @constructor
 */
function Alien(el, x, y, config) {
    var self = this;
    var zSpeed = 1000; // how fast it advances towards the player
    var range = -15000;
    self.el = el;
    self.el.classList.add(config.colorClass);
    self.x = x;
    self.y = y;
    self.z = range;
    self.actualX = x; // actual values include modifications made by the motion function, and should be
    self.actualY = y; // used by external methods to query the actual position of the alien.
    self.lastTimestamp = null;
    self.motionFunction = config.motionFunction;
    self.hit = false; // has the alien been hit by a shot?
    self.destroyed = false; // has it exploded from being hit?

    /**
     * The shipX and shipY is the position of the ship, which affects how the shots will be offset
     * @param shipX
     * @param shipY
     * @param timestamp
     * @returns {boolean}
     */
    self.updatePosition = function(shipX, shipY, timestamp) {
        var actualPosition = applyMotionFunction();
        var offsetX = self.x - shipX;
        var offsetY = self.y - shipY;
        var opacity =  Math.min(1 - self.z / range / 2, 1);

        self.actualX = actualPosition.x;
        self.actualY = actualPosition.y;

        if (self.lastTimestamp === null ||
            100 < timestamp - self.lastTimestamp) {
            self.lastTimestamp = timestamp;
        }
        self.z += (timestamp - self.lastTimestamp) / 1000 * zSpeed;
        self.lastTimestamp = timestamp;

        self.el.style.transform =
            'translateY(' + (actualPosition.y + offsetY) + 'px) ' +
            'translateX(' + (actualPosition.x + offsetX) + 'px) ' +
            'translateZ(' + self.z + 'px) ';
        self.el.style.opacity = opacity;
        self.el.style.display = 'block';

        if (self.hit) {
            destroy();
        }

        if (500 < self.z && self.hit === false) {
            emitMissEvent();
        }

        return 500 < self.z || self.destroyed;
    };

    function applyMotionFunction() {
        return self.motionFunction.call(self);
    }

    function destroy() {
        self.el.classList.add('hit');
        setTimeout(function() {
            self.destroyed = true;
        }, 1200);
    }

    function emitMissEvent() {
        var event = new CustomEvent('miss', { 'detail': -500 });
        document.dispatchEvent(event);
    }
}


var alienFactory = (function() {
    var alienElement;
    var aliens = [];
    var viewportWidth = document.documentElement.clientWidth;
    var viewportHeight = document.documentElement.clientHeight;

    return {

        setTemplate: function(el) {
            alienElement = el.cloneNode(true);
        },

        spawn: function(event) {
            if (event.type && event.type === 'spawn') {
                event.data.forEach(function (alienDefinition) {

                    var newElement = alienElement.cloneNode(true);
                    var spawnX = viewportWidth * (Math.random() - 0.5) * 0.7;
                    var spawnY = viewportHeight * (Math.random() - 0.5) * 0.5;
                    var sceneDiv = document.querySelector('.scene');
                    var config = getAlienConfig(alienDefinition);

                    sceneDiv.insertBefore(newElement, sceneDiv.children[0]);
                    aliens.push(new Alien(newElement, spawnX, spawnY, config));
                });
            }
        },

        updatePositions: function(ship, timestamp) {
            var el, remove, i, aliensToRemove = [];

            for(i = 0; i < aliens.length; i++) {
                remove = aliens[i].updatePosition(ship.x, ship.y, timestamp);
                if (remove) {
                    aliensToRemove.push(i);
                }
            }

            // remove any aliens that have made it past the player
            for(i = aliensToRemove.length - 1; i >= 0; --i) {
                el = aliens[aliensToRemove[i]].el;
                var removedAliens = aliens.splice(aliensToRemove[i], 1);
                removedAliens[0].sound.stop();
                document.querySelector('.scene').removeChild(el);
            }

            return aliensToRemove.length;
        },

        aliens: function() {
            return aliens;
        }
    };



    function getAlienConfig(alienDefinition) {
        var motionFunction, colorClass;

        /**
         * Alien motion functions. All take the z position of the alien as an argument, and return
         * an object with x and y properties.
         * The functions are called within the context of an alien object, so `this` will refer to
         * the alien itself.
         */
        var noMotion = function() {
            return {
                x: this.x,
                y: this.y
            };
        };

        var verticalOscillation = function(speed) {
            return function() {
                var y = this.y + Math.sin(this.z / 1000 * speed) * viewportHeight / 4;
                var x = this.x;
                return {
                    x: x,
                    y: y
                };
            }
        };

        var horizontalOscillation = function(speed) {
            return function() {
                var y = this.y;
                var x = this.x + Math.sin(this.z / 1000 * speed) * viewportWidth / 4;
                return {
                    x: x,
                    y: y
                };
            }
        };

        var spiral = function(speed) {
            return function() {
                var y = this.y + Math.cos(this.z / 1000 * speed) * viewportWidth / 4;
                var x = this.x + Math.sin(this.z / 1000 * speed) * viewportWidth / 4;
                return {
                    x: x,
                    y: y
                };
            }
        };

        var random = function(speed) {
            var noiseX = new Simple1DNoise();
            noiseX.setAmplitude(viewportWidth/2);
            var noiseY = new Simple1DNoise();
            noiseY.setAmplitude(viewportHeight/2);

            return function() {
                var y = this.y + noiseY.getVal(this.z / 1000 * speed);
                var x = this.x + noiseX.getVal(this.z / 1000 * speed);
                return {
                    x: x,
                    y: y
                };
            }
        };

        if (alienDefinition.class === ALIEN_CLASS.stationary) {
            motionFunction = noMotion;
            colorClass = 'orange';
        } else if (alienDefinition.class === ALIEN_CLASS.vertical) {
            motionFunction = verticalOscillation(alienDefinition.speed);
            colorClass = 'red';
        } else if (alienDefinition.class === ALIEN_CLASS.horizontal) {
            motionFunction = horizontalOscillation(alienDefinition.speed);
            colorClass = 'blue';
        } else if (alienDefinition.class === ALIEN_CLASS.spiral) {
            motionFunction = spiral(alienDefinition.speed);
            colorClass = 'green';
        } else if (alienDefinition.class === ALIEN_CLASS.random) {
            motionFunction = random(alienDefinition.speed);
            colorClass = 'white';
        }

        return {
            motionFunction: motionFunction,
            colorClass: colorClass
        };
    }
})();