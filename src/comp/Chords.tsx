import {type Accessor, createMemo, createSignal, For} from "solid-js";

const GUITAR_STRINGS = [
    "E",
    "A",
    "D",
    "G",
    "B",
    "e",
] as const;

const CONNECTORS = [
    <div
        class={`z-50 bg-blue text-white w-6 h-6 rounded-full flex items-center justify-center`}>
        <div class={"w-4 h-4 bg-white rounded-full"}></div>
    </div>,
    <div
        class={`z-50 bg-blue text-white w-6 h-6 rounded-full flex items-center justify-center`}>
        <div class={"w-4 h-4 bg-white rounded-full"}></div>
    </div>,
    <div
        class={`z-50 bg-blue text-white w-6 h-6 rounded-full flex items-center justify-center`}>
        <div class={"w-4 h-4 bg-white rounded-full"}></div>
    </div>,
    <div
        class={`z-50 bg-blue text-white w-6 h-6 rounded-full flex items-center justify-center`}>
        <div class={"w-4 h-4 bg-white rounded-full"}></div>
    </div>,
];

const Connector = ({up, down}: {up: boolean, down: boolean}) =>
    CONNECTORS[(up ? 0 : 1) | (down ? 2 : 0)];

const GuitarChordView = (strings: {
    e: Accessor<number>
    A: Accessor<number>
    G: Accessor<number>
    D: Accessor<number>
    B: Accessor<number>
    E: Accessor<number>,
}) => {
    const values = createMemo(() => Object.values(strings).map(x => x()));
    const minFret = createMemo(() => Math.max(Math.min(...values()), 0));
    const maxFret = createMemo(() => Math.max(...values(), 0));

    return (
        <div class={"flex"}>
            <div class={"flex flex-col w-16 text-center relative shrink-0"}>
                <div class={"absolute top-0 bottom-0 w-1 right-0 bg-shade-500 rounded-full"}></div>
                <div class={"h-8"}></div>
                {GUITAR_STRINGS.toReversed().map(string => (
                    <div class={"h-8 relative w-full flex items-center justify-center"}>
                        <div
                            class={`${strings[string]() < 0 ? "bg-shade-200" : "bg-shade-800"} rounded-l-full h-2 absolute top-[calc(50%-4px)] left-0 right-0`}></div>

                        {strings[string]() === 0 && (
                            <Connector up={false} down={false}/>
                        )}
                    </div>
                ))}
            </div>
            <For each={Array.from({length: maxFret() - minFret()})}>
                {(_, localFretIndex) => (
                    <div class={"flex flex-col w-full text-center relative"}>
                        <div class={"absolute top-0 bottom-0 w-1 right-0 bg-shade-500 rounded-full"}></div>
                        <div>{localFretIndex() + 1 + minFret()}</div>
                        {GUITAR_STRINGS.toReversed().map(string => (
                            <div class={"h-8 relative w-full flex items-center justify-center"}>
                                <div
                                    class={`${strings[string]() < 0 ? "bg-shade-200" : "bg-shade-800"} h-2 absolute top-[calc(50%-4px)] left-0 right-0`}></div>

                                {strings[string]() === minFret() + localFretIndex() + 1 && (
                                    <div
                                        class={`z-50 bg-blue text-white w-6 h-6 rounded-full flex items-center justify-center`}>
                                        <div class={"w-4 h-4 bg-white rounded-full"}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </For>
        </div>
    );
};

export default () => {
    const [input, setInput] = createSignal("");

    return (
        <>
            <label class={"block mb-8"}>
                Chord:
                <input
                    type="text"
                    value={input()}
                    oninput={e => setInput(e.currentTarget.value)}
                    class={"ml-2 bg-shade-50 rounded-2xl px-3 py-1"}
                />
            </label>

            <GuitarChordView
                e={() => 2}
                B={() => 3}
                G={() => 2}
                D={() => 4}
                A={() => 2}
                E={() => -1}
            />
        </>
    );
}