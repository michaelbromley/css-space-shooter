
function Shot(el, x, y) {
    var self = this;
    var range = 15000; // how far into the distance before it disappears
    var speed = 5000; // distance (in pixels) travelled in 1 second;
    self.lastTimestamp = null;
    self.el = el;
    self.x = x;
    self.y = y;
    self.z = 0;
    self.hit = false; // has the shot collided with an alien?

    /**
     * The x and y is the position of the ship, which affects how the shots will be offset
     * @param x
     * @param y
     * @param timestamp
     * @returns {boolean}
     */
    self.updatePosition = function(x, y, timestamp) {
        if (self.lastTimestamp === null ||
            100 < timestamp - self.lastTimestamp) {
            self.lastTimestamp = timestamp;
        }
        self.z -= (timestamp - self.lastTimestamp) / 1000 * speed;
        self.lastTimestamp = timestamp;
        var offsetX = self.x - x;
        var offsetY = self.y - y;
        var opacity = (range + self.z) / range;

        self.el.style.transform =
            'translateY(' + (self.y + offsetY) + 'px) ' +
            'translateX(' + (self.x + offsetX) + 'px) ' +
            'translateZ(' + self.z + 'px) ' +
            'rotateX(90deg)';
        self.el.style.opacity = opacity;
        return self.z < -range || self.hit;
    };
}

var shotFactory = (function() {
    var MAX_FIREPOWER = 10;
    var FIREPOWER_GAIN_PER_SECOND = 4;

    var shotElement;
    var shots = [];
    var firepower = MAX_FIREPOWER;
    var lastTimestamp = null;

    return {
        setTemplate: function(el) {
            shotElement = el.cloneNode(false);
            shotElement.style.display = 'block';
        },
        create: function(ship) {
            if (0 < Math.round(firepower)) {
                throttle(function () {

                    if (3 < firepower) {
                        var spread = document.documentElement.clientWidth * 0.03;
                        var shotL = {
                            x: ship.x - spread * Math.cos(ship.ry * (Math.PI/180)),
                            y: ship.y - Math.tan(ship.ry * (Math.PI/180)) * spread
                        };
                        var shotR = {
                            x: ship.x + spread * Math.cos(ship.ry * (Math.PI/180)),
                            y: ship.y + Math.tan(ship.ry * (Math.PI/180)) * spread
                        };

                        var shotLeftElement = shotElement.cloneNode(false);
                        document.querySelector('.scene').appendChild(shotLeftElement);
                        shots.push(new Shot(shotLeftElement, shotL.x, shotL.y));
                        var shotRightElement = shotElement.cloneNode(false);
                        document.querySelector('.scene').appendChild(shotRightElement);
                        shots.push(new Shot(shotRightElement, shotR.x, shotR.y));

                    } else {
                        var newElement = shotElement.cloneNode(false);
                        document.querySelector('.scene').appendChild(newElement);
                        shots.push(new Shot(newElement, ship.x, ship.y));
                    }
                    emitShotEvent(ship.x, ship.y);
                    firepower --;

                }, 150);
            }
        },
        updatePositions: function(ship, timestamp) {
            var shotsToRemove = [];
            var remove, i;
            for(i = 0; i < shots.length; i++) {
                remove = shots[i].updatePosition(ship.x, ship.y, timestamp);
                if (remove) {
                    shotsToRemove.push(i);
                }
            }

            // remove any shots that have gone too distant
            for(i = shotsToRemove.length - 1; i >= 0; --i) {
                var el = shots[shotsToRemove[i]].el;
                shots.splice(shotsToRemove[i], 1);
                document.querySelector('.scene').removeChild(el);
            }

            replenishFirepower(timestamp);
        },
        shots: function() {
            return shots;
        },
        firepower: function() {
            return firepower;
        }
    };

    function replenishFirepower(timestamp) {
        if (lastTimestamp === null ||
            100 < timestamp - lastTimestamp) {
            lastTimestamp = timestamp;
        }
        var deltaSeconds = (timestamp - lastTimestamp) / 1000;

        if (firepower < MAX_FIREPOWER) {
            firepower += deltaSeconds * FIREPOWER_GAIN_PER_SECOND;
        }

        lastTimestamp = timestamp;
    }

    function emitShotEvent(x, y) {
        var event = new CustomEvent('shot', { 'detail': { firepower: firepower } });
        document.dispatchEvent(event);
    }

})();

var timer, canFire = true;
function throttle(fn, delay) {
    if (canFire) {
        fn();
        canFire = false;
        timer = setTimeout(function () {
            canFire = true;
        }, delay);
    }
}