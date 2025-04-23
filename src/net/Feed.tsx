import {currentProfile} from "@/net/profiles";
import {For, Show} from "solid-js";

export default () => {
    return (
        <main class={"w-full max-w-sm"}>
            <h1>Feed</h1>
            <Show
                when={currentProfile()}
                fallback={(
                    <div>yo</div>
                )}
            >
                {profile => (
                    <>
                        Profile: {profile()[0]}

                        <For each={profile()[1].links}>
                            {link => <div>{link}</div>}
                        </For>
                    </>
                )}
            </Show>
        </main>
    )
}