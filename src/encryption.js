import SSSS from "ssss-js";

const byteToHexLookupTable = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, '0'));

function bufferToHex(buff) {
    let hexString = '';
    const array = new Uint8Array(buff)
    for (let index = 0; index < array.length; index++) {
        hexString += byteToHexLookupTable[array[index]];
    }
    return hexString;
}

async function generateKey({ encryptionAlgorithm, encryptionKeyLength }) {
    const keyType = { name: encryptionAlgorithm, length: encryptionKeyLength }
    const extractable = true
    const keyUsages = ["encrypt", "decrypt"]
    const encryptionKey = await window.crypto.subtle.generateKey(keyType, extractable, keyUsages)
    return encryptionKey
}

async function encryptSecret({ secret, encryptionKey, encryptionAlgorithm }) {
    const iv = window.crypto.getRandomValues(new Uint8Array(96)); // for AES-GCM
    const algorithm = { name: encryptionAlgorithm, iv };
    const encodedSecret = new TextEncoder().encode(secret);
    const encryptedData = await window.crypto.subtle.encrypt(algorithm, encryptionKey, encodedSecret);
    return encryptedData
}

async function splitKey({ threshold, shares, encryptionKey }) {
    const rawKey = await window.crypto.subtle.exportKey("raw", encryptionKey)  // ArrayBuffer
    const hexKey = bufferToHex(rawKey)
    const hexMode = true
    const ssss = new SSSS(threshold, shares, hexMode);
    const prefix = ''
    const options = {}
    const tokens = await ssss.split(hexKey, prefix, options);
    return tokens
}

export async function encrypt({ secret, shares, threshold, encryptionAlgorithm, encryptionKeyLength }) {
    const encryptionKey = await generateKey({ encryptionAlgorithm, encryptionKeyLength })
    const encryptedData = await encryptSecret({ secret, encryptionKey, encryptionAlgorithm })
    const shamirTokens = (await splitKey({ threshold, shares, encryptionKey }))[0]
    return {
        encryptionAlgorithm,
        encryptionKeyLength,
        encryptedData,
        shamirTokens,
    }
}