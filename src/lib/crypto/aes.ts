/**
 * Génère une clé AES 256 bits en utilisant Web Crypto API
 * @returns Une promesse qui résout avec une CryptoKey AES 256 bits
 * @throws Si la génération de la clé échoue
 */
export async function generateAES256Key(): Promise<CryptoKey> {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt'] // keyUsages
    );

    return key;
  } catch (error) {
    throw new Error(`Erreur lors de la génération de la clé AES 256: ${error}`);
  }
}
