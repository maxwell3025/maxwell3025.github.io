/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/ts-complex-numbers/lib/complex.js":
/*!********************************************************!*\
  !*** ./node_modules/ts-complex-numbers/lib/complex.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.complex = void 0;\r\nclass complex {\r\n    /**\r\n    * Construct a new complex number from two real numbers\r\n    * @param real - The real component\r\n    * @param imaginary - The imaginary component\r\n    * @returns Complex number constructed from given parameters\r\n    */\r\n    constructor(real, imaginary) {\r\n        this._real = real;\r\n        this._img = imaginary;\r\n    }\r\n    /**\r\n    * Get the real component of the complex number\r\n    * @returns The real component - this._real\r\n    */\r\n    get real() {\r\n        return this._real;\r\n    }\r\n    /**\r\n    * Get the imaginary component of the complex number\r\n    * @returns The imaginary component - this._imaginary\r\n    */\r\n    get img() {\r\n        return this._img;\r\n    }\r\n    /**\r\n    * Add two complex numbers\r\n    * @param other - The 2nd complex number operand\r\n    * @returns x + other\r\n    */\r\n    add(other) {\r\n        return new complex(this._real + other.real, this._img + other.img);\r\n    }\r\n    /**\r\n    * Subtract two complex numbers\r\n    * @param other - The 2nd complex number operand\r\n    * @returns x - other\r\n    */\r\n    sub(other) {\r\n        return new complex(this._real - other.real, this._img - other.img);\r\n    }\r\n    /**\r\n    * Multiply two complex numbers\r\n    * @param other - The 2nd complex number operand\r\n    * @returns The product of x / other\r\n    */\r\n    mult(other) {\r\n        return new complex(this.real * other.real - this._img * other.img, this.real * other.img + this._img * other.real);\r\n    }\r\n    /**\r\n    * Divide two complex numbers\r\n    * @param other - The 2nd complex number operand\r\n    * @returns The result of the division x / other\r\n    */\r\n    div(other) {\r\n        /* Complex division:\r\n            ac + bd     bc - ad\r\n            -------- + -------- i\r\n            c^2 + d^2  c^2 + d^2\r\n        */\r\n        let ac = this._real * other.real;\r\n        let bd = this._img * other.img;\r\n        let bc = this._img * other.real;\r\n        let ad = this._real * other.img;\r\n        let cc = other.real * other.real;\r\n        let dd = other.img * other.img;\r\n        return new complex((ac + bd) / (cc + dd), (bc - ad) / (cc + dd));\r\n    }\r\n    /**\r\n    * Scalar multiply a complex number, by a real number lambda\r\n    * @param lambda - The real number scaling factor\r\n    * @returns The scaled version of the complex number\r\n    */\r\n    scalarMult(lambda) {\r\n        return new complex(lambda * this.real, lambda * this.img);\r\n    }\r\n    /**\r\n    * Get the magnitude(absolute value) of the complex number\r\n    * @returns The magnitude: sqroot(a^2 + b^2)\r\n    */\r\n    mag() {\r\n        return Math.sqrt((this.real * this.real) + (this.img * this.img));\r\n    }\r\n    /**\r\n    * Get the conjugate of the complex number\r\n    * @returns The conjugate of the complex number:  a + (-bi)\r\n    */\r\n    conj() {\r\n        return new complex(this.real, -this.img);\r\n    }\r\n    /**\r\n    * Get the negation of the complex number\r\n    * @returns The negation of the complex number:  -a + (-bi)\r\n    */\r\n    neg() {\r\n        return new complex(-this.real, -this.img);\r\n    }\r\n    /**\r\n    * Get the arguement of the complex number, the angle in radians with the x-axis in polar coordinates\r\n    * @returns The arguement of the complex number\r\n    */\r\n    arg() {\r\n        return Math.atan2(this.img, this.real);\r\n    }\r\n    /**\r\n    * Get the exponential of the complex number\r\n    * @returns The exponential of the complex number: (exp(a) * cos(b)) + (exp(a) * sin(b))(i)\r\n    */\r\n    exp() {\r\n        return new complex(Math.exp(this.real) * Math.cos(this.img), Math.exp(this.real) * Math.sin(this.img));\r\n    }\r\n    /**\r\n    * Get the natural base e log of the complex number\r\n    * @returns The natural base e log of the complex number\r\n    */\r\n    log() {\r\n        return new complex(Math.log(this.mag()), Math.atan2(this.img, this.real));\r\n    }\r\n    /**\r\n    * Get the sine of the complex number\r\n    * @returns The sine of the complex number\r\n    */\r\n    sin() {\r\n        return new complex(Math.cosh(this.img) * Math.sin(this.real), Math.sinh(this.img) * Math.cos(this.real));\r\n    }\r\n    /**\r\n    * Get the cosine of the complex number\r\n    * @returns The cosine of the complex number\r\n    */\r\n    cos() {\r\n        return new complex(Math.cosh(this.img) * Math.cos(this.real), -Math.sinh(this.img) * Math.sin(this.real));\r\n    }\r\n    /**\r\n    * Get the tangent of the complex number\r\n    * @returns The tangent of the complex number\r\n    */\r\n    tan() {\r\n        // defined in terms of the identity tan(z) = sin(z) / cos(z)\r\n        let num = this.sin();\r\n        let denom = this.cos();\r\n        return num.div(denom);\r\n    }\r\n    /**\r\n    * Static method to construct a complex number in rectangular form from polar coordinates\r\n    * @param theta - The angle/arguement\r\n    * @param magnitude - The magnitude\r\n    * @returns Complex number in rectangular coordinates constructed from the arguement theta & the magnitude\r\n    */\r\n    static fromPolar(theta, magnitude) {\r\n        return new complex(magnitude * Math.cos(theta), magnitude * Math.sin(theta));\r\n    }\r\n    /**\r\n    * Get the complex number's polar coordinates as a tuple\r\n    * @returns A tuple containing the arguement/angle of the complex number as the 1st element, and the magnitude as the 2nd\r\n    */\r\n    toPolar() {\r\n        let mag = this.mag();\r\n        let theta = this.arg();\r\n        return [theta, mag];\r\n    }\r\n    /**\r\n    * Get the complex number as a string\r\n    * @returns String representation of the complex number\r\n    */\r\n    toString() {\r\n        if (Math.sign(this.img) === -1) {\r\n            // bit of a dirty hack..\r\n            return this.real + \" - \" + -this.img + \"i\";\r\n        }\r\n        else {\r\n            return this.real + \" + \" + this.img + \"i\";\r\n        }\r\n    }\r\n    /**\r\n    * Compare two complex numbers for equality\r\n    * @param other - The 2nd complex number operand\r\n    * @returns true if equal, else false\r\n    */\r\n    equals(other) {\r\n        if (this.real === other.real && this.img === other.img) {\r\n            return true;\r\n        }\r\n        else {\r\n            return false;\r\n        }\r\n    }\r\n}\r\nexports.complex = complex;\r\n\n\n//# sourceURL=webpack:///./node_modules/ts-complex-numbers/lib/complex.js?");

/***/ }),

/***/ "./_src/quantumcomputer/quantum.ts":
/*!*****************************************!*\
  !*** ./_src/quantumcomputer/quantum.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClassicalState\": () => (/* binding */ ClassicalState),\n/* harmony export */   \"QuantumState\": () => (/* binding */ QuantumState)\n/* harmony export */ });\n/* harmony import */ var ts_complex_numbers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ts-complex-numbers */ \"./node_modules/ts-complex-numbers/lib/complex.js\");\n\r\nvar ClassicalState = /** @class */ (function () {\r\n    function ClassicalState(bitCount, value) {\r\n        if (value === void 0) { value = 0; }\r\n        this.bitCount = bitCount;\r\n        this.bits = [];\r\n        var bitMask = 1;\r\n        for (var bitIndex = 0; bitIndex < bitCount; bitIndex++) {\r\n            this.bits.push((bitMask & value) > 0);\r\n            bitMask = bitMask << 1;\r\n        }\r\n    }\r\n    Object.defineProperty(ClassicalState.prototype, \"value\", {\r\n        get: function () {\r\n            var value = 0;\r\n            for (var i = 0; i < this.bitCount; i++) {\r\n                if (this.bits[i])\r\n                    value += Math.pow(2, i);\r\n            }\r\n            return value;\r\n        },\r\n        enumerable: false,\r\n        configurable: true\r\n    });\r\n    ClassicalState.prototype.clone = function () {\r\n        return new ClassicalState(this.bitCount, this.value);\r\n    };\r\n    ClassicalState.prototype.toString = function () {\r\n        var output = '|';\r\n        this.bits.map(function (a) { return a; }).reverse().forEach(function (bit) {\r\n            output += bit ? '1' : '0';\r\n        });\r\n        output += '>';\r\n        return output;\r\n    };\r\n    return ClassicalState;\r\n}());\r\n\r\nfunction ennumerateStates(bitCount) {\r\n    var valueCount = Math.pow(2, bitCount);\r\n    var output = [];\r\n    for (var value = 0; value < valueCount; value++) {\r\n        output.push(new ClassicalState(bitCount, value));\r\n    }\r\n    return output;\r\n}\r\nvar QuantumState = /** @class */ (function () {\r\n    function QuantumState(bitCount, value) {\r\n        if (value === void 0) { value = 0; }\r\n        var stateCount = Math.pow(2, bitCount);\r\n        this.bitCount = bitCount;\r\n        this.amplitudes = [];\r\n        for (var i = 0; i < value; i++) {\r\n            this.amplitudes.push(new ts_complex_numbers__WEBPACK_IMPORTED_MODULE_0__.complex(0, 0));\r\n        }\r\n        this.amplitudes.push(new ts_complex_numbers__WEBPACK_IMPORTED_MODULE_0__.complex(1, 0));\r\n        for (var i = 0; i < stateCount - value - 1; i++) {\r\n            this.amplitudes.push(new ts_complex_numbers__WEBPACK_IMPORTED_MODULE_0__.complex(0, 0));\r\n        }\r\n    }\r\n    //TODO\r\n    QuantumState.prototype.swap = function (bitA, bitB) {\r\n        var _this = this;\r\n        if (bitB === void 0) { bitB = bitA + 1; }\r\n        var output = new QuantumState(this.bitCount);\r\n        ennumerateStates(this.bitCount).forEach(function (outputClassicalState) {\r\n            var inputClassicalState = outputClassicalState.clone();\r\n            //swap indices in input\r\n            var temp = inputClassicalState.bits[bitA];\r\n            inputClassicalState.bits[bitA] = inputClassicalState.bits[bitB];\r\n            inputClassicalState.bits[bitB] = temp;\r\n            output.amplitudes[outputClassicalState.value] =\r\n                _this.amplitudes[inputClassicalState.value];\r\n            //TODO\r\n        });\r\n        return output;\r\n    };\r\n    QuantumState.prototype.toString = function () {\r\n        var _this = this;\r\n        var output = '';\r\n        ennumerateStates(this.bitCount).forEach(function (classicalState) {\r\n            output += \"\".concat(classicalState, \": \").concat(_this.amplitudes[classicalState.value], \"\\n\");\r\n        });\r\n        return output;\r\n    };\r\n    return QuantumState;\r\n}());\r\n\r\n\n\n//# sourceURL=webpack:///./_src/quantumcomputer/quantum.ts?");

/***/ }),

/***/ "./_src/quantumcomputer/quantumcomputer.ts":
/*!*************************************************!*\
  !*** ./_src/quantumcomputer/quantumcomputer.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _quantum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./quantum */ \"./_src/quantumcomputer/quantum.ts\");\n\r\nvar myQuantumState = new _quantum__WEBPACK_IMPORTED_MODULE_0__.QuantumState(3, 1);\r\nconsole.log(\"\".concat(myQuantumState));\r\nmyQuantumState = myQuantumState.swap(0);\r\nconsole.log(\"\".concat(myQuantumState));\r\n\n\n//# sourceURL=webpack:///./_src/quantumcomputer/quantumcomputer.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./_src/quantumcomputer/quantumcomputer.ts");
/******/ 	
/******/ })()
;