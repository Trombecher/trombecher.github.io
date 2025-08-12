export const CLIENT_ID = "b527cdf9b7674520a7540c76cc645378";

export type PTrack = {
    id: string;
    title: string;
    artist: string;
    year: number;
}

export const prepareSpotifyRedirect = () => {
    localStorage["redirectURL"] = location.pathname;
    return redirectUri();
}

export const redirectUri = () => `${location.origin}/redirect/`;