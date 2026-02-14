/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// jsdom doesn't provide ResizeObserver
if (typeof globalThis.ResizeObserver === 'undefined') {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
}

// pdfjs-dist requires DOMMatrix which jsdom doesn't provide
if (typeof globalThis.DOMMatrix === 'undefined') {
	globalThis.DOMMatrix = class DOMMatrix {
		m11 = 1; m12 = 0; m13 = 0; m14 = 0;
		m21 = 0; m22 = 1; m23 = 0; m24 = 0;
		m31 = 0; m32 = 0; m33 = 1; m34 = 0;
		m41 = 0; m42 = 0; m43 = 0; m44 = 1;
		a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
		is2D = true;
		isIdentity = true;
		inverse() { return new DOMMatrix(); }
		multiply() { return new DOMMatrix(); }
		translate() { return new DOMMatrix(); }
		scale() { return new DOMMatrix(); }
		rotate() { return new DOMMatrix(); }
		transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
		toFloat64Array() { return new Float64Array(16); }
		toFloat32Array() { return new Float32Array(16); }
	} as unknown as typeof DOMMatrix;
}

