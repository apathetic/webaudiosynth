Audio.init();







//audio
var pulse = 100;	// generate event every 60 ms. TODO. 

// video
var container, stats;
var camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color;
var mouseX = 0, mouseY = 0;
var numParticles = 1000;

// control
var h, a, b, c;
var x, y, z;		// lorenz stuff


// =============

init();







function lorenz(){
	x += h*a*(y-x);
	y += h*(x*(b-z)-y);
	z += h*(x*y-c*z);
}
 
function init(){

	h = 0.008;
	a = 5;
	b = 15;
	c = 5/3;
	x = 4;
	y = 5;
	z = 10;




setTimeout(function(){ 
	// generator();
}, 1000);



}








function generator() {
	lorenz();
	// console.log( x*8, y*8, Math.abs(z/4) );

	Audio.playNote(x*800);
	Audio.playNote(y*800);

	var next = Math.min(5, Math.abs(z/4)*100);
	setTimeout(generator, next)

}

