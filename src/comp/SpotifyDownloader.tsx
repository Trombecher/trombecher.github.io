import Button from "@/comp/system/Button";
import {CLIENT_ID, prepareSpotifyRedirect} from "@/spotify";
import {type PlaylistedTrack, SpotifyApi, type Track} from "@spotify/web-api-ts-sdk";
import {createSignal} from "solid-js";
import {createStore} from "solid-js/store";

const BATCH_SIZE = 50;

const transformOptions = (
    track: PlaylistedTrack<Track>,
    options: Options,
): object => {
    const result: Record<string, any> = {};

    if(options.id) result.id = track.track.id;
    if(options.title) result.title = track.track.name;
    if(options.artists) result.artists = track.track.artists.map(artist => artist.name);
    if(options.year) {
        const date = new Date(track.track.album.release_date);
        result.year = options.year === "UNIX Timestamp" ? date.getTime() : date.toISOString();
    }
    if(options.duration) result.duration = track.track.duration_ms;
    if(options.addedAt) {
        const date = new Date(track.added_at);
        result.addedAt = options.addedAt === "UNIX Timestamp" ? date.getTime() : date.toISOString();
    }
    if(options.addedBy) result.addedBy = track.added_by?.id;
    if(options.isLocal) result.isLocal = track.track.is_local;
    if(options.availableMarkets) result.availableMarkets = track.track.available_markets;
    if(options.explicit) result.explicit = track.track.explicit;
    if(options.episode) result.episode = track.track.episode;
    if(options.albumAvailableMarkets) result.albumAvailableMarkets = track.track.album?.available_markets;
    if(options.albumType) result.albumType = track.track.album?.album_type;
    if(options.albumId) result.albumId = track.track.album?.id;
    if(options.images) result.images = track.track.album?.images.map(image => ({
        url: image.url,
        width: image.width,
        height: image.height,
    }));
    if(options.albumTitle) result.albumTitle = track.track.album?.name;
    if(options.releaseDate) {
        const date = new Date(track.track.album?.release_date || "");
        result.releaseDate = options.releaseDate === "UNIX Timestamp" ? date.getTime() : date.toISOString();
    }
    if(options.albumArtists) result.albumArtists = track.track.album?.artists.map(artist => artist.name);
    if(options.albumTrackCount) result.albumTrackCount = track.track.album?.total_tracks;
    if(options.trackNumber) result.trackNumber = track.track.track_number;
    if(options.popularity) result.popularity = track.track.popularity;
    if(options.discNumber) result.discNumber = track.track.disc_number;

    return result;
};

type Options = {
    id?: boolean,
    title?: boolean,
    artists?: boolean,
    year?: false | "UTC" | "UNIX Timestamp",
    duration?: boolean,
    addedAt?: false | "UTC" | "UNIX Timestamp",
    addedBy?: boolean,
    isLocal?: boolean,
    availableMarkets?: boolean,
    explicit?: boolean,
    episode?: boolean,
    albumAvailableMarkets?: boolean,
    albumType?: boolean,
    albumId?: boolean,
    images?: boolean,
    albumTitle?: boolean,
    releaseDate?: false | "UTC" | "UNIX Timestamp",
    albumArtists?: boolean,
    albumTrackCount?: boolean,
    trackNumber?: boolean,
    popularity?: boolean,
    discNumber?: boolean,
}

const IncludeFieldOption = ({
    value,
    name,
    onSelect,
}: {
    name: string,
    value: boolean,
    onSelect: (value: boolean) => void,
}) => {
    return (
        <label class={"flex items-center gap-2"}>
            <input
                type="checkbox"
                checked={value}
                onChange={e => onSelect(e.currentTarget.checked)}
                class={"cursor-pointer accent-blue"}
            />
            {name}
        </label>
    );
};

const IncludeDateOption = ({
    value,
    name,
    onSelect,
}: {
    name: string,
    value: false | "UTC" | "UNIX Timestamp",
    onSelect: (value: false | "UTC" | "UNIX Timestamp") => void,
}) => {
    return (
        <label class={"flex items-center gap-2"}>
            <select
                value={value + ""}
                onChange={e => {
                    onSelect(!Boolean(e.currentTarget.value)
                        ? false
                        : e.currentTarget.value as "UTC" | "UNIX Timestamp");
                }}
                class={"bg-shade-100 px-3 py-1 rounded-2xl cursor-pointer text-base w-full"}
            >
                <option value={"false"}>Don't include</option>
                <option value={"UTC"}>UTC Date</option>
                <option value={"UNIX Timestamp"}>UNIX Timestamp</option>
            </select>
            <div class={"shrink-0"}>{name}</div>
        </label>
    );
};

export default () => {
    const [playlistId, setPlaylistId] = createSignal("");
    const [outputText, setOutputText] = createSignal("");
    const [progress, setProgress] = createSignal<undefined | number>(undefined);
    const [showAdvancedOptions, setShowAdvancedOptions] = createSignal(false);

    const [options, setOptions] = createStore<Options>({
        id: true,
        title: true,
        year: "UNIX Timestamp",
        artists: true,
    });

    return (
        <section class={"mt-16"}>
            <h2>Options</h2>
            <div class={"grid gap-y-1 gap-x-4 max-sm:grid-cols-1 grid-cols-2 select-none"}>
                <IncludeFieldOption
                    name={"Track ID (Spotify)"}
                    value={options.id ?? false}
                    onSelect={value => setOptions("id", value)}
                />
                <IncludeFieldOption
                    name={"Track Title"}
                    value={options.title ?? false}
                    onSelect={value => setOptions("title", value)}
                />
                <IncludeFieldOption
                    name={"Artists"}
                    value={options.artists ?? false}
                    onSelect={value => setOptions("artists", value)}
                />
                <IncludeDateOption
                    name={"Year"}
                    value={options.year ?? false}
                    onSelect={value => setOptions("year", value)}
                />
            </div>
            <button
                class={"text-center my-4 text-shade-800 block w-full text-base"}
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions())}
            >
                Show advanced options {showAdvancedOptions() ? "▲" : "▼"}
            </button>
            {showAdvancedOptions() && (
                <div class={"grid gap-y-1 gap-x-4 max-sm:grid-cols-1 grid-cols-2 select-none"}>
                    <IncludeFieldOption
                        name={"Duration (ms)"}
                        value={options.duration ?? false}
                        onSelect={value => setOptions("duration", value)}
                    />
                    <IncludeDateOption
                        name={"Added At"}
                        value={options.addedAt ?? false}
                        onSelect={value => setOptions("addedAt", value)}
                    />
                    <IncludeFieldOption
                        name={"Added By (User ID)"}
                        value={options.addedBy ?? false}
                        onSelect={value => setOptions("addedBy", value)}
                    />
                    <IncludeFieldOption
                        name={"Is Local"}
                        value={options.isLocal ?? false}
                        onSelect={value => setOptions("isLocal", value)}
                    />
                    <IncludeFieldOption
                        name={"Available Markets"}
                        value={options.availableMarkets ?? false}
                        onSelect={value => setOptions("availableMarkets", value)}
                    />
                    <IncludeFieldOption
                        name={"Explicit"}
                        value={options.explicit ?? false}
                        onSelect={value => setOptions("explicit", value)}
                    />
                    <IncludeFieldOption
                        name={"Episode"}
                        value={options.episode ?? false}
                        onSelect={value => setOptions("episode", value)}
                    />
                    <IncludeFieldOption
                        name={"Album Available Markets"}
                        value={options.albumAvailableMarkets ?? false}
                        onSelect={value => setOptions("albumAvailableMarkets", value)}
                    />
                    <IncludeFieldOption
                        name={"Album Type"}
                        value={options.albumType ?? false}
                        onSelect={value => setOptions("albumType", value)}
                    />
                    <IncludeFieldOption
                        name={"Album ID (Spotify)"}
                        value={options.albumId ?? false}
                        onSelect={value => setOptions("albumId", value)}
                    />
                    <IncludeFieldOption
                        name={"Images"}
                        value={options.images ?? false}
                        onSelect={value => setOptions("images", value)}
                    />
                    <IncludeFieldOption
                        name={"Album Title"}
                        value={options.albumTitle ?? false}
                        onSelect={value => setOptions("albumTitle", value)}
                    />
                    <IncludeDateOption
                        name={"Release Date"}
                        value={options.releaseDate ?? false}
                        onSelect={value => setOptions("releaseDate", value)}
                    />
                    <IncludeFieldOption
                        name={"Album Artists"}
                        value={options.albumArtists ?? false}
                        onSelect={value => setOptions("albumArtists", value)}
                    />
                    <IncludeFieldOption
                        name={"Album Track Count"}
                        value={options.albumTrackCount ?? false}
                        onSelect={value => setOptions("albumTrackCount", value)}
                    />
                    <IncludeFieldOption
                        name={"Track Number"}
                        value={options.trackNumber ?? false}
                        onSelect={value => setOptions("trackNumber", value)}
                    />
                    <IncludeFieldOption
                        name={"Popularity"}
                        value={options.popularity ?? false}
                        onSelect={value => setOptions("popularity", value)}
                    />
                    <IncludeFieldOption
                        name={"Disc Number"}
                        value={options.discNumber ?? false}
                        onSelect={value => setOptions("discNumber", value)}
                    />
                </div>
            )}
            <div class={"flex max-xs:flex-col xs:items-center gap-4 mt-8"}>
                <input
                    class={"min-w-0 grow bg-shade-100 px-3 py-1 rounded-2xl"}
                    onInput={e => {
                        setPlaylistId(e.currentTarget.value);
                    }}
                    type="text"
                    placeholder="Enter Spotify playlist link, id or URI."
                    value={playlistId()}
                />
                <Button
                    disabled={progress() !== undefined || !playlistId().trim()}
                    onClick={async () => {
                        setProgress(0);

                        let input = playlistId().trim();

                        if(input.startsWith("https://open.spotify.com/playlist/")) {
                            input = (input.split("/").pop() || "").split("?")[0] || "";
                        } else if(input.startsWith("spotify:playlist:")) {
                            input = input.split(":").pop() || "";
                        }

                        setPlaylistId(input);

                        const api = SpotifyApi.withUserAuthorization(
                            CLIENT_ID,
                            prepareSpotifyRedirect(),
                            [
                                "playlist-read-private",
                                "playlist-read-collaborative",
                            ],
                        );

                        const initial = await api.playlists.getPlaylistItems(input, undefined, undefined, BATCH_SIZE, 0);
                        const total = initial.total;

                        const tracks = initial.items.map(track => transformOptions(track, options));
                        setProgress(tracks.length / total);

                        await Promise.all(Array.from({length: Math.ceil((total - tracks.length) / BATCH_SIZE)}, (_, i) => (i + 1) * BATCH_SIZE)
                            .map(async offset => {
                                const batch = await api.playlists.getPlaylistItems(input, undefined, undefined, BATCH_SIZE, offset);
                                console.log(batch);
                                const newTracks = batch.items.map(track => transformOptions(track, options));
                                tracks.push(...newTracks);

                                setProgress(progress => progress! + newTracks.length / total);
                            }));

                        setOutputText(JSON.stringify(tracks));
                    }}
                >Download</Button>
            </div>
            {progress() !== undefined && (
                <div class={"flex px-4 py-1 bg-shade-200 relative rounded-full mt-4 overflow-hidden text-white"}>
                    <div class={"z-50"}>
                        Progress: {progress()! * 100}%
                    </div>
                    <div
                        class={"bg-blue h-full left-0 top-0 absolute"}
                        style={`width: ${progress()! * 100}%`}
                    />
                </div>
            )}
            {outputText() && (
                <>
                    <h2>Output</h2>
                    <textarea
                        class={"block w-full h-96 bg-shade-50 p-4 font-mono rounded-3xl text-sm"}
                        value={outputText()}
                    />
                </>
            )}
        </section>
    );
}