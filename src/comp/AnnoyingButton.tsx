import {createSignal} from "solid-js";
import {effect} from "solid-js/web";

export default () => {
    const [count, setCount] = createSignal(0);

    let timeout: number = 0;

    return (
        <div class={"flex mt-8"}>
            <button
                ref={button => {
                    effect(() => {
                        if(count() > 10) {
                            return;
                        }

                        button.setAttribute("style", `top: ${Math.random() * 100}%; left: ${Math.random() * 100}%`);
                    });
                }}
                onclick={() => {
                    if(timeout) return;

                    // @ts-ignore
                    timeout = setTimeout(() => {
                        setCount(0);
                        alert("yay");
                    }, 3000);
                }}
                onmouseenter={() => setCount(count() + 1)}
                class={`${count() ? "fixed" : ""} bg-red text-white px-4 py-1 rounded-xl shadow-[0_4px_theme(colors.black)] text-2xl font-semibold active:shadow-none active:translate-y-1`}
            >
                Press me!
            </button>
        </div>
    );
}