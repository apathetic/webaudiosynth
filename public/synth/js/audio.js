var Audio = (function (window) {

	var context;
	if (window.AudioContext) {
		context = new window.AudioContext();
	} else {
		console.log('1 00% not suppor t ed');
		return;
	}

	var sendFX,
		masterOut,
		waveList = [],
		waveNames = [
		"01_Saw", "02_Triangle", "03_Square", "04_Noise", "05_Pulse", "06_Warm_Saw",
		"07_Warm_Triangle", "08_Warm_Square", "09_Dropped_Saw", "10_Dropped_Square",
		"11_TB303_Square", "Bass", "Bass_Amp360", "Bass_Fuzz", "Bass_Fuzz_ 2",
		"Bass_Sub_Dub", "Bass_Sub_Dub_2", "Brit_Blues","Brit_Blues_Driven",	"Buzzy_1",
		"Buzzy_2", "Dissonant_1", "Dissonant_2", "Dyna_EP_Bright", "Dyna_EP_Med",
		"Full_1", "Full_2", "Guitar_Fuzz", "Harsh", "Mkl_Hard", "Organ_2", "Organ_3",
		"Putney_Wavering", "Throaty", "Twelve String Guitar 1", "Wurlitzer"
		],
		waveform = 0,
		detune = 4.5;



	function loadWaveTable() {

		var loadedCount = 0,
			numWaves = waveNames.length;

		for (var i = 0; i < numWaves; ++i) {
			var name = waveNames[i];
			// console.log('loading', name);
			waveList[i] = new WaveTable(name, context);
			waveList[i].load(function(waveTable) {
				loadedCount++;
				if (loadedCount == numWaves) {
					// finishedCallback();
				}
			});
		}
	}

	function loadIR(url, convolver) {
		// Load impulse response asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		request.onload = function() {
			// convolver.buffer = context.createBuffer(request.response, false);
			context.decodeAudioData(request.response,
				function onSuccess(buffer) { convolver.buffer = buffer; },
				function onFailure() { console.log('could not load: '+url); });

		}
		request.onerror = function() {
			console.log("error loading IR");
		}

		request.send();
	}

	// ----------------------------------------------------------------------

	var Note = function(A,D,S,R){		// (vel, env) ... where env = {A:.., D:..., S:..., R:...}

		var osc = context.createBufferSource();
		osc.loop = true;

		var filter = context.createBiquadFilter();
		filter.type = 0;		// lowpass, default

		var env = context.createGain();
		env.gain.value = 0.0;

		var vol = context.createGain();
		vol.gain.value = 1.0;


		// ROUTING
		// osc.connect(panner);
		// panner.connect(env);
		// env.connect(filter);
		// filter.connect(vol);

		osc.connect(env);
		env.connect(sendFX.input);

		// NOTE DEFAULTS
		this.ampDecay 	= 0.100;
		this.ampAttack	= 0.056;
		this.panner;
		this.osc		= osc;
		this.filter;
		this.env		= env;
		this.vol		= vol;
	}

	Note.prototype = {
		play: function(midi, wave){
			var now = context.currentTime,
				osc = this.osc,			// get local copy
				env = this.env,			// get local copy
				// frequency = 20.0 * Math.pow(2.0, semitone / 12.0);
				frequency	= 440.0 * Math.pow(2.0, (midi-69) / 12.0),
				pitchRate	= frequency * waveList[wave].getRateScale(),
				rate		= pitchRate * Math.pow(2.0, -detune / 1200),
				buffer		= waveList[wave].getWaveDataForPitch(rate),
				ampDecay 	= this.ampDecay,		// the time it takes a first-order linear continuous time-invariant system to reach the value 1 - 1/e (around 63.2%) given a step input response (transition from 0 to 1 value).
				ampAttack	= this.ampAttack,
				ampAttackTime = now + ampAttack;

			console.log('Playing: '+waveNames[wave]+' at '+frequency+'Hz');

			osc.buffer = buffer;
			osc.playbackRate.value = rate;

			env.gain.setTargetAtTime(1, now, ampAttack);					// super simple envelope
			env.gain.setTargetAtTime(0, ampAttackTime, ampDecay);

			osc.start( now );
			osc.stop( now+ampAttack+(8*ampDecay) );						// 8 * ampDecay's should be enough


		// TODO  release the buffer after note has played...? GC not removing automatically.
		// GC test
		setTimeout(function(){ osc = null }, 2000);




		},
		automate: function(){

		}
	};


	// ----------------------------------------------------------------------


	var SendFX = function(){
		// *** all FX are in parallel

		console.log(context);

		// create nodes
		var input			= context.createGain();
		// var waveshaper	= context.createWaveShaper();	// see tuna.js line ~891
		var convolver		= context.createConvolver();
		var convolverWet	= context.createGain();
		var delay			= context.createDelay();
		var delayFeedback	= context.createGain();
		var delayWet		= context.createGain();
		var compressor		= context.createDynamicsCompressor();


		// store nodes on SendFX object
		this.compressor = compressor;
		this.convolver = convolver;
		this.convolverWet = convolverWet;
		this.delay = delay;
		this.delayFeedback = delayFeedback;
		this.delayWet = delayWet;
		this.input = input;


		// set sensible defaults
		loadIR('/synth/audio/IR/matrix-reverb1.wav', convolver);

		delayFeedback.gain.value = 0.5;
		delayWet.gain.value = 0.5;
		delay.delayTime.value = 0.15;	//150 ms delay


		// routing
		input.connect(compressor);		// dry
		input.connect(delay);			// no dry, just wet
		input.connect(convolver);

		delay.connect(delayFeedback);
		delay.connect(delayWet);
		delayFeedback.connect(delay);
		delayWet.connect(compressor);

		convolver.connect(convolverWet);
		convolverWet.connect(compressor);

		// compressor --> speakers
		compressor.connect(masterOut);
	}

	SendFX.prototype = {
		setDelay: function(x){},
		setDelayFeedback: function(x){},
		setDelayWet: function(x){},
		setConvolverWet: function(x){}
	}










	return {
		init: function() {

			loadWaveTable();
			masterOut = context.destination;
			sendFX = new SendFX();

			document.addEventListener('keydown', function(e) {
			// $(document).on('keydown', function(e){
				console.log(e.which);
				if (e.which == 32) {
					var note = new Note();
					note.play(60, waveform);
				}
				if (e.which >= 48 && e.which <= 57) {
					waveform = e.which - 48;
					var dev = document.getElementById('dev');
					dev.innerHTML = waveNames[waveform];
				}

				switch (e.which) {
					case 65:			// A
						playChord(63);
						break;
					case 83:			// S
						playChord(65);
						break;
					case 68:			// D
						playChord(66);
						break;
					case 70:			// F
						playChord(68);
						break;
				}

			});

			function playChord(root){
				var minor = [0, 3, 7, 10];

				for(var i = 0; i < 4; i++) {
					var note = new Note();
					note.play(minor[i]+root, waveform);
				}
			}

		},
		playNote: function(pitch) {
			var note = new Note();
			note.play(pitch, waveform);
		}
	}


})(this);
