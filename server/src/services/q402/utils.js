/**
 * Base64 encoding/decoding utilities
 */

export function encodeBase64(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeBase64(str) {
    try {
        return JSON.parse(Buffer.from(str, 'base64').toString('utf-8'));
    } catch (e) {
        throw new Error('Invalid base64 string');
    }
}
