import {currentProfile, profiles, setCurrentProfile} from "@/net/profiles.ts";
import {For} from "solid-js";

export default () => {
    return (
        <main class={"w-full max-w-md"}>
            <h1 class={"text-6xl font-semibold"}>Settings</h1>
            <h2 class={"text-4xl font-semibold text-shade-100 mt-4"}>Profiles</h2>
            <div class={"flex"}>
                <button
                    class={`${currentProfile() === undefined ? "bg-shade-800 border-shade-700" : "border-transparent hover:bg-shade-900"} cursor-pointer block w-32 h-32 border rounded-3xl`}
                    onMouseDown={() => setCurrentProfile(undefined)}
                >
                    logout
                </button>
                <For each={Object.entries(profiles)}>
                    {([name, profile]) => (
                        <button
                            class={`${currentProfile()?.[0] === name ? "bg-shade-800 border-shade-700" : "border-transparent hover:bg-shade-900"} cursor-pointer block w-32 h-32 border rounded-3xl`}
                            onMouseDown={() => setCurrentProfile(name)}
                            style={profile.hue ? `--hue: ${profile.hue}` : ""}
                        >
                            {name}
                        </button>
                    )}
                </For>
            </div>
        </main>
    )
}