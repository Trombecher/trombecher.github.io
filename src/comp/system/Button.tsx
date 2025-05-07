import {createSignal, type JSX} from "solid-js";

export default ({
    class: className = "",
    children,
    ...rest
}: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const [forceDown, setForceDown] = createSignal(false);

    return (
        <button
            class={`block select-none bg-blue text-white py-0.5 px-2 shrink-0 rounded-2xl cursor-pointer ${forceDown() ? "shadow-none translate-y-1.5" : "active:shadow-none active:translate-y-1.5"} border-2 border-black shadow-[0_6px] shadow-black ${className}`}
            ontouchstart={() => setForceDown(true)}
            ontouchend={() => setForceDown(false)}
            {...rest}
        >
            {children}
        </button>
    );
}