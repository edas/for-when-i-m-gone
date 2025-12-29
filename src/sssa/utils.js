/**
 * This file contains the utility functions for the sssa package, 
 * converted to JS from the Go implementation.
 */

import { random_bigint, encodeBytesToHexString, decodeHexStringToBytes, trimBytesRight, encodeToUrlSafeBase64, decodeUrlSafeBase64, bigint_gcd } from './jsutils.js';  


let prime ; // BigInt

/**
 * Initializes the prime number used for modular arithmetic operations
 * @param {bigint} new_prime - The prime number to use for modular arithmetic
 */
export function initPrime(new_prime) {
    prime = new_prime;
}

/**
 * Returns a random number from the range (0, prime-1) inclusive
 * @returns {bigint} A random BigInt in the range [0, prime-1]
 * @throws {Error} If prime is not initialized
 */
function random() {
    if (!prime) {
        throw new Error('Prime not initialized');
    }
    
    return random_bigint(prime - 1n);
}



/**
 * Converts a byte array into an a 256-bit big.Int, arraied based upon size of
 * the input byte; all values are right-padded to length 256, even if the most
 * significant bit is zero.
 * @param {Uint8Array} secret - The input byte array
 * @returns {BigInt[]} Array of BigInts, each representing 256 bits
 */
function splitByteToInt(secret) {
    // Convert bytes to hex string
    const hexData = encodeBytesToHexString(secret);
    
    // Calculate how many 64-character (256-bit) chunks we need
    const count = Math.ceil(hexData.length / 64.0);
    
    // Create array of BigInts to hold results
    const result = new Array(count);
    
    // Split into 64-character chunks and convert to BigInt
    for (let i = 0; i < count; i++) {
        if ((i + 1) * 64 < hexData.length) {
            // Full chunk
            result[i] = BigInt('0x' + hexData.substring(i * 64, (i + 1) * 64));
        } else {
            // Last chunk - pad with zeros
            const remaining = hexData.substring(i * 64);
            const padded = remaining + '0'.repeat(64 - remaining.length);
            result[i] = BigInt('0x' + padded);
        }
    }
    
    return result;
}

/**
 * Converts an array of big.Ints to the original byte array, removing any
 * least significant nulls
 * @param {BigInt[]} secret - Array of BigInts to convert
 * @returns {Uint8Array} The original byte array
 */
function mergeIntToByte(secret) {
    // Convert each BigInt to a 64-character hex string and join them
    const hexData = secret.map(int => {
        const hex = int.toString(16);
        return '0'.repeat(64 - hex.length) + hex;
    }).join('');
    
    // Convert hex string to bytes
    const bytes = decodeHexStringToBytes(hexData);
    
    // Remove trailing null bytes
    return trimBytesRight(bytes, 0);
}

/**
 * Evauluates a polynomial with coefficients specified in reverse order:
 * evaluatePolynomial([a, b, c, d], x):
 * 		returns a + bx + cx^2 + dx^3
 * @param {BigInt[]} polynomial - Array of coefficients in reverse order
 * @param {BigInt} value - The value to evaluate at
 * @returns {BigInt} The result of the polynomial evaluation
 */
function evaluatePolynomial(polynomial, value) {
    if (!prime) {
        throw new Error('Prime not initialized');
    }
    
    const last = polynomial.length - 1;
    let result = polynomial[last];
    
    for (let s = last - 1; s >= 0; s--) {
        result = (result * value + polynomial[s]) % prime;
    }
    
    return result;
}

/**
 * inNumbers(array, value) returns boolean whether or not value is in array
 * @param {BigInt[]} numbers - Array of BigInts to search in
 * @param {BigInt} value - The value to search for
 * @returns {boolean} True if value is found in array, false otherwise
 */
function inNumbers(numbers, value) {
    return numbers.some(n => n === value);
}

/**
 * Returns the big.Int number base10 in base64 representation; note: this is
 * not a string representation; the base64 output is exactly 256 bits long
 * @param {BigInt} number - The number to convert
 * @returns {string} Base64 URL-safe encoded string
 */
function toBase64(number) {
    // Convert to hex string and pad to 64 characters
    let hexData = number.toString(16);
    while (hexData.length < 64) {
        hexData = '0' + hexData;
    }
    
    // Convert hex to bytes
    const bytes = decodeHexStringToBytes(hexData);
    
    // Convert to base64 URL-safe string
    return encodeToUrlSafeBase64(bytes);
}

/**
 * Returns the number base64 in base 10 big.Int representation; note: this is
 * not coming from a string representation; the base64 input is exactly 256
 * bits long, and the output is an arbitrary size base 10 integer.
 *
 * Returns -1 on failure
 * @param {string} number - The base64 URL-safe string to convert
 * @returns {BigInt} The resulting BigInt, or -1n on failure
 */
function fromBase64(number) {
    try {
        // Convert base64 URL-safe string to bytes
        const bytes = decodeUrlSafeBase64(number);
        
        // Convert bytes to hex string
        const hexData = encodeBytesToHexString(bytes);
        
        // Convert hex string to BigInt
        return BigInt('0x' + hexData);
    } catch (error) {
        return -1n;
    }
}

/**
 * Computes the multiplicative inverse of the number on the field prime; more
 * specifically, number * inverse == 1; Note: number should never be zero
 * @param {BigInt} number - The number to find the inverse of
 * @returns {BigInt} The multiplicative inverse modulo prime
 */
function modInverse(number) {
    if (!prime) {
        throw new Error('Prime not initialized');
    }
    
    // Copy number and take modulo prime
    const copy = number % prime;
    
    // Calculate GCD and coefficients
    const [gcd, x, y] = bigint_gcd(prime, copy);
    
    // If GCD is not 1, number has no inverse
    if (gcd !== 1n) {
        throw new Error('Number has no multiplicative inverse modulo prime');
    }
    
    // Calculate result = (prime + y) % prime
    return (prime + y) % prime;
}

