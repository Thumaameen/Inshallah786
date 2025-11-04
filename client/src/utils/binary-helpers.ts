// Binary Conversion Helpers

export function uint8ArrayToArrayBuffer(uint8Array: Uint8Array): ArrayBuffer {
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength
  );
}

export function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}
