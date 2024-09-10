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