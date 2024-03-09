import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 300 });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#1b3984';

// These variables are here because we will later test them to see
// if they contain any data.
let geometry = null;
let material = null;
let particles = null;
const generateGalaxy = () => {
	// Destroying old mesh
	if (particles !== null) {
		geometry.dispose();
		material.dispose();
		scene.remove(particles);
	}

	//  Generating the base buffer geometry.
	geometry = new THREE.BufferGeometry();

	// Creating the positions array.
	const positions = new Float32Array(parameters.count * 3);

	// Creating the colors array.
	const colors = new Float32Array(parameters.count * 3);
	const colorInside = new THREE.Color(parameters.insideColor);
	const colorOutside = new THREE.Color(parameters.outsideColor);

	// Populating the positions array with random values.
	for (let i = 0; i < parameters.count; i++) {
		const i3 = i * 3;
		// Getting a random radius between 0 and our parameters.radius.
		const radius = Math.random() * parameters.radius;
		// This angle will be used for the spiral shape of the galaxy.
		const spinAngle = radius * parameters.spin;
		// Using the module operator to get a random angle.
		const branchAngle =
			((i % parameters.branches) / parameters.branches) * Math.PI * 2;
		// Adding randomness to the radius. In order to get negative values, we
		// randomly multiply the result by 1 or -1. We don't do it directly
		// inside the pow function because it does not always work.
		const randomX =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1);
		const randomY =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1);
		const randomZ =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1);

		// Populating the branches
		positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
		positions[i3 + 1] = randomY;
		positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

		// Colors
		// Creating a color based on the distance from the center of the galaxy.
		const mixedColor = colorInside.clone();
		mixedColor.lerp(colorOutside, radius / parameters.radius);
		colors[i3 + 0] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}
	// Converting the positions array to an attribute.
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	// Converting the colors array to an attribute.
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	// Creating the material.
	material = new THREE.PointsMaterial({
		size: parameters.size,
		sizeAttenuation: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});
	// Creating the points.
	particles = new THREE.Points(geometry, material);
	scene.add(particles);
};
generateGalaxy();

// GUI
gui
	.add(parameters, 'count')
	.min(100)
	.max(1000000)
	.step(100)
	.name('Stars count')
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, 'size')
	.min(0.001)
	.max(0.1)
	.step(0.001)
	.name('Stars size')
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, 'radius')
	.min(1)
	.max(20)
	.step(0.1)
	.name('Galaxy radius')
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, 'branches')
	.min(2)
	.max(20)
	.step(1)
	.name('Galaxy branches')
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, 'spin')
	.min(-5)
	.max(5)
	.step(0.001)
	.name('Branch spin angle')
	.onFinishChange(generateGalaxy);

gui
	.add(parameters, 'randomnessPower')
	.min(1)
	.max(10)
	.step(0.001)
	.name('Stars randomness power')
	.onFinishChange(generateGalaxy);
gui
	.addColor(parameters, 'insideColor')
	.name('Inside color')
	.onFinishChange(generateGalaxy);
gui
	.addColor(parameters, 'outsideColor')
	.name('Outside color')
	.onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 3;
camera.position.y = 4;
camera.position.z = 7;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Rotate the galaxy
	particles.rotation.y = elapsedTime * 0.1;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
