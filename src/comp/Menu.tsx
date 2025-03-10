import {type Accessor, createSignal, type Setter} from "solid-js";

export default () => {
    const [isOpen, setIsOpen] = createSignal(false);

    return (
        <>
            <header
                class={`${isOpen() ? "backdrop-blur-2xl bg-white/50" : "pointer-events-none blur-none"} z-50 h-screen fixed inset-0 select-none transition ease-in-out duration-300 flex flex-col items-center`}
                onclick={e => {
                    if(e.target !== e.currentTarget) return;
                    setIsOpen(false);
                }}
            >
                <div class={"w-full max-w-screen-sm flex"}>
                    <div
                        class={`w-full mt-6 ${isOpen() ? "opacity-100 blur-none" : "blur-2xl opacity-0"}`}
                    >
                        {([
                            ["/", "Home"],
                            ["/posts/", "Posts"],
                            ["/projects/", "Projects"],
                            ["/tools/", "Tools"],
                            ["/articles/", "Articles"],
                            ["/games/", "Games"],
                        ] as const).map(([href, title]) => (
                            <a
                                href={href}
                                class={"py-3 px-8 block font-bold text-4xl hover:text-shade-500 transition"}
                            >{title}</a>
                        ))}
                    </div>
                    <MenuButton isOpen={isOpen} setIsOpen={setIsOpen}/>
                </div>
            </header>
        </>
    )
}

const MenuButton = ({
    setIsOpen,
    isOpen
                    }: {
    isOpen: Accessor<boolean>,
    setIsOpen: Setter<boolean>
}) => (
    <button
        onclick={() => setIsOpen(!isOpen())}
        class={"w-10 h-10 flex flex-col items-center justify-center m-5 gap-1 pointer-events-auto shrink-0 cursor-pointer hover:bg-shade-50 transition active:bg-shade-100 rounded-xl backdrop-blur-2xl bg-white/50"}
    >
        <span
            class={`rounded-full bg-black h-0.5 w-[22px] origin-center transition ease-in-out duration-300 ${isOpen() ? "-rotate-45 translate-y-[6px]" : ""}`}
        />
        <span
            class={`rounded-full bg-black h-0.5 w-[22px] origin-center transition ease-in-out duration-300 ${isOpen() ? "-rotate-45 opacity-0" : "opacity-100"}`}
        />
        <span
            class={`rounded-full bg-black h-0.5 w-[22px] origin-center transition ease-in-out duration-300 ${isOpen() ? "rotate-45 translate-y-[-6px]" : ""}`}
        />
    </button>
);