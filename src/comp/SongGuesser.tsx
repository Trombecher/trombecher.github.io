import Button from "@/comp/system/Button";
import {type PTrack} from "@/spotify";
import {createSignal} from "solid-js";

let PLAYLIST_BILLBOARD_100: PTrack[] | undefined = undefined;

const billboard100 = async (): Promise<PTrack[]> => {
    if(!PLAYLIST_BILLBOARD_100) {
        PLAYLIST_BILLBOARD_100 = (await import("@/billboard100.json")).default;
    }

    return PLAYLIST_BILLBOARD_100;
};

export default () => {
    /*
    const adapter = SpotifyApi.withUserAuthorization(
        CLIENT_ID,
        "http://localhost:4321/that-song/",
        [
            "user-modify-playback-state",
            "playlist-read-private",
            "playlist-read-collaborative",
        ],
    );
     */

    /*
    const [repertoire, setRepertoire] = createSignal<PlaylistedTrack[]>([]);
    */

    const [currentlyPlaying, setCurrentlyPlaying] = createSignal<PTrack | undefined>(undefined);
    const [revealed, setRevealed] = createSignal(false);

    const playTrack = (track: PTrack) => {
        window.open(`spotify:track:${track.id}`, "_self");
        setRevealed(false);
        setCurrentlyPlaying(track);
    };

    return (
        <section class={"mt-16"}>
            <Button
                class={"mb-4"}
                onClick={async () => {
                    const tracks = await billboard100();
                    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]!;
                    playTrack(randomTrack);
                }}
            >Play random track</Button>
            {currentlyPlaying() && (
                <>
                    <Button
                        onClick={() => {
                            setRevealed(!revealed());
                        }}
                    >
                        {revealed() ?
                            <>Hide</>
                            : <>Reveal</>
                        }
                    </Button>
                    {revealed() && (
                        <>
                            <div class={"mt-4 text-2xl font-medium"}>{currentlyPlaying()!.title}</div>
                            <div class={"text-shade-800 text-xl"}>{currentlyPlaying()!.artist}</div>
                            <a
                                href={`https://google.com/search?q=${encodeURIComponent(currentlyPlaying()!.title + " " + currentlyPlaying()!.artist)}`}
                                target={"_blank"}
                                class={"text-7xl mt-2 font-semibold"}
                            >
                                {currentlyPlaying()!.year}
                            </a>
                        </>
                    )}
                </>
            )}
        </section>
    );
}