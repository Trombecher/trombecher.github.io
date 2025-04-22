import Welcome from "@/net/Welcome.tsx";
import {type Profile, ProfileManager} from "@/net/profiles.ts";
import {createStore} from "solid-js/store";
import {createEffect, createSignal, onMount} from "solid-js";

type Tab = typeof TABS[number];

const TABS = ["Home", "Feed", "Links", "Settings"] as const;

const updateParams = (params: URLSearchParams) => {
    history.replaceState(null, "", `${location.pathname}${params.size ? `?${params.toString()}` : ""}`);
}

export default () => {
    const [profiles, setProfiles] = createStore<ProfileManager>([]);
    const [tab, setTab] = createSignal<Tab>(TABS[0]);

    onMount(() => {
        const params = new URLSearchParams(location.search);
        const searchTab = params.get("tab");

        if(TABS.includes(searchTab as Tab)) {
            setTab(searchTab as Tab);
        } else {
            params.delete("tab");

            history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
        }

        createEffect(() => {
            const params = new URLSearchParams(location.search);

            if(tab() === "Home") {
                // Default state
                params.delete("tab");
            } else {
                params.set("tab", tab());
            }

            updateParams(params);
        })
    })

    return (
        <>
            <Welcome/>
        </>
    );
}