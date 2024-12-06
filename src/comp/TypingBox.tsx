import {createSignal} from "solid-js";

const THINGS_I_AM = [
    "Web developer.",
    "System developer.",
    "Photographer.",
    "Creator.",
    "Artist.",
    "Designer.",
    "Writer.",
    // "Contributor", maybe someday
];

export default () => {
    const [text, setText] = createSignal(THINGS_I_AM[0]!);
    const [cursorPosition, _] = createSignal(3);

    let index = 0;

    setInterval(async () => {
        setText(THINGS_I_AM[(++index) % THINGS_I_AM.length]!);


    }, 1000);

    return (
        <div class="mt-2 text-xl px-6 relative">
            {text()}
            <div class={"flex absolute text-black/0 top-0 -z-50"}>
                {text().slice(0, cursorPosition())}
                <div class={"animate-pulse w-[2px] min-h-[10%] bg-black z-50"}></div>
            </div>
        </div>
    );
}