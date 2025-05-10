import {z} from "zod";
import {type Accessor, createEffect, createSignal} from "solid-js";
import {createStore} from "solid-js/store";

const PROFILE_SCHEMA = z.object({
    links: z.array(z.string()),
    privateCloud: z.ostring(),
    publicCloud: z.ostring(),
    hue: z.onumber(),
});

export type Profile = z.infer<typeof PROFILE_SCHEMA>;

const [internalCurrentProfile, setInternalCurrentProfile] = createSignal<string | undefined>();

export const currentProfile: Accessor<[string, Profile] | undefined> = () => {
    console.log(`Internal current profile: ${internalCurrentProfile()}`);
    return internalCurrentProfile() === undefined
        ? undefined
        : [internalCurrentProfile()!, internalProfiles[internalCurrentProfile()!]!];
}

export const setCurrentProfile = (profile: string | undefined) => {
    if(profile !== undefined && !internalProfiles[profile]) return;
    setInternalCurrentProfile(profile);
};

const [internalProfiles, setInternalProfiles] = createStore<Record<string, Profile>>({});

export const profiles = internalProfiles;

export const setHueForCurrentProfile = (hue: number) => {
    if(currentProfile() === undefined) return;
    setInternalProfiles(currentProfile()![0], "hue", hue);
}

let hasInit = false;

export const loadProfiles = () => {
    if(hasInit) return;
    hasInit = true;

    const profiles = z.record(PROFILE_SCHEMA).parse(JSON.parse(localStorage["/net/profiles"] || `{}`));
    const defaultProfile = z.ostring().parse(localStorage["/net/defaultProfile"]);

    setInternalProfiles(profiles);
    setCurrentProfile(defaultProfile);

    createEffect(() => {
        // Update Hue
        const profile = currentProfile();

        const hue = profile?.[1].hue || 230;
        document.documentElement.style.setProperty("--hue", `${hue}`);
    });

    createEffect(() => {
        localStorage["/net/defaultProfile"] = internalCurrentProfile();
    });

    createEffect(() => {
        localStorage["/net/profiles"] = JSON.stringify(internalProfiles);
    });
};