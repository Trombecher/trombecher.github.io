import {type Accessor, For, type Setter} from "solid-js";
import type {Profile} from "@/net/profiles.ts";

export default ({profile, setProfile}: {profile: Accessor<Profile>, setProfile: Setter<string>}) => {


    return (
        <div>
            <For each={profile().links}>
                {link => (
                    <a href={link}>{link}</a>
                )}
            </For>
        </div>
    )
}