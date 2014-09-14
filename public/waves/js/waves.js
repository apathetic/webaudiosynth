
// --------------------------
// waves-ishes
// --------------------------

var WAVES = (function(){

	var camera,
		scene,
		renderer,
		particles = [];

	var context,
		buffers = [],
		sources = [],
		waveNames = [
			"01_Saw", "02_Triangle", "03_Square", "04_Noise", "05_Pulse", "06_Warm_Saw",
			"07_Warm_Triangle", "08_Warm_Square", "09_Dropped_Saw", "10_Dropped_Square",
			// "11_TB303_Square", "Bass", "Bass_Amp360", "Bass_Fuzz", "Bass_Fuzz_ 2",
			// "Bass_Sub_Dub", "Bass_Sub_Dub_2", "Brit_Blues","Brit_Blues_Driven",	"Buzzy_1",
			// "Buzzy_2", "Dissonant_1", "Dissonant_2", "Dyna_EP_Bright", "Dyna_EP_Med",
			// "Full_1", "Full_2", "Guitar_Fuzz", "Harsh", "Mkl_Hard", "Organ_2", "Organ_3",
			// "Putney_Wavering", "Throaty", "Twelve String Guitar 1", "Wurlitzer"
		],
		bufferNames = [
			"ambience.wav",
			"heartbeat.wav",
			"growl.wav",
			"screaming.wav"
		];

	var stats,
		mouseX = 0, mouseY = 0;

	var numberOfBirds = 100,
		mal = 0;


	setInterval(function(){ mal = !mal; }, 30000);

	// --------------------------------------------------
	// VIDEO
	// --------------------------------------------------

	function animate() {
		requestAnimationFrame( animate );
		render();
	}


	function render() {

		var bird;

		for ( var i = 0; i < numberOfBirds; i++ ) {

			bird = particles[i];

			// and move it forward dependent on the mouseY position.
			bird.position.z += 1; //mouseY * 0.1;
			bird.gain.gain.value += 0.0005;		//		1 / 2000th
			bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
			bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;

			// if the bird is too close move it to the back
			if (bird.position.z > 1000) {
				bird.position.z -= 2000;
				bird.gain.gain.value = 0;


				if (~~(Math.random(1)*2)) {
					// bird.sound.stop();
					// bird.sound.start(0);	// start again from 0
					if (mal) {
						bird.sound.buffer = buffers[3];			// load "screaming"
						bird.sound.buffer.loopEnd = bird.sound.buffer.duration;
					} else {
						bird.sound.buffer = buffers[0];			// load "ambience"
						bird.sound.buffer.loopEnd = bird.sound.buffer.duration;
					}
				}

			}

		}
 		renderer.render( scene, camera );
	}


	// --------------------------------------------------
	// AUDIO
	// --------------------------------------------------


	// --------------------------------------------------
	// SETUP
	// --------------------------------------------------

	function makeParticles() {
		// function makeParticillators() {

		var bird;
		// var drone;
		var gain;
		var now = context.currentTime;

		for ( var i = 0; i < numberOfBirds; i++ ) {

			bird = particles[i] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:0xff0000 } ) );
			bird.phase = Math.floor( Math.random() * 62.83 );
			bird.position.x = Math.random() * 1000 - 500;
			bird.position.y = Math.random() * 1000 - 500;
			bird.position.z = Math.random() * 2000 - 1000;

			// we want the bird travelling along the z-axis
			bird.rotation.y = Math.atan2( -1, 0 );  // Math.atan2( 1, 0 ); "backwards"
			bird.rotation.z = 0; // Math.asin( 1 );


			bird.doubleSided = true;
			// bird.scale.x = bird.scale.y = bird.scale.z = 10;


			///////////////////////////////////////////////////////////////////////////////////////


			// drone = sources[i];		// loadWaveTables haven't yet loaded Create ref and.....?
			bird.sound = context.createBufferSource();
			bird.sound.loop = true;

			bird.gain = context.createGain();
			bird.gain.gain.value = 0.0; 		// TBD by distance

			bird.sound.connect(bird.gain);
			bird.gain.connect(context.destination);

			///////////////////////////////////////////////////////////////////////////////////////

			scene.add( bird );

		}
	}


	function loadWaveTables() {

		var loadedCount = 0,
			numWaves = waveNames.length;

		for (var i = 0; i < numWaves; ++i) {
			var name = waveNames[i];

			sources[i] = new WaveTable(name, context);
			sources[i].load(function(waveTable) {
				loadedCount++;
				if (loadedCount == numWaves) {

					for ( var j = buffers.length; j--; ) {

						var frequency = 440;	// buffers[j].pitch;
						var pitchRate = frequency * waveList[0].getRateScale();		//     == buffer.getWaveTableSize() / buffer.getSampleRate();
						buffers[j].buffer = waveList[0].getWaveDataForPitch(pitchRate);

					}

				}
			});
		}
	}


	function loadBuffers() {

		var loadedCount = 0;
		var frameCount = context.sampleRate * 2.0;

		bufferNames.forEach(function(name, i) {

			var request = new XMLHttpRequest();

			request.open('GET', '/waves/audio/raw/'+name, true);
			request.responseType = 'arraybuffer';

			request.onload = function() {
				context.decodeAudioData(
					request.response,
					function onSuccess(buffer) {
						buffers[i] = buffer;

						loadedCount++;
						if (loadedCount == bufferNames.length) {
							for (var j = 0; j < numberOfBirds; j++) {
								var freq = Math.abs(particles[j].position.y);		// why not...
								var here = (Math.abs(particles[j].position.z) / 1000) * buffers[0].duration;

								// console.log(freq, here);
        						// particles[j].sound.playbackRate.value = freq;


								particles[j].sound.buffer = buffers[0];			// load "ambience" buffer into all birds. "screaming" is good, too
								particles[j].sound.start(0, here);
							}
						}

					},
					function() { console.log('could not load: '+name); }
				);
			}

			request.onerror = function() {
				console.log('error loading IR');
			}

			request.send();

		});
	}


	function grid() {
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( - 500, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 500, 0, 0 ) );

		for ( var i = 0; i <= 20; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.2 } ) );
			line.position.z = ( i * 50 ) - 500;
			scene.add( line );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.2 } ) );
			line.position.x = ( i * 50 ) - 500;
			line.rotation.y = 90 * Math.PI / 180;
			scene.add( line );

		}
	}


	// --------------------------------------------------
	// USER INTERACTION
	// --------------------------------------------------

	function onMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	function onResize(event) {
		renderer.setSize( window.innerWidth, window.innerHeight );
	}


	// --------------------------------------------------
	// KICKOFF
	// --------------------------------------------------

	function initVideo() {

		// params: field of view, aspect ratio for render output, near and far clipping plane.
		// camera = new THREE.OrthographicCamera(80, window.innerWidth/window.innerHeight, 1, 4000);
 		// camera = new THREE.Camera(80, window.innerWidth/window.innerHeight, 1, 4000);
		camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 1, 4000);

		// move the camera backwards so we can see stuff! (default position is 0,0,0 )
		camera.position.z = 200;
		camera.position.y = 300;
		camera.position.x = -500;

		// the scene contains all the 3D object data
		scene = new THREE.Scene();
		scene.add(camera);

		// figure out what the stuff in the scene looks like, draws it
		// renderer = new THREE.WebGLRenderer();
		renderer = new THREE.CanvasRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		// the renderer's canvas domElement is added to the body
		document.body.appendChild( renderer.domElement );

		// setup our intial state
		grid();
		makeParticles();
		camera.lookAt( scene.position );

		animate();

		/*
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		document.body.appendChild( stats.domElement );
		*/
	}

	function initAudio() {

		if (window.AudioContext) {
			context = new window.AudioContext();
		} else {
			alert('No audio support');
			return;
		}

		// loadWaveTables();
		loadBuffers();
	}


	return {
		wavywavewave: function(options) {

			if ( !window.requestAnimationFrame ) {
				window.requestAnimationFrame = ( function() {
					return window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function( callback, element ) {
						window.setTimeout( callback, 1000 / 60 );
					};
				} )();
			}

			// add event listeners
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'resize', onResize, false );

			initAudio();
			initVideo();

		}
	}

});

var waves = new WAVES();
window.onload = waves.wavywavewave;







