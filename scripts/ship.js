function Ship(containerElement, fieldWidth, fieldHeight) {
    var self = this;

    // Constants
    var A = 50; // acceleration factor
    var D = 200; // deceleration factor
    var AA = 100; // angular acceleration factor
    var AD = 130; // angular deceleration factor
    var MAX_V = 500; // maximum permitted linear velocity
    var MAX_AV = 200; // maximum permitted angular acceleration
    // field boundary limits
    var MIN_X = -fieldWidth * 0.4;
    var MAX_X = fieldWidth * 0.4;
    var MAX_Y = fieldHeight * 0.4;
    var MIN_Y = -fieldHeight * 0.4;

    self.el = containerElement;
    self.lastTimestamp = null;

    // linear position
    self.x = 0;
    self.y = 100;
    self.z = 0;

    // linear velocity
    self.vx = 0;
    self.vy = 0;

    // rotational position
    self.rx = 90;
    self.ry = 0;
    self.rz = 0;

    // rotational velocity
    self.vrx = 0;
    self.vry = 0;
    self.vrz = 0;

    self.moveLeft = function () {
        self.vx += A;
        self.vry += AA;
        self.vrz += AA/2;
    };

    self.moveRight = function () {
        self.vx-= A;
        self.vry -= AA;
        self.vrz -= AA/2;
    };

    self.moveUp = function () {
        self.vy -= A;
        self.vrx -= AA/1.3;
    };

    self.moveDown = function () {
        self.vy += A;
        self.vrx += AA/1.3;
    };

    self.updatePosition = function(timestamp) {
        var step;
        if (self.lastTimestamp === null ||
            100 < timestamp - self.lastTimestamp) {
            self.lastTimestamp = timestamp;
        }
        step = (timestamp - self.lastTimestamp) / 1000;
        self.lastTimestamp = timestamp;

        enforceFieldBoundary();

        self.x += self.vx * step;
        self.y += self.vy * step;
        self.ry += self.vry * step;
        self.rz += self.vrz * step;
        self.rx += self.vrx * step;

        self.vx = applyDeceleration(self.vx, D * step);
        self.vy = applyDeceleration(self.vy, D * step);
        self.vrx = applyRotationalDeceleration(self.vrx, self.rx, 90, AD * step);
        self.vry = applyRotationalDeceleration(self.vry, self.ry, 0, AD * step);
        self.vrz = applyRotationalDeceleration(self.vrz, self.rz, 0, AD * step);

        self.el.style.transform =
            'translateZ(' + self.z + 'px) ' +
            'translateX(' + self.x + 'px) ' +
            'translateY(' + self.y + 'px) ' +
            'rotateX(' + self.rx + 'deg) ' +
            'rotateY(' + self.ry + 'deg) ' +
            'rotateZ(' + self.rz + 'deg) ';
    };

    function enforceFieldBoundary() {
        var bounceFactor = 0.5;
        var delta;
        if (MAX_X < self.x) {
            delta = self.x - MAX_X;
            self.vx -= delta * bounceFactor;
        }
        if (self.x < MIN_X) {
            delta = MIN_X - self.x;
            self.vx += delta * bounceFactor;
        }
        if (MAX_Y < self.y) {
            delta = self.y - MAX_Y;
            self.vy -= delta * bounceFactor;
        }
        if (self.y < MIN_Y) {
            delta = MIN_Y - self.y;
            self.vy += delta * bounceFactor;
        }

    }

    function applyDeceleration(oldValue, decelerationFactor) {
        var newValue;

        if (0 < oldValue) {
            newValue  =  oldValue - decelerationFactor;
        } else if (oldValue < 0) {
            newValue = oldValue + decelerationFactor;
        } else {
            newValue = oldValue;
        }

        if (Math.abs(oldValue) < decelerationFactor) {
            newValue = 0;
        }

        if (MAX_V < newValue) {
            newValue = MAX_V;
        }
        if (newValue < -MAX_V) {
            newValue = -MAX_V;
        }

        return newValue;
    }

    function applyRotationalDeceleration(oldValue, currentAngle, targetAngle, decelerationFactor) {
        var newValue;

        var delta = currentAngle - targetAngle;
        if (0 < delta) {
            newValue =  -delta * decelerationFactor;
        } else if (delta < 0) {
            newValue = -delta * decelerationFactor;
        } else {
            newValue = oldValue;
        }

        if (Math.abs(targetAngle - currentAngle) < decelerationFactor) {
           newValue = 0;
        }

        if (MAX_AV < newValue) {
            newValue = MAX_AV;
        }
        if (newValue < -MAX_AV) {
            newValue = -MAX_AV;
        }

        return newValue;
    }
}
