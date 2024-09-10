import { getCollection } from "astro:content";

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
    
    let s = "";
    while(length--)
        s += charset[Math.floor(Math.random() * charset.length)];
    return s;
};

export const escapeRegExp = (text: string) => text.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const getAllPosts = async () => (await getCollection("posts"))
    .filter(e => import.meta.env.DEV || e.data.pubUnix !== undefined);