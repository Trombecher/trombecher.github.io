export const isLowPowerMode = () => {
    /*
    if (navigator.getBattery) {
        navigator.getBattery().then(function(battery) {
            if (battery.level < 0.2 && !battery.charging) {
                console.log("Low Power Mode Likely Enabled (Battery below 20% and not charging)");
            }
        });
    }*/

    return matchMedia('(prefers-reduced-motion: reduce)').matches
};

export const isDarkModeQuery = () => matchMedia("(prefers-color-scheme: dark)");

export const isDarkMode = (q: {matches: boolean} = isDarkModeQuery()) => q.matches;

export const UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
export const NUMBERS = "0123456789";
export const SYMBOLS = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

export const generatePassword = (length: number, charset: string) => {
    if(charset === "") return "";
    
    const buffer = new Uint32Array(length);
    crypto.getRandomValues(buffer);

    let s = "";
    for(const randomValue of buffer)
        s += charset[Math.floor(randomValue / (0xFFFFFFFF + 1) * charset.length)];
    return s;
};

export const escapeRegExp = (text: string) => text.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');


const FORMAT_UNITS = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
    ["microsecond", .001],
    ["millisecond", 10 ** -6],
    ["nanosecond", 10 ** -12],
] as const;

export const formatDuration = (seconds: number) => {
    // Time of the universe
    if(seconds > 365 * 24 * 60 * 60 * 100 * 10 ** 12)
        return "longer than our universe"

    for(const [name, s] of FORMAT_UNITS) {
        if(seconds >= s) {
            const x = Math.round(seconds / s * 10) / 10;
            return `${x} ${name}${x === 1 ? "" : "s"}`
        }
    }
    return "no time";
}