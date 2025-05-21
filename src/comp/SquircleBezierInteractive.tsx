import Toggle from "@/comp/system/Toggle";
import {createSignal, Show} from "solid-js";

export default () => {
    const [k, setK] = createSignal(0.9181776924287774);
    const [showBezier, setShowBezier] = createSignal(true);
    const [showCircle, setShowCircle] = createSignal(false);
    const [showSquircle, setShowSquircle] = createSignal(false);
    const [toggleFill, setToggleFill] = createSignal(false);

    return (
        <section class={"my-12 bg-shade-50 rounded-3xl"}>
            <div class={"p-6"}>
                <div class={"flex gap-2"}>
                    <Toggle
                        state={showBezier}
                        onToggle={() => setShowBezier(!showBezier())}
                    />
                    Show Beziér
                </div>
                <div class={"flex gap-2 mt-2"}>
                    <Toggle
                        state={showCircle}
                        onToggle={() => setShowCircle(!showCircle())}
                    />
                    Show Circle (n=2)
                </div>
                <div class={"flex gap-2 mt-2"}>
                    <Toggle
                        state={showSquircle}
                        onToggle={() => setShowSquircle(!showSquircle())}
                    />
                    Show Squircle (n=4)
                </div>
                <div class={"flex gap-2 mt-2"}>
                    <Toggle
                        state={toggleFill}
                        onToggle={() => setToggleFill(!toggleFill())}
                    />
                    Outlined / Filled
                </div>
            </div>
            <div class={"flex px-6 mb-6 gap-4"}>
                <div class={"w-4"}>k:</div>
                <input
                    type="number"
                    value={k()}
                    onInput={e => setK(+e.currentTarget.value)}
                    class={"block"}
                    min={0}
                    max={1.5}
                    step={0.01}
                />
                <input
                    type="range"
                    value={k()}
                    onInput={e => setK(+e.currentTarget.value)}
                    class={"w-full block"}
                    min={0}
                    max={1.5}
                    step={0.01}
                />
            </div>
            <svg
                class={"m-0 rounded-none fill-none"}
                viewBox={"-20 -30 240 240"}
            >
                <Show when={showBezier()}>
                    <path
                        d={`M 0 ${100 + k() * 100} 0 ${(1 - k()) * 100} M ${(1 - k()) * 100} 0 ${100 + k() * 100} 0 M 200 ${100 + k() * 100} 200 ${(1 - k()) * 100} M ${(1 - k()) * 100} 200 ${100 + k() * 100} 200`}
                        class={"stroke-red stroke-2"}
                    />
                    <text
                        x={100 - k() * 50 - 3}
                        y={-15}
                        class={"fill-red text-black text-sm"}
                    >
                        k
                    </text>
                    <path
                        d={`M ${(1 - k()) * 100} -5 ${(1 - k()) * 100} -10 100 -10 100 -5`}
                        class={"stroke-red stroke-2"}
                    />
                </Show>
                <Show when={showSquircle()}>
                    <path
                        d={"M 0 100 C 0 8.182230757122255 8.182230757122255 0 100 0 S 200 8.182230757122255 200 100 S 191.81776924287774 200 100 200 S 0 191.81776924287774 0 100 Z"}
                        class={"fill-shade-400"}
                    />
                </Show>
                <Show when={showCircle()}>
                    <circle
                        cx={100}
                        cy={100}
                        r={100}
                        class={"fill-shade-700"}
                    />
                </Show>
                <path
                    d={`M 0 100 C 0 ${(1 - k()) * 100} ${(1 - k()) * 100} 0 100 0 S 200 ${(1 - k()) * 100} 200 100 S ${100 + k() * 100} 200 100 200 S 0 ${100 + k() * 100} 0 100 Z`}
                    class={`${toggleFill() ? "fill-black" : "stroke-blue"} stroke-2`}
                />
            </svg>
        </section>
    );
}