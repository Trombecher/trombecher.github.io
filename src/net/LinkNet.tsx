import Welcome from "@/net/Welcome";
import Explore from "@/net/Explore";
import Settings from "@/net/Settings";
import GetStarted from "@/net/GetStarted";
import Feed from "@/net/Feed";

import {A, HashRouter, Route, useMatch} from "@solidjs/router";
import {type Component, type JSX, Show} from "solid-js";
import {currentProfile, loadProfiles, setHueForCurrentProfile} from "@/net/profiles";

const HEADER_LINKS = [
    ["/", "Home"],
    ["/feed", "Feed"],
    ["/explore", "Explore"],
    ["/settings", "Settings"],
] as const;

const Layout: Component<{children?: JSX.Element}> = (props) => {
    return (
        <>
            <header class={"p-6 flex"}>
                {HEADER_LINKS.map(([href, text]) => {
                    const path = useMatch(() => href);

                    return (
                        <A
                            href={href}
                            class={`${path() ? "font-semibold text-white" : "text-white/70"} block hover:bg-shade-900 px-3 rounded-full py-1 transition active:bg-shade-800`}
                        >{text}</A>
                    )
                })}
            </header>
            {props?.children}

            <footer class={"mt-auto"}>
                <Show when={currentProfile()}>
                    {c => (
                        <>
                            Hue: <input
                                type={"range"}
                                min={0}
                                max={360}
                                step={1}
                                value={c()[1].hue}
                                onInput={e => {
                                    setHueForCurrentProfile(+e.currentTarget.value);
                                }}
                            />
                        </>
                    )}
                </Show>
            </footer>
        </>
    );
};

export default () => {
    loadProfiles();

    return (
        <HashRouter root={Layout}>
            <Route path={"/"} component={Welcome}/>
            <Route path={"/explore"} component={Explore}/>
            <Route path={"/settings"} component={Settings}/>
            <Route path={"/get-started"} component={GetStarted}/>
            <Route path={"/feed"} component={Feed}/>
            <Route path={"/*"} component={() => (
                <div>404</div>
            )}/>
        </HashRouter>
    );
}