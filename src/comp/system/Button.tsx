import {createSignal, type JSX} from "solid-js";

export default (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const [forceDown, setForceDown] = createSignal(false);

    return (
        <button
            {...props}
            class={`block select-none bg-blue disabled:bg-shade-400 text-white py-0.5 px-2 shrink-0 rounded-2xl cursor-pointer disabled:cursor-default ${forceDown() ? "shadow-none translate-y-1.5" : "not-disabled:active:shadow-none not-disabled:active:translate-y-1.5"} border-2 border-black shadow-[0_6px] shadow-black ${props.class ?? ""}`}
            ontouchstart={e => {
                if(!e.currentTarget.disabled)
                    setForceDown(true);
            }}
            ontouchend={() => setForceDown(false)}
        >
            {props.children}
        </button>
    );
};