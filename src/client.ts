export const isLowPowerMode = () => {
  /*
    if (navigator.getBattery) {
        navigator.getBattery().then(function(battery) {
            if (battery.level < 0.2 && !battery.charging) {
                console.log("Low Power Mode Likely Enabled (Battery below 20% and not charging)");
            }
        });
    }*/

  return matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const isDarkModeQuery = () => matchMedia("(prefers-color-scheme: dark)");

export const isDarkMode = (q: { matches: boolean } = isDarkModeQuery()) =>
  q.matches;

export const UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
export const NUMBERS = "0123456789";
export const LEGACY_SYMBOLS = "@#$%_-.";
export const EX_SYMBOLS = " !\"&'()*+,/:;<=>?[\\]^`{|}~";

export const generatePassword = (length: number, charset: string) => {
  if (charset === "") return "";

  const buffer = new Uint32Array(length);
  crypto.getRandomValues(buffer);

  let s = "";
  for (const randomValue of buffer)
    s += charset[Math.floor((randomValue / (0xffffffff + 1)) * charset.length)];
  return s;
};

export const escapeRegExp = (text: string) =>
  text.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const FORMAT_UNITS = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
  ["microsecond", 0.001],
  ["millisecond", 10 ** -6],
  ["nanosecond", 10 ** -12],
] as const;

export const formatDuration = (seconds: number) => {
  // Time of the universe
  if (seconds > 365 * 24 * 60 * 60 * 100 * 10 ** 12)
    return "longer than our universe";

  for (const [name, s] of FORMAT_UNITS) {
    if (seconds >= s) {
      const x = Math.round((seconds / s) * 10) / 10;
      return `${x} ${name}${x === 1 ? "" : "s"}`;
    }
  }
  return "no time";
};

const encodeUTF16LE = (str: string) => {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint16Array(buf);

  for (let i = 0; i < str.length; ++i) bufView[i] = str.charCodeAt(i);

  return new Uint8Array(buf);
};

const encodeUTF16BE = (str: string) => {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint8Array(buf);

  for (let i = 0; i < str.length; ++i) {
    const code = str.charCodeAt(i);
    bufView[i * 2] = code >> 8;
    bufView[i * 2 + 1] = code;
  }

  return bufView;
};

const encodeUTF32LE = (str: string) => {
  const buf = new ArrayBuffer(str.length * 4);
  const bufView = new Uint32Array(buf);
  for (let i = 0; i < str.length; ++i) bufView[i] = str.charCodeAt(i);
  return new Uint8Array(buf);
};

const encodeUTF32BE = (str: string) => {
  const buf = new ArrayBuffer(str.length * 4);
  const bufView = new Uint8Array(buf);

  for (let i = 0; i < str.length; ++i) {
    const realI = i * 4;

    const code = str.charCodeAt(i);
    bufView[realI] = code >> 24;
    bufView[realI + 1] = code >> 16;
    bufView[realI + 2] = code >> 8;
    bufView[realI + 3] = code;
  }

  return bufView;
};

const bufferToStrings = (buf: Uint8Array) =>
  Array.from(buf, (byte) => byte.toString(16).padStart(2, "0"));

const textEncoder = new TextEncoder();

export const SUPPORTED_TEXT_ENCODINGS: [string, (str: string) => string[]][] = [
  [
    "Unicode Code Points",
    (str) =>
      str
        .split("")
        .map((c) => `U+${c.charCodeAt(0)!.toString(16).padStart(4, "0")}`),
  ],
  [
    "ASCII",
    (str) => {
      const encoded = textEncoder.encode(str);
      if (encoded.findIndex((byte) => byte > 127) !== -1)
        return ["Input cannot be encoded with ASCII."];
      else return bufferToStrings(encoded);
    },
  ],
  ["UTF-8", (str) => bufferToStrings(textEncoder.encode(str))],
  ["UTF-16LE", (str) => bufferToStrings(encodeUTF16LE(str))],
  ["UTF-16BE", (str) => bufferToStrings(encodeUTF16BE(str))],
  ["UTF-32LE", (str) => bufferToStrings(encodeUTF32LE(str))],
  ["UTF-32BE", (str) => bufferToStrings(encodeUTF32BE(str))],
];
