import {toCanvas} from "qrcode";
import {createEffect, createSignal} from "solid-js";

export default () => {
    const [text, setText] = createSignal("https://youtube.com");
    const [ecl, setECL] = createSignal<"L" | "M" | "Q" | "H">("L");

    return (
        <>
            <section class={"p-6 mt-12 border-y-2 sm:border-x-2 max-sm:-mx-6 sm:rounded-3xl border-shade-100"}>
                <h2 class={"mt-0"}>Settings</h2>
                <label class={"flex gap-4 items-center mb-4"}>
                    <span class={"shrink-0"}>Text / URL:</span>
                    <input
                        type="text"
                        class={"w-full bg-shade-100 px-4 py-1 rounded-xl"}
                        value={text()}
                        oninput={e => {
                            setText(e.currentTarget.value);
                        }}
                    />
                </label>
                <label class={"flex gap-4 items-center"}>
                    Error correction level:
                    <select
                        oninput={e => {
                            setECL(e.target.value as any);
                        }}
                    >
                        {([["L", "Low"], ["M", "Medium"], ["Q", "Quartile"], ["H", "High"]] as const).map(([opt, text]) => (
                            <option value={opt}>{text}</option>
                        ))}
                    </select>
                </label>
            </section>
            <canvas
                ref={canvas => {
                    createEffect(() => {
                        if(!text()) return;

                        toCanvas(canvas, text(), {
                            margin: 0,
                            scale: 1,
                            errorCorrectionLevel: ecl(),
                        });
                    });
                }}
                class={"my-12 mix-blend-multiply !w-full aspect-square !h-auto [image-rendering:pixelated]"}
            ></canvas>
        </>
    );
}