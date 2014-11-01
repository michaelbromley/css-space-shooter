/**
 * Created by Michael on 04/10/2014.
 */

var collisionDetector = (function() {
    var module = {};
    var screenWidth = document.documentElement.clientWidth;
    var screenHeight = document.documentElement.clientHeight;
    // dimensions of the alien's collision bounding box
    var alienBBZ = 100;
    var alienBBX = screenWidth * 0.01;
    var alienBBY = screenHeight * 0.01;

    module.check = function(shots, aliens) {
        aliens.forEach(function(alien) {

            shots.forEach(function(shot) {
                if (collision(alien, shot)) {
                    if (!alien.hit) {
                        alien.hit = true;
                        emitHitEvent(alien);
                    }
                    shot.hit = true;
                }
            });

        });
    };

    function collision(alien, shot) {
        var bbXScaled, bbYScaled;

        if (Math.abs(shot.z - alien.z) < alienBBZ) {
            bbXScaled = scaleBoundingBox(alienBBX, alien.z);
            bbYScaled = scaleBoundingBox(alienBBY, alien.z);
            if (Math.abs(shot.x - alien.actualX) < bbXScaled && Math.abs(shot.y - alien.actualY) < bbYScaled) {
                return true;
            }
        }
        return false;
    }

    function scaleBoundingBox(originalValue, zPosition) {
        var multiplier = (zPosition + 15000) / 1500;
        return originalValue * (1 + multiplier);
    }

    function emitHitEvent(alien) {
        var event = new CustomEvent('hit', { 'detail': {
            x: alien.x,
            y: alien.y,
            z: alien.z
        } });
        document.dispatchEvent(event);
    }

    return module;
})();