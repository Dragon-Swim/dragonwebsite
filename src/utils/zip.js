/**
 * A minimal ZIP writer — store-only (no compression).
 *
 * Why hand-rolled instead of a dependency
 * ---------------------------------------
 * The only thing this app has to zip is a meet-entry package: one `.cl2` of about
 * 30 KB plus a short README. Compression would not move the needle, and the repo
 * otherwise ships zero zip libraries — adding one (jszip/fflate) for 30 KB of
 * already-dense text is a poor trade against the supply-chain and bundle cost.
 * A store-only ZIP is a small, fully specified structure and is verified by a
 * unit test that unpacks what this file writes.
 *
 * What is implemented (enough for every reader: Windows, macOS, Meet Manager)
 *   PK\x03\x04  local file header
 *   PK\x01\x02  central directory entry
 *   PK\x05\x06  end-of-central-directory
 * Method 0 (stored), CRC-32 per entry, UTF-8 name flag, DOS timestamp.
 *
 * Not implemented, on purpose: compression, zip64 (a >4 GB or >65 535-entry
 * archive has no business being a meet entry file), encryption, directories.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
})();

/** CRC-32 of a byte array (the value ZIP stores per entry). */
export function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** JavaScript Date → the 16-bit DOS date and time pair ZIP wants. */
export function dosDateTime(date = new Date()) {
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = Math.max(1980, d.getFullYear());
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time: time & 0xFFFF, date: day & 0xFFFF };
}

/** Encode a string as UTF-8 bytes without depending on Node or TextEncoder. */
export function utf8Bytes(text) {
  const str = String(text ?? '');
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  const out = [];
  for (let i = 0; i < str.length; i += 1) {
    let code = str.codePointAt(i);
    if (code > 0xFFFF) i += 1;                    // surrogate pair: consume both
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
    else if (code < 0x10000) out.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    else out.push(0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
  }
  return Uint8Array.from(out);
}

class ByteWriter {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }

  bytes(arr) {
    this.chunks.push(arr);
    this.length += arr.length;
    return this;
  }

  u16(value) {
    return this.bytes(Uint8Array.of(value & 0xFF, (value >>> 8) & 0xFF));
  }

  u32(value) {
    return this.bytes(Uint8Array.of(
      value & 0xFF, (value >>> 8) & 0xFF, (value >>> 16) & 0xFF, (value >>> 24) & 0xFF,
    ));
  }

  toUint8Array() {
    const out = new Uint8Array(this.length);
    let at = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, at);
      at += chunk.length;
    }
    return out;
  }
}

/**
 * Build a ZIP archive.
 *
 * @param {Array<{name: string, data: string|Uint8Array, date?: Date}>} files
 * @returns {Uint8Array} the archive bytes
 */
export function zipStore(files = [], { date = new Date() } = {}) {
  const w = new ByteWriter();
  const central = [];
  const stamp = dosDateTime(date);
  let offset = 0;

  for (const file of files) {
    const name = String(file.name || '').replace(/\\/g, '/');
    if (!name) throw new Error('zipStore: every entry needs a name');
    const nameBytes = utf8Bytes(name);
    const data = typeof file.data === 'string' ? utf8Bytes(file.data) : toBytes(file.data);
    const crc = crc32(data);

    // Local file header
    w.u32(0x04034B50);            // signature "PK\3\4"
    w.u16(20);                    // version needed (2.0)
    w.u16(0x0800);                // flags: UTF-8 names
    w.u16(0);                     // method 0 = stored
    w.u16(stamp.time);
    w.u16(stamp.date);
    w.u32(crc);
    w.u32(data.length);           // compressed size == uncompressed for stored
    w.u32(data.length);
    w.u16(nameBytes.length);
    w.u16(0);                     // extra field length
    w.bytes(nameBytes);
    w.bytes(data);

    central.push({ nameBytes, crc, size: data.length, offset });
    offset += 30 + nameBytes.length + data.length;
  }

  const centralStart = offset;
  for (const entry of central) {
    w.u32(0x02014B50);            // signature "PK\1\2"
    w.u16(20);                    // version made by
    w.u16(20);                    // version needed
    w.u16(0x0800);                // flags: UTF-8
    w.u16(0);                     // method: stored
    w.u16(stamp.time);
    w.u16(stamp.date);
    w.u32(entry.crc);
    w.u32(entry.size);
    w.u32(entry.size);
    w.u16(entry.nameBytes.length);
    w.u16(0);                     // extra length
    w.u16(0);                     // comment length
    w.u16(0);                     // disk number
    w.u16(0);                     // internal attributes
    w.u32(0);                     // external attributes
    w.u32(entry.offset);          // offset of the local header
    w.bytes(entry.nameBytes);
  }
  const centralSize = w.length - centralStart;

  // End of central directory
  w.u32(0x06054B50);              // signature "PK\5\6"
  w.u16(0);                       // this disk
  w.u16(0);                       // disk with the central directory
  w.u16(central.length);          // entries on this disk
  w.u16(central.length);          // entries total
  w.u32(centralSize);
  w.u32(centralStart);
  w.u16(0);                       // comment length

  return w.toUint8Array();
}

function toBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (Array.isArray(data)) return Uint8Array.from(data);
  if (data && typeof data.buffer === 'object' && typeof data.byteLength === 'number') {
    return new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
  }
  throw new Error('zipStore: data must be a string or bytes');
}
