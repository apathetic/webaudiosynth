
// --------------------------
// MALCONTENT
// --------------------------

var MALCONTENT = (function(){

	var stats,
		camera, scene, renderer,
		mouseX = 0, mouseY = 0,
		particleSystem, particles, numParticles = 2000, 	// cannot add / remove particles easily, so create them all at once. Set an upper bound
		tracks = [], numTracks = 100;

	var VIEW_ANGLE = 75,
	    NEAR = 1,
	    FAR = 4000;


	function animate() {

		requestAnimationFrame( animate );
		// stats.update();


		var timer = Date.now() * 0.0001;

		camera.position.x = Math.cos( timer ) * 200;
		camera.position.z = Math.sin( timer ) * 200;
		camera.lookAt( scene.position );
		// ..... camera.position.z =  mouseY * 0.1;



		// iterate through every particle
		var pCount = numParticles;
		while( pCount-- ) {

 			var particle = particles.vertices[pCount];

			// check if we need to reset (ie. is offscreen)
/*
			if ( particle.x < -500 ) {
				particle.x = 500;
				particle.velocity.x = 0;
			}

			// update the velocity
			particle.velocity.x -= Math.random() * .1;
*/
			if ( particle.z < -500 ) {
				particle.z = 500;
				particle.velocity.z = 0;
			}
			particle.velocity.z -= Math.random() * 0.1;


			// and the position
			particle.add ( particle.velocity );
		}

		// Flag to the particle system that we've changed its vertices.
		// This is the dirty little secret.
		particleSystem.geometry.__dirtyVertices = true;

 		renderer.render( scene, camera );

	}

	//

	function calculateTracks() {
		// holds general "properties" for each track
		// ie. average particle length, speed
		for ( var i = 0; i < numTracks; i++ ) {
			tracks[i] = { baseLength: 1, baseSpeed: 1 };
		}

		// height of each track, -1 for the space in between them
	}


	function killParticle() {
		// drop alpha to zero

	}


	function makeParticles() {
		var material,
			// numParticlesPerTrack = numParticles / numTracks,
			particleHeight = Math.floor(window.innerHeight / numTracks);		// "trackHeight"


		particles = new THREE.Geometry();
		material = new THREE.ParticleBasicMaterial({
			color: 0xff0000,
			size: 5

		});

		// now create the individual particles
		for ( var p = 0; p < numParticles; p++ ) {

			// create a particle with random
			var pX = (Math.random() * 1000 - 500),
				pY = 0,
				pZ = (Math.random() * 1000 - 500),
				particle = new THREE.Vector3 (pX, pY, pZ);

			// create a velocity vector
			particle.velocity = new THREE.Vector3 ( 0, 0, -Math.random() );

			// add it to the geometry
			particles.vertices.push(particle);

		}

		// create the particle system
		particleSystem = new THREE.ParticleSystem( particles, material );

		particleSystem.sortParticles = true;

		// scene.addChild(particleSystem);
		scene.add(particleSystem);

	}


	function onMouseMove(event) {
		// store the mouseX and mouseY position
		mouseX = event.clientX;
		mouseY = event.clientY;
	}


	function grid(hexcolor) {
		hexcolor = (hexcolor==null) ? 0xffffff : hexcolor;

		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( -500, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 500, 0, 0 ) );

		for ( var i = 0; i <= 20; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: hexcolor, opacity: 0.2 } ) );
			line.position.z = ( i * 50 ) - 500;
			scene.add( line );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.2 } ) );
			line.position.x = ( i * 50 ) - 500;
			line.rotation.y = 90 * Math.PI / 180;
			scene.add( line );

		}
	}


	function init() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		renderer = new THREE.WebGLRenderer();
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, window.innerWidth/window.innerHeight, NEAR, FAR);
		// camera = new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 1000.0);
		scene = new THREE.Scene();

		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.position.y = 100;	// 652
		camera.lookAt( scene.position );
		scene.add(camera);

		// the renderer's canvas domElement is added to the body
		document.body.appendChild( renderer.domElement );


		grid(0xffffff);
		calculateTracks();
		makeParticles();



		// add the mouse move listener
		document.addEventListener( 'mousemove', onMouseMove, false );


		// stats = new Stats();
		// stats.domElement.style.position = 'absolute';
		// stats.domElement.style.top = '0px';
		// document.body.appendChild( stats.domElement );
	}


	return {
		content: function(options) {
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
 			if ( !Detector.webgl ) Detector.addGetWebGLMessage();

			init();
			animate();

		}
	}

});

var mal = new MALCONTENT();
window.onload = mal.content;







