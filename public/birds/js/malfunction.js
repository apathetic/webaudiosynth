
// --------------------------
// malfunction
// --------------------------

var MALFUNCTION = (function(){

	var stats;
	var camera, scene, renderer;
	var mouseX = 0, mouseY = 0;
	var particles = [];


	function animate() {

		// render 60 times a second
		requestAnimationFrame( animate );

		render();
		// stats.update();

	}

	function render() {

		// var timer = Date.now() * 0.0001;

		// camera.position.x = Math.cos( timer ) * 200;
		// camera.position.z = Math.sin( timer ) * 200;
		// camera.lookAt( scene.position );




		// iterate through every particle
		for( var i=0; i<particles.length; i++ ) {

			particle = particles[i];

			// and move it forward dependent on the mouseY position.
			particle.position.z += 1; //mouseY * 0.1;

			particle.phase = ( particle.phase + ( Math.max( 0, particle.rotation.z ) + 0.1 )  ) % 62.83;
			particle.geometry.vertices[ 5 ].y = particle.geometry.vertices[ 4 ].y = Math.sin( particle.phase ) * 5;


			// if the particle is too close move it to the back
			if(particle.position.z > 1000) particle.position.z -= 2000;

		}
 		renderer.render( scene, camera );

	}





	function makeParticles() {

		var particle, material;

		// we're gonna move from z position -1000 (far away) to 1000 (where the camera is) and add a random particle at every pos.
/*
		for ( var zpos= -1000; zpos < 1000; zpos+=20 ) {

			// we make a particle "material" and pass it through the colour and custom particle render function we defined.
			material = new THREE.ParticleCanvasMaterial( { color:0xff3ff5, program: particleRender } );

			// make the particle
			particle = new THREE.Particle(material);

			// give it a random x and y position between -500 and 500
			particle.position.x = Math.random() * 1000 - 500;
			particle.position.y = Math.random() * 1000 - 500;

			// set its z position
			particle.position.z = zpos;

			// scale it up a bit
			particle.scale.x = particle.scale.y = 10;

			// add it to the scene
			scene.add( particle );

			// and to the array of particles.
			particles.push(particle);
		}
*/
				var bird;
				for ( var i = 0; i < 200; i ++ ) {

					bird = particles[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:0xff0000 } ) );
					bird.phase = Math.floor( Math.random() * 62.83 );
					bird.position.x = Math.random() * 1000 - 500;
					bird.position.y = Math.random() * 1000 - 500;
					bird.position.z = Math.random() * 2000 - 1000;

					// we want the bird travelling along the z-axis
					bird.rotation.y = Math.atan2( -1, 0 );  // Math.atan2( 1, 0 ); "backwards"
					bird.rotation.z = 0; // Math.asin( 1 );


					bird.doubleSided = true;
					// bird.scale.x = bird.scale.y = bird.scale.z = 10;
					scene.add( bird );
					particles.push(bird);
				}












	}


	function particleRender( context ) {

		// we get passed a reference to the canvas context
		context.beginPath();

		// and we just have to draw our shape at 0,0 ... in this case an arc from 0 to 2Pi radians -- a circle
		// context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
		context.arc( 0, 1, 0.6, 0,  Math.PI * 1.3, true );
		context.fill();
	};


	function onMouseMove(event) {
		// store the mouseX and mouseY position
		mouseX = event.clientX;
		mouseY = event.clientY;
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


	function init() {

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

		grid();
		makeParticles();
		camera.lookAt( scene.position );

		// add the mouse move listener
		document.addEventListener( 'mousemove', onMouseMove, false );

/*
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		document.body.appendChild( stats.domElement );
*/

	}


	return {
		tion: function(options) {
			if (! (this instanceof arguments.callee)) {
				return new arguments.callee(arguments);
			}

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

 			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			init();
			animate();

		}
	}

});

var malfunc = new MALFUNCTION();
window.onload = malfunc.tion;







