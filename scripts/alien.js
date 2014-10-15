/**
 * Created by Michael on 02/10/2014.
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
    self.lastTimestamp = null;
    self.motionFunction = config.motionFunction;
    self.hit = false; // has the alien been hit by a shot?
    self.destroyed = false; // has it exploded from being hit?

    /**
     * The x and y is the position of the ship, which affects how the shots will be offset
     * @param x
     * @param y
     * @param timestamp
     * @returns {boolean}
     */
    self.updatePosition = function(x, y, timestamp) {
        var xy = applyMotionFunction();
        var offsetX = self.x - x;
        var offsetY = self.y - y;
        var opacity =  Math.min(1 - self.z / range / 2, 1);

        if (self.lastTimestamp === null) {
            self.lastTimestamp = timestamp;
        }
        self.z += (timestamp - self.lastTimestamp) / 1000 * zSpeed;
        self.lastTimestamp = timestamp;

        self.el.style.transform =
            'translateY(' + (xy.y + offsetY) + 'px) ' +
            'translateX(' + (xy.x + offsetX) + 'px) ' +
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
                event.data.forEach(function (alienClass) {

                    var newElement = alienElement.cloneNode(true);
                    var spawnX = viewportWidth * (Math.random() - 0.5) * 0.8;
                    var spawnY = viewportHeight * (Math.random() - 0.5) * 0.5;
                    var sceneDiv = document.querySelector('.scene');
                    var config = getAlienConfig(alienClass);

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
                aliens.splice(aliensToRemove[i], 1);
                document.querySelector('.scene').removeChild(el);
            }

            return aliensToRemove.length;
        },

        aliens: function() {
            return aliens;
        }
    };



    function getAlienConfig(alienClass) {
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

        var verticalOscillation = function() {
            var y = this.y + Math.sin(this.z/1000) * viewportHeight/4;
            var x = this.x;
            return {
                x: x,
                y: y
            };
        };

        var horizontalOscillation = function() {
            var y = this.y;
            var x = this.x + Math.sin(this.z/1000) * viewportWidth/4;
            return {
                x: x,
                y: y
            };
        };

        var spiral = function() {
            var y = this.y + Math.cos(this.z/1000) * viewportWidth/4;
            var x = this.x + Math.sin(this.z/1000) * viewportWidth/4;
            return {
                x: x,
                y: y
            };
        };


        var noiseX = new Simple1DNoise();
        noiseX.setAmplitude(viewportWidth/2);
        var noiseY = new Simple1DNoise();
        noiseY.setAmplitude(viewportHeight/2);

        var random = function() {
            var y = this.y + noiseY.getVal(this.z/1000);
            var x = this.x + noiseX.getVal(this.z/1000);
            return {
                x: x,
                y: y
            };
        };

        if (alienClass === ALIEN_CLASS.stationary) {
            motionFunction = noMotion;
            colorClass = 'orange';
        } else if (alienClass === ALIEN_CLASS.vertical) {
            motionFunction = verticalOscillation;
            colorClass = 'red';
        } else if (alienClass === ALIEN_CLASS.horizontal) {
            motionFunction = horizontalOscillation;
            colorClass = 'blue';
        } else if (alienClass === ALIEN_CLASS.spiral) {
            motionFunction = spiral;
            colorClass = 'green';
        } else if (alienClass === ALIEN_CLASS.random) {
            motionFunction = random;
            colorClass = 'white';
        }

        return {
            motionFunction: motionFunction,
            colorClass: colorClass
        };
    }
})();