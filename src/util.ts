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