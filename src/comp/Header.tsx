import {TAG_TO_MULTIPLE, TAG_TO_SLUG, TAGS} from "@/global.ts";
import {createSignal, onMount} from "solid-js";

const SCROLL_THRESHOLD_PX = 10;

const TAGS_AND_SLUGS = TAGS.map(tag => [TAG_TO_MULTIPLE[tag], `/${TAG_TO_SLUG[tag]}/`]);

export default ({pathname = location.pathname}: {pathname: string}) => {
    const [menuIsElevated, setMenuIsElevated] = createSignal(false);
    const [menuOpen, setMenuOpen] = createSignal(false);

    onMount(() => {
        addEventListener("scroll", () => {
            setMenuIsElevated(window.scrollY > SCROLL_THRESHOLD_PX);
        });

        setMenuIsElevated(window.scrollY > SCROLL_THRESHOLD_PX);
    });

    return (
        <header class="flex flex-wrap sticky top-0 left-0 justify-center z-50">
            <div
                class={`${menuOpen() ? "z-50 bg-black/30 backdrop-blur-xl backdrop-saturate-150" : "-z-[1000] bg-black/0 backdrop-blur-0 backdrop-saturate-100 pointer-events-none"} fixed inset-0 transition-all duration-300`}
                onMouseDown={() => setMenuOpen(false)}
            />

            <nav
                class={`${menuIsElevated() ? "shadow-lg" : "shadow-none"} m-4 ${menuOpen() ? "bg-white/80 gap-y-2" : "bg-white/60 gap-0"} p-2 rounded-[24px] duration-300 transition-all backdrop-blur-3xl z-[100] flex flex-wrap justify-center`}>
                <a
                    rel="prefetch"
                    href={"/"}
                    class={`${pathname === "/" ? "bg-red/70" : "hover:text-black/60"} mr-2 block rounded-full px-4 py-1`}
                >Home</a>

                {[
                    ["Posts", "/posts/"],
                    ...TAGS_AND_SLUGS,
                ].map(([text, slug]) => (
                    <a
                        rel="prefetch"
                        href={slug}
                        class={`${menuOpen() || pathname === slug || (text === "Posts" && !TAGS_AND_SLUGS.find(([_, p]) => p === pathname)) ? "w-[calc-size(auto,size)] px-4 py-1 mr-2 opacity-100" : "w-0 p-0 m-0 opacity-0"} block transition-all duration-300 overflow-hidden ${pathname === slug ? "bg-red/70" : "hover:text-black/60"} block rounded-full`}
                    >{text}</a>
                ))}

                <button
                    class={`${menuOpen() ? "-rotate-45" : "rotate-0"} transition-all block rounded-full px-3 py-1`}
                    onMouseDown={() => setMenuOpen(!menuOpen())}
                >+
                </button>
            </nav>
        </header>
    );
};