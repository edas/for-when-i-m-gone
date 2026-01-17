import { describe, it, expect } from 'vitest';
import {
  generateAES256Key,
  encryptBuffer,
  decryptBuffer,
  textToBuffer,
  bufferToText,
  type EncryptedData,
} from './aes';

describe('AES Encryption and Decryption', () => {
  describe('textToBuffer and bufferToText', () => {
    it('should convert text to buffer and back to text', () => {
      const originalText = 'Hello, World!';
      const buffer = textToBuffer(originalText);
      const convertedText = bufferToText(buffer);
      expect(convertedText).toBe(originalText);
    });

    it('should handle empty string', () => {
      const originalText = '';
      const buffer = textToBuffer(originalText);
      const convertedText = bufferToText(buffer);
      expect(convertedText).toBe(originalText);
    });

    it('should handle unicode characters', () => {
      const originalText = 'Hello, 世界! 🌍';
      const buffer = textToBuffer(originalText);
      const convertedText = bufferToText(buffer);
      expect(convertedText).toBe(originalText);
    });

    it('should handle multiline text', () => {
      const originalText = 'Line 1\nLine 2\nLine 3';
      const buffer = textToBuffer(originalText);
      const convertedText = bufferToText(buffer);
      expect(convertedText).toBe(originalText);
    });
  });

  describe('generateAES256Key', () => {
    it('should generate a valid AES-256 key', async () => {
      const key = await generateAES256Key();
      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.algorithm.name).toBe('AES-GCM');
      expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });
  });

  describe('encryptBuffer and decryptBuffer', () => {
    it('should encrypt and decrypt a buffer successfully', async () => {
      const key = await generateAES256Key();
      const originalData = textToBuffer('Test message');
      const encrypted = await encryptBuffer(key, originalData);
      const decrypted = await decryptBuffer(key, encrypted);
      const decryptedText = bufferToText(decrypted);

      expect(decryptedText).toBe('Test message');
    });

    it('should produce different ciphertext for the same plaintext (due to random IV)', async () => {
      const key = await generateAES256Key();
      const originalData = textToBuffer('Same message');
      const encrypted1 = await encryptBuffer(key, originalData);
      const encrypted2 = await encryptBuffer(key, originalData);

      // IVs should be different
      expect(encrypted1.iv).not.toEqual(encrypted2.iv);
      // Ciphertexts should be different (compare as arrays)
      const ciphertext1 = new Uint8Array(encrypted1.ciphertext);
      const ciphertext2 = new Uint8Array(encrypted2.ciphertext);
      expect(ciphertext1).not.toEqual(ciphertext2);
    });

    it('should decrypt to the same plaintext regardless of IV', async () => {
      const key = await generateAES256Key();
      const originalText = 'Same message';
      const originalData = textToBuffer(originalText);

      const encrypted1 = await encryptBuffer(key, originalData);
      const encrypted2 = await encryptBuffer(key, originalData);

      const decrypted1 = bufferToText(await decryptBuffer(key, encrypted1));
      const decrypted2 = bufferToText(await decryptBuffer(key, encrypted2));

      expect(decrypted1).toBe(originalText);
      expect(decrypted2).toBe(originalText);
    });

    it('should handle empty buffer', async () => {
      const key = await generateAES256Key();
      const originalData = textToBuffer('');
      const encrypted = await encryptBuffer(key, originalData);
      const decrypted = await decryptBuffer(key, encrypted);
      const decryptedText = bufferToText(decrypted);

      expect(decryptedText).toBe('');
    });

    it('should handle large text', async () => {
      const key = await generateAES256Key();
      const largeText = 'A'.repeat(10000);
      const originalData = textToBuffer(largeText);
      const encrypted = await encryptBuffer(key, originalData);
      const decrypted = await decryptBuffer(key, encrypted);
      const decryptedText = bufferToText(decrypted);

      expect(decryptedText).toBe(largeText);
    });

    it('should handle unicode text', async () => {
      const key = await generateAES256Key();
      const originalText = 'Hello, 世界! 🌍 こんにちは';
      const originalData = textToBuffer(originalText);
      const encrypted = await encryptBuffer(key, originalData);
      const decrypted = await decryptBuffer(key, encrypted);
      const decryptedText = bufferToText(decrypted);

      expect(decryptedText).toBe(originalText);
    });

    it('should fail to decrypt with wrong key', async () => {
      const key1 = await generateAES256Key();
      const key2 = await generateAES256Key();
      const originalData = textToBuffer('Secret message');
      const encrypted = await encryptBuffer(key1, originalData);

      await expect(decryptBuffer(key2, encrypted)).rejects.toThrow();
    });

    it('should fail to decrypt with wrong IV', async () => {
      const key = await generateAES256Key();
      const originalData = textToBuffer('Secret message');
      const encrypted = await encryptBuffer(key, originalData);

      // Create encrypted data with wrong IV
      const wrongEncrypted: EncryptedData = {
        ciphertext: encrypted.ciphertext,
        iv: crypto.getRandomValues(new Uint8Array(12)),
      };

      await expect(decryptBuffer(key, wrongEncrypted)).rejects.toThrow();
    });

    it('should fail to decrypt with corrupted ciphertext', async () => {
      const key = await generateAES256Key();
      const originalData = textToBuffer('Secret message');
      const encrypted = await encryptBuffer(key, originalData);

      // Corrupt the ciphertext
      const corruptedCiphertext = new Uint8Array(encrypted.ciphertext);
      corruptedCiphertext[0] ^= 0xff; // Flip some bits

      const corruptedEncrypted: EncryptedData = {
        ciphertext: corruptedCiphertext.buffer,
        iv: encrypted.iv,
      };

      await expect(decryptBuffer(key, corruptedEncrypted)).rejects.toThrow();
    });
  });

  describe('end-to-end encryption workflow', () => {
    it('should encrypt text, store, and decrypt later', async () => {
      // Simulate storing encrypted data
      const key = await generateAES256Key();
      const secretText = 'My secret password: 12345';
      const buffer = textToBuffer(secretText);
      const encrypted = await encryptBuffer(key, buffer);

      // Simulate retrieving and decrypting
      const decryptedBuffer = await decryptBuffer(key, encrypted);
      const decryptedText = bufferToText(decryptedBuffer);

      expect(decryptedText).toBe(secretText);
    });

    it('should handle multiple encryptions with the same key', async () => {
      const key = await generateAES256Key();
      const messages = ['Message 1', 'Message 2', 'Message 3'];

      for (const message of messages) {
        const buffer = textToBuffer(message);
        const encrypted = await encryptBuffer(key, buffer);
        const decrypted = await decryptBuffer(key, encrypted);
        const decryptedText = bufferToText(decrypted);
        expect(decryptedText).toBe(message);
      }
    });
  });
});
