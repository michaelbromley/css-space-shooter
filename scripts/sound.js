//--------------------------------------------------------------------------------------------------
//
// window.Sound
//  https://github.com/tutsplus/game-audio-simplified/blob/master/index.js
//
//--------------------------------------------------------------------------------------------------

(function(){

	var __audio     = null;
	var __context   = null;
	var __processor = null;
	var __loader    = null;
	var __listener  = null;
	var __instances = null;
	var __loading   = null;
	var __pending   = null;
	var __volume    = 0.0;

	/**
	 * @private
	 *
	 * Initializes the sound system.
	 */
	function init() {
		var Audio        = window.Audio;
		var AudioContext = window.AudioContext || window.webkitAudioContext;

		try {
			__audio   = new Audio();
			__context = new AudioContext();
		}
		catch( error ) {
			__audio   = null;
			__context = null;
		}

		if( __context !== null ) {
			var v = __context.sampleRate / 60;
			var n = 0;

			while( v > 0 ) {
				v >>= 1;
				n ++;
			}

			__processor = __context.createScriptProcessor( Math.pow( 2, n ) );

			__processor.connect( __context.destination );
			__processor.onaudioprocess = onProcessorUpdate;
		}

		__instances = [];
		__loading   = [];
		__pending   = [];
		__volume    = Sound.Volume.DEFAULT;

		// Expose the Sound constructor.
		window.Sound = Sound;
	}

	/**
	 * @private
	 *
	 * @param Sound sound
	 */
	function sync( sound ) {
		if( sound.__instance !== null ) {
			if( sound.__instance.stopped === false ) {
				sound.__instance.pan    = sound.__pan;
				sound.__instance.scale  = sound.__scale;
				sound.__instance.volume = sound.__volume;
			}
		}
	}

	/**
	 * @private
	 *
	 * @param Sound  sound
	 * @param String state (optional)
	 */
	function broadcast( sound, state ) {
		if( state !== undefined ) {
			sound.__state = state;
		}

		if( __listener !== null ) {
			__listener.call( null, sound, sound.__state );
		}
	}

	/**
	 * @private
	 *
	 * @param Number value
	 * @param Object param
	 *
	 * @return Number
	 */
	function clamp( value, param ) {
		if( value > param.MAXIMUM ) {
			return param.MAXIMUM;
		}

		if( value < param.MINIMUM ) {
			return param.MINIMUM;
		}

		return value;
	}

	/**
	 * @private
	 *
	 * @param Boolean next (optional)
	 */
	function load( next ) {
		if( next !== false ) {
			__loading.shift();
		}

		var sound = __loading[ 0 ];

		if( sound === undefined ) {
			return;
		}

		__loader = new XMLHttpRequest();

		__loader.open( "GET", sound.__path );
		__loader.responseType = "arraybuffer";
		__loader.onreadystatechange = onLoaderUpdate;

		try {
			__loader.send();
		}
		catch( error ) {
			onLoaderError();
			return;
		}

		broadcast( sound, Sound.State.LOADING );
	}

	/**
	 * @private
	 */
	function onLoaderUpdate() {
		if( __loader.readyState === 4 ) {
			if( __loader.response === null ) {
				onLoaderError();
				return;
			}

			onLoaderResult();
		}
	}

	/**
	 * @private
	 */
	function onLoaderError() {
		var sound = __loading[ 0 ];

		try {
			console.warn( "Failed to load sound : %s", sound.__path );
		}
		catch( error ) {}

		broadcast( sound, Sound.State.ERROR );
		load();
	}

	/**
	 * @private
	 */
	function onLoaderResult() {
		if( __context === null ) {
			broadcast( sound, Sound.State.ERROR );
			load();
			return;
		}

		__context.decodeAudioData( __loader.response, onDecoderResult, onDecoderError );
	}

	/**
	 * @private
	 */
	function onDecoderError() {
		var sound = __loading[ 0 ];

		try {
			console.warn( "Failed to decode sound : %s", sound.__path );
		}
		catch( error ) {}

		broadcast( sound, Sound.State.ERROR );
		load();
	}

	/**
	 * @private
	 *
	 * @param AudioBuffer buffer
	 */
	function onDecoderResult( buffer ) {
		var sound = __loading[ 0 ];

		sound.__buffer = buffer;

		broadcast( sound, Sound.State.LOADED );
		load();
	}

	/**
	 * @private
	 *
	 * @param AudioProcessingEvent event
	 */
	function onProcessorUpdate( event ) {
		var outL        = event.outputBuffer.getChannelData( 0 );
		var outR        = event.outputBuffer.getChannelData( 1 );
		var outSize     = event.outputBuffer.length;
		var outPosition = 0;
		var sampleL     = 0.0;
		var sampleR     = 0.0;
		var instance    = null;

		//
		// The script processor uses a circular output buffer, meaning any
		// samples previously written to the buffer will still be there.
		//
		// That is useful for audio effects (delays etc) but we need to
		// make sure the buffer is clear for this code otherwise we will
		// end up with a nasty infinite feedback loop.
		//
		while( outPosition < outSize ) {
			outL[ outPosition ] = 0.0;
			outR[ outPosition ] = 0.0;
			outPosition ++;
		}

		var i = __instances.length;

		while( i -- > 0 ) {
			instance    = __instances[ i ];
			outCount    = 0;
			outPosition = 0;

			if( instance.stopped ) {
				__instances.splice( i, 1 );
				continue;
			}

			while( outPosition < outSize ) {
				if( instance.position >= instance.size ) {
					if( instance.looped ) {
						instance.position -= instance.size;
					}
					else {
						instance.stopped = true;
						break;
					}
				}

				// Grab the sample from the sound instance buffer.
				sampleL = instance.chnL[ instance.position >> 0 ];
				sampleR = instance.chnR[ instance.position >> 0 ];

				// Increase the playhead position.
				instance.position += instance.scale;

				// Apply the master volume.
				sampleL *= __volume;
				sampleR *= __volume;

				// Apply the sound instance volume.
				sampleL *= instance.volume;
				sampleR *= instance.volume;

				// Apply the sound instance pan (stereo position).
				sampleL *= 1.0 - instance.pan;
				sampleR *= 1.0 + instance.pan;

				// Mix the sample.
				sampleL += outL[ outPosition ];
				sampleR += outR[ outPosition ];

				// Output the sample and make sure it's within the -1.0 to 1.0 range.
				outL[ outPosition ] = sampleL < -1.0 ? -1.0 : sampleL > 1.0 ? 1.0 : sampleL;
				outR[ outPosition ] = sampleR < -1.0 ? -1.0 : sampleR > 1.0 ? 1.0 : sampleR;

				outPosition ++;
			}
		}
	}

	/**
	 * @private
	 * @constructor
	 *
	 * @param Sound sound
	 */
	function SoundInstance( sound ) {
		this.chnL   = sound.__buffer.getChannelData( 0 );
		this.chnR   = sound.__buffer.getChannelData( 1 );
		this.size   = sound.__buffer.length;
		this.pan    = sound.__pan;
		this.scale  = sound.__scale;
		this.volume = sound.__volume;
		this.looped = sound.__looped;

		__instances.push( this );
	}

	SoundInstance.prototype = {
		chnL     : null,
		chnR     : null,
		size     : 0.0,
		position : 0.0,
		pan      : 0.0,
		scale    : 0.0,
		volume   : 0.0,
		looped   : false,
		stopped  : false
	};

	/**
	 * @constructor
	 *
	 * @param String  path
	 * @param Boolean looped (optional)
	 */
	function Sound( path, looped ) {
		this.__path   = String( path );
		this.__state  = Sound.State.PENDING;
		this.__pan    = Sound.Pan.DEFAULT;
		this.__scale  = Sound.Scale.DEFAULT;
		this.__volume = Sound.Volume.DEFAULT;
		this.__looped = Boolean( looped );

		__pending.push( this );
	}

	Sound.prototype = {
		__path     : null,
		__state    : null,
		__buffer   : null,
		__instance : null,
		__pan      : 0.0,
		__scale    : 0.0,
		__volume   : 0.0,
		__looped   : false,

		/**
		 * Plays the sound if it has been loaded.
		 */
		play : function() {
			if( this.__state !== Sound.State.LOADED ) {
				return false;
			}

			if( this.__looped ) {
				if( this.__instance !== null ) {
					this.__instance.stopped = true;
				}
			}

			this.__instance = new SoundInstance( this );
		},

		/**
		 * Stops the sound.
		 */
		stop : function() {
			if( this.__instance !== null ) {
				this.__instance.stopped = true;
			}
		},

		/**
		 * Gets the sound's path.
		 *
		 * @return String
		 */
		getPath : function() {
			return this.__path;
		},

		/**
		 * Gets the sound's state.
		 *
		 * @return String
		 */
		getState : function() {
			return this.__state;
		},

		/**
		 * Gets the sound's pan position, i.e. its stereo position.
		 *
		 * @return Number
		 */
		getPan : function() {
			return this.__pan;
		},

		/**
		 * Sets the sound's pan position, i.e. its stereo position.
		 *
		 * @see Sound.Pan
		 *
		 * @param Number pan
		 */
		setPan : function( pan ) {
			this.__pan = clamp( pan, Sound.Pan );
			sync( this );
		},

		/**
		 * Gets the sound's scale.
		 *
		 * @return Number
		 */
		getScale : function() {
			return this.__scale;
		},

		/**
		 * Sets the sound's scale.
		 *
		 * @see Sound.Scale
		 *
		 * @param Number scale
		 */
		setScale : function( scale ) {
			this.__scale = clamp( scale, Sound.Scale );
			sync( this );
		},

		/**
		 * Gets the sound's volume.
		 *
		 * @return Number
		 */
		getVolume : function() {
			return this.__volume;
		},

		/**
		 * Sets the sound's volume.
		 *
		 * @see Sound.Volume
		 *
		 * @param Number volume
		 */
		setVolume : function( volume ) {
			this.__volume = clamp( volume, Sound.Volume );
			sync( this );
		},

		/**
		 * Indicates if the sound is waiting to be loaded.
		 *
		 * @return Boolean
		 */
		isPending : function() {
			return this.__state === Sound.State.PENDING;
		},

		/**
		 * Indicates if the sound is loading.
		 *
		 * @return Boolean
		 */
		isLoading : function() {
			return this.__state === Sound.State.LOADING;
		},

		/**
		 * Indicates is the sound has been loaded.
		 *
		 * @return Boolean
		 */
		isLoaded : function() {
			return this.__state === Sound.State.LOADED;
		},

		/**
		 * Indicates if the sound is looped.
		 *
		 * @return Boolean
		 */
		isLooped : function() {
			return this.__looped;
		}
	};

	/**
	 */
	Sound.Pan = {
		DEFAULT :  0.0,
		MAXIMUM :  1.0,
		MINIMUM : -1.0
	};

	/**
	 */
	Sound.Scale = {
		DEFAULT : 1.0,
		MAXIMUM : 8.0,  // +8 octaves
		MINIMUM : 0.125 // -8 octaves
	};

	/**
	 */
	Sound.Volume = {
		DEFAULT : 1.0,
		MAXIMUM : 1.0,
		MINIMUM : 0.0
	}

	/**
	 */
	Sound.State = {
		ERROR   : "error",
		PENDING : "pending",
		LOADING : "loading",
		LOADED  : "loaded"
	};

	/**
	 */
	Sound.Format = {
		MP3 : "audio/mpeg",
		MP4 : "audio/mp4;codecs=mp4a.40.2",
		OGG : "audio/ogg;codecs=vorbis",
		WAV : "audio/wav;codecs=1"
	};

	/**
	 * Loads any pending sounds.
	 *
	 * Pending sounds will be added to a queue a loaded sequentially.
	 */
	Sound.load = function() {
		var i = __pending.length;
		var n = __loading.length;

		while( i -- > 0 ) {
			__loading.push( __pending.shift() );
		}

		if( n === 0 ) {
			load( false );
		}
	}

	/**
	 * Stops any sounds that are playing.
	 */
	Sound.stop = function() {
		var i = __instances.length;

		while( i -- > 0 ) {
			__instances[ i ].stopped = true;
		}
	}

	/**
	 * Gets the master sound volume.
	 *
	 * @return Number
	 */
	Sound.getVolume = function() {
		return __volume;
	}

	/**
	 * Sets the master sound volume.
	 *
	 * @see Sound.Volume
	 *
	 * @param Number volume
	 */
	Sound.setVolume = function( volume ) {
		__volume = clamp( volume, Sound.Volume );
	}

	/**
	 * Returns the sound listener.
	 *
	 * @return Function
	 */
	Sound.getListener = function() {
		return __listener;
	}

	/**
	 * Sets the sound listener.
	 *
	 * @param Function listener
	 */
	Sound.setListener = function( listener ) {
		if( typeof listener !== "function" ) {
			listener = null;
		}

		__listener = listener;
	}

	/**
	 * Indicates if the specified sound format can be played by
	 * the browser that is running this code.
	 *
	 * @see Sound.Format
	 *
	 * @param String format
	 *
	 * @return Boolean
	 */
	Sound.canPlay = function( format ) {
		if( __audio !== null ) {
			return __audio.canPlayType( format ) !== "";
		}

		return false;
	}

	// Initialize the sound system.
	init();

})();