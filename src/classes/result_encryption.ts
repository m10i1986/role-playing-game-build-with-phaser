// サーバーから受け取ったECDH(P-256)公開鍵を使い、送信データをECIES(ECDH + AES-GCM)方式で暗号化する

// 暗号化済みペイロード(サーバーへ送信するボディの形)
export type EncryptedPayload = {
    ephemeralPublicKey: string; // 送信のたびに生成する一時鍵ペアの公開鍵(Base64/raw形式)
    iv: string; // AES-GCMの初期化ベクトル(Base64)
    ciphertext: string; // 暗号化されたJSON本文(Base64)
};

const EC_CURVE = "P-256";
const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH_BYTES = 12;

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

// URLクエリパラメータで渡されたBase64形式の公開鍵(raw形式)をCryptoKeyへ変換する
async function importServerPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
    const rawKey = base64ToBytes(publicKeyBase64);
    return crypto.subtle.importKey("raw", rawKey, { name: "ECDH", namedCurve: EC_CURVE }, false, []);
}

// サーバー公開鍵に対してECDHで共有鍵(AES-GCM鍵)を導出する
async function deriveSharedAesKey(serverPublicKey: CryptoKey, ephemeralPrivateKey: CryptoKey): Promise<CryptoKey> {
    return crypto.subtle.deriveKey(
        { name: "ECDH", public: serverPublicKey },
        ephemeralPrivateKey,
        { name: "AES-GCM", length: AES_KEY_LENGTH },
        false,
        ["encrypt"],
    );
}

// 任意のオブジェクトをJSON化し、サーバー公開鍵で暗号化する(ECIES: ECDH + AES-GCM)
export async function encryptResultPayload(payload: unknown, serverPublicKeyBase64: string): Promise<EncryptedPayload> {
    const serverPublicKey = await importServerPublicKey(serverPublicKeyBase64);

    const ephemeralKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: EC_CURVE }, true, [
        "deriveKey",
    ]);
    const aesKey = await deriveSharedAesKey(serverPublicKey, ephemeralKeyPair.privateKey);

    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH_BYTES));
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, plaintext);

    const ephemeralPublicKeyRaw = await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey);

    return {
        ephemeralPublicKey: bytesToBase64(new Uint8Array(ephemeralPublicKeyRaw)),
        iv: bytesToBase64(iv),
        ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    };
}
