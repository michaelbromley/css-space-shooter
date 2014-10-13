
function Shot(el, x, y) {
    var self = this;
    var range = 15000; // how far into the distance before it disappears
    var speed = 10000; // distance (in pixels) travelled in 1 second;
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
        if (self.lastTimestamp === null) {
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
            'translateZ(' + self.z + 'px) ';
        self.el.style.opacity = opacity;
        return self.z < -range || self.hit;
    };
}

var shotFactory = (function() {
    var shotElement;
    var shots = [];
    var MAX_FIREPOWER = 10;
    var firepower = MAX_FIREPOWER;

    return {
        setTemplate: function(el) {
            shotElement = el.cloneNode(false);
            shotElement.style.display = 'block';
        },
        create: function(x, y) {
            if (0 < Math.round(firepower)) {
                throttle(function () {
                    var newElement = shotElement.cloneNode(false);
                    document.querySelector('.scene').appendChild(newElement);
                    shots.push(new Shot(newElement, x, y));
                    firepower --;
                }, 100);
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

            if (firepower < MAX_FIREPOWER) {
                firepower += 0.1;
            }
        },
        shots: function() {
            return shots;
        },
        firepower: function() {
            return firepower;
        }
    };

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