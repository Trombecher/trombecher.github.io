import {z} from "zod";
import {type Accessor, createSignal, type Setter} from "solid-js";

const PROFILE_SCHEMA = z.object({
    links: z.array(z.string()),
    privateCloud: z.ostring(),
    publicCloud: z.ostring(),
}).transform(profile => new Profile(
    profile.links
));

const LS_SCHEMA = z.object({
    defaultProfile: z.ostring(),
    profiles: z.record(PROFILE_SCHEMA),
});

export class ProfileManager {
    private _currentProfile: string | undefined = undefined;
    profiles = new Map<string, Profile>();

    constructor() {
    }

    get currentProfile(): Profile | undefined {
        if(!this._currentProfile) return undefined;
        return this.profiles.get(this._currentProfile);
    }

    set currentProfile(profile: string) {
        if(!this.profiles.has(profile)) return;
        this._currentProfile = profile;
    }

    init() {
        const {profiles, defaultProfile} = LS_SCHEMA.parse(JSON.parse(localStorage["/net/profiles"] || "[]"))

        this._currentProfile = defaultProfile;

        this.profiles = new Map(Object.entries(profiles))
    }
}

export class Profile {
    readonly links: Accessor<string[]>;

    _privateCloud: string | undefined = undefined;
    _publicCloud: string | undefined = undefined;

    private readonly setLinks: Setter<string[]>;

    constructor(links: string[]) {
        const [getLinks, setLinks] = createSignal(links);
        this.links = getLinks;
        this.setLinks = setLinks;
    }

    refresh() {
        if(!this._publicCloud || !this._privateCloud) return;

        // TODO: network
    }

    addLink(link: string) {
        this.setLinks(links => [...links, link]);

        // TODO: network
    }

    removeLink(link: string) {
        this.setLinks(links => links.filter(l => l !== link));

        // TODO: network
    }
}