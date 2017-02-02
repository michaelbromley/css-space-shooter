var sfx = (function() {
    var module = {};

    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var masterGain = context.createGain();
    masterGain.connect(context.destination);

    module.sounds = {};

    module.loadSounds = function(callback) {
        var bufferLoader = new BufferLoader(
            context,
            [
                'assets/sfx/gun.mp3',
                'assets/sfx/ship_drone.mp3',
                'assets/sfx/explosion.mp3',
                'assets/sfx/alien.mp3',
                'assets/sfx/alien_drone.mp3',
                'assets/sfx/alarm.mp3'
            ],
            finishedLoading
        );

        bufferLoader.load();

        function finishedLoading(bufferList) {

            var sfxGun = new Sound(bufferList[0], context);
            var sfxShip = new Sound(bufferList[1], context);
            var sfxExplosion = new Sound(bufferList[2], context);
            var sfxAlien = new Sound(bufferList[3], context);
            var sfxAlarm = new Sound(bufferList[5], context);

            // set some initial values
            sfxExplosion.setGain(2);
            sfxAlien.setGain(2);
            sfxGun.setPannerParameters({
                coneOuterGain: 0.9,
                coneOuterAngle: 40,
                coneInnerAngle: 0,
                rolloffFactor: 0.1
            });
            sfxGun.setGain(0.1);
            sfxShip.setPannerParameters({
                coneOuterGain: 1,
                coneOuterAngle: 360,
                coneInnerAngle: 0,
                rolloffFactor: 0.3
            });
            sfxShip.setGain(2.5);

            module.sounds = {
                gun: {
                    play: function(ship, firepower) {
                        x = ship.x / 100;
                        y = ship.y / 100;
                        vx = ship.vx / 5;
                        vy = ship.vy / 5;
                        sfxGun.setPosition(x, y, -3);
                        // sfxGun.setVelocity(vx, vy, 0);
                        var playbackRate = 0.5 + firepower / 20;
                        sfxGun.setPlaybackRate(playbackRate);
                        sfxGun.play(masterGain);
                    }
                },
                ship: {
                    play: function(x, y) {
                        x /= 100;
                        y /= 100;
                        sfxShip.setPosition(x, y, -3);
                        sfxShip.play(masterGain, true);
                    },
                    setParameters: function(x, y, vx, vy) {
                        x /= 50;
                        y /= 50;
                        vx /= 10;
                        vy /= 10;
                        sfxShip.setPosition(x, y, -3);
                        // sfxShip.setVelocity(vx, vy, 0);
                    }
                },
                explosion: {
                    play: function(x, y, z) {
                        x /= 100;
                        y /= 100;
                        z /= 1000;
                        sfxExplosion.setPosition(x, y, z);
                        sfxExplosion.play(masterGain);
                    }
                },
                alien: {
                    play: function(x, y, z) {
                        x /= 100;
                        y /= 100;
                        z /= 1000;
                        sfxAlien.setPosition(x, y, z);
                        sfxAlien.play(masterGain);
                    }
                },
                alienDrone: {
                    create: function() {
                        var sfxAlienDrone = new Sound(bufferList[4], context);
                        sfxAlienDrone.setPannerParameters({
                            coneOuterGain: 0.1,
                            coneOuterAngle: 90,
                            coneInnerAngle: 0,
                            rolloffFactor: 2
                        });
                        sfxAlienDrone.setGain(1.5);
                        sfxAlienDrone.play(masterGain, true);
                        return sfxAlienDrone;
                    },
                    /**
                     * We take the alien and the ship as parameters so we can calculate the distance between the two,
                     * which determines the panning.
                     * @param sound
                     * @param alien
                     * @param ship
                     */
                    setParameters: function(sound, alien, ship) {
                        x = (alien.x - ship.x) / 100;
                        y = (alien.y - ship.y) / 100;
                        z = alien.z / 1000;
                        sound.setPosition(x, y, z);
                    }
                },
                alarm: {
                    play: function() {
                        sfxAlarm.play(masterGain);
                    }
                }
            };
            callback();
        }
    };

    module.setGain = function(value) {
        masterGain.gain.value = value;
    };

    return module;
})();



/**
 * Object representing a sound sample, containing all audio nodes and a play method.
 *
 * @param buffer
 * @param context
 * @constructor
 */
function Sound(buffer, context) {
    this.context = context;
    this.buffer = buffer;
    this.panner = context.createPanner();
    this.gain = context.createGain();
    this.playbackRate = 1;

    this.setPannerParameters = function(options) {
        for(var option in options) {
            if (options.hasOwnProperty(option)) {
                this.panner[option] = options[option];
            }
        }
    };

    this.setPlaybackRate = function(value) {
        this.playbackRate = value;
    };

    this.setGain = function(value) {
        this.gain.gain.value = value;
    };

    this.setPosition = function(x, y, z) {
        this.panner.setPosition(x, y, z);
    };

    this.setVelocity = function(vx, vy, vz) {
        // this.panner.setVelocity(vx, vy, vz);
    };

    this.play = function(outputNode, loop) {
        loop = loop || false;
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.playbackRate.value = this.playbackRate;
        if (loop) {
            this.source.loop = true;
        }
        this.source.connect(this.gain);
        this.gain.connect(this.panner);
        this.panner.connect(outputNode);
        this.source.start();
    };

    this.stop = function() {
        this.source.stop();
    };
}




/**
 * Taken from http://www.html5rocks.com/en/tutorials/webaudio/intro/
 * @param context
 * @param urlList
 * @param callback
 * @constructor
 */
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = [];
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length) {
            loader.onload(loader.bufferList);
        }
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  };

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  };

  request.send();
};

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i) {
      this.loadBuffer(this.urlList[i], i);
  }
};
