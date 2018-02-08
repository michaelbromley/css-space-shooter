var music = (function() {
    var module = {};

    var player =  document.getElementById('player');
    var loader = new MP3Loader(player);
    var audioSource = new MP3AudioSource(player);

    module.load = function(trackUrl, callback) {
        callback = callback || function() {};
        loader.loadStream(trackUrl,
            callback,
            function() {
                console.log("Error: ", loader.errorMessage);
            }
        );
    };

    module.play = function() {
        if (loader.successfullyLoaded) {
            audioSource.playStream(loader.streamUrl());
        }
    };

    module.pause = function() {
        player.pause();
    };

    module.resume = function() {
        player.play();
    };

    module.getAudioData = function() {
        return {
            volume: audioSource.volume,
            frequencyData: audioSource.streamData
        };
    };

    return module;
})();



function SoundCloudAudioSource(player) {
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    var sampleAudioStream = function () {
        analyser.getByteFrequencyData(self.streamData);
        // calculate an overall volume value
        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += self.streamData[i];
        }
        self.volume = total;
    };
    setInterval(sampleAudioStream, 20);
    // public properties and methods
    this.volume = 0;
    this.streamData = new Uint8Array(128);
    this.playStream = function (streamUrl) {
        // get the input stream from the audio element
        player.addEventListener('ended', function () {
            self.directStream('coasting');
        });
        player.setAttribute('src', streamUrl);
        player.play();
    }
}

/**
 * Makes a request to the Soundcloud API and returns the JSON data.
 */
function SoundcloudLoader(player) {
    var self = this;
    var client_id = SOUNDCLOUD_ID; // to get an ID go to http://developers.soundcloud.com/
    this.sound = {};
    this.streamUrl = "";
    this.errorMessage = "";
    this.player = player;
    this.successfullyLoaded = false;

    /**
     * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
     * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
     * @param track_url
     * @param callback
     */
    this.loadStream = function(track_url, successCallback, errorCallback) {
        if (typeof SC !== 'undefined') {
            SC.initialize({
                client_id: client_id
            });
            SC.get('/resolve', {url: track_url}, function (sound) {
                if (sound) {
                    if (sound.errors) {
                        self.errorMessage = "";
                        for (var i = 0; i < sound.errors.length; i++) {
                            self.errorMessage += sound.errors[i].error_message + '<br>';
                        }
                        self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
                        errorCallback();
                    } else {

                        self.successfullyLoaded = true;
                        console.log('music loaded');

                        if (sound.kind == "playlist") {
                            self.sound = sound;
                            self.streamPlaylistIndex = 0;
                            self.streamUrl = function () {
                                return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
                            };
                            successCallback();
                        } else {
                            self.sound = sound;
                            self.streamUrl = function () {
                                return sound.stream_url + '?client_id=' + client_id;
                            };
                            successCallback();
                        }
                    }
                } else {
                    console.log('An unspecified error occurred. No music could be loaded');
                    successCallback(); // call success just so the game will still run
                }
            });
        } else {
            console.log('SoundCloud library not found. No music could be loaded');
            successCallback(); // call success just so the game will still run
        }
    };


    this.directStream = function(direction){
        if(direction=='toggle'){
            if (this.player.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
        else if(this.sound.kind=="playlist"){
            if(direction=='coasting') {
                this.streamPlaylistIndex++;
            }else if(direction=='forward') {
                if(this.streamPlaylistIndex>=this.sound.track_count-1) this.streamPlaylistIndex = 0;
                else this.streamPlaylistIndex++;
            }else{
                if(this.streamPlaylistIndex<=0) this.streamPlaylistIndex = this.sound.track_count-1;
                else this.streamPlaylistIndex--;
            }
            if(this.streamPlaylistIndex>=0 && this.streamPlaylistIndex<=this.sound.track_count-1) {
               this.player.setAttribute('src',this.streamUrl());
               this.player.play();
            }
        }
    }
}

function MP3AudioSource(player) {
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    var sampleAudioStream = function () {
        analyser.getByteFrequencyData(self.streamData);
        // calculate an overall volume value
        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += self.streamData[i];
        }
        self.volume = total;
    };
    setInterval(sampleAudioStream, 20);
    // public properties and methods
    this.volume = 0;
    this.streamData = new Uint8Array(128);
    this.playStream = function (streamUrl) {
        // get the input stream from the audio element
        player.addEventListener('ended', function () {
            player.play();
        });
        player.setAttribute('src', streamUrl);
        player.play();
    }
}

/**
 * Loads an mp3 file
 */
function MP3Loader(player) {
    var self = this;
    this.sound = {};
    this.streamUrl = function () { return ''; };
    this.errorMessage = "";
    this.player = player;
    this.successfullyLoaded = false;

    this.loadStream = function(track_url, successCallback, errorCallback) {
        self.successfullyLoaded = true;
        this.streamUrl = function () { return track_url; };
        successCallback();
    };
}

