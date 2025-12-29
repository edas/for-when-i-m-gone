/*** For functions that didn't exists in JS */


/**
 * Returns a cryptographically secure random BigInt in the range [0, max] inclusive
 * @param {bigint} max - The maximum value (inclusive) for the random number
 * @returns {bigint} A random BigInt in the range [0, max]
 * @throws {Error} If max is less than or equal to 0
 */
export function random_bigint(max) {
    if (max <= 0n) {
        throw new Error('Max value must be greater than 0');
    }
    
    // Calculate the number of bytes needed to represent max
    const bitLength = max.toString(2).length;
    const byteLength = Math.ceil(bitLength / 8);
    
    // Use rejection sampling to ensure uniform distribution
    let result;
    do {
        // Generate random bytes
        const randomBytes = new Uint8Array(byteLength);
        crypto.getRandomValues(randomBytes);
        
        // Convert bytes to BigInt using hex conversion
        result = BigInt('0x' + Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));
        
        // Keep generating until we get a value in range [0, max]
    } while (result > max);
    
    return result;
}

/**
 * Converts a byte array to a hex string
 * @param {Uint8Array} bytes - The input byte array
 * @returns {string} Hex string representation
 */
export function encodeBytesToHexString(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Decode hex string to byte array
 * @param {string} hexString - The input hex string
 * @returns {Uint8Array} The decoded byte array
 */
export function decodeHexStringToBytes(hexString) {
    // Pad the string if it has an odd length
    const paddedHex = hexString.length % 2 === 1 ? '0' + hexString : hexString;
    
    return new Uint8Array(
        paddedHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );
}

/**
 * Trim a byte array from the right
 * @param {Uint8Array} bytes - The input byte array
 * @param {number} value - The value to trim from the right
 * @returns {Uint8Array} The trimmed byte array
 */
export function trimBytesRight(bytes, value) {
    let lastNonSearched = bytes.length - 1;
    while (lastNonSearched >= 0 && bytes[lastNonSearched] === value) {
        lastNonSearched--;
    }
    return bytes.slice(0, lastNonSearched + 1);
}

/**
 * Encode to URL safe base64
 * @param {Uint8Array} bytes - The input byte array
 * @returns {string} URL safe base64 string
 */
export function encodeToUrlSafeBase64(bytes) {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Decode URL-safe base64 string to byte array
 * @param {string} base64String - The URL-safe base64 string to decode
 * @returns {Uint8Array} The decoded byte array
 * @throws {Error} If the input is not a valid base64 string
 */
export function decodeUrlSafeBase64(base64String) {
    // Convert URL-safe base64 to standard base64
    const standardBase64 = base64String
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    // Add padding if needed
    const paddedBase64 = standardBase64.padEnd(
        standardBase64.length + (4 - standardBase64.length % 4) % 4,
        '='
    );
    
    // Decode base64 to binary string
    const binaryString = atob(paddedBase64);
    
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
}

/**
 * Computes the greatest common divisor of a and b using the same algorithm as Go's big.Int.GCD
 * @param {BigInt} a - First number
 * @param {BigInt} b - Second number
 * @returns {[BigInt, BigInt, BigInt]} Array containing [gcd, x, y] where gcd = ax + by
 */
export function bingint_gcd(a, b) {
    let [old_r, r] = [a, b];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];
    
    while (r !== 0n) {
        const quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
        [old_t, t] = [t, old_t - quotient * t];
    }
    
    return [old_r, old_s, old_t];
}
