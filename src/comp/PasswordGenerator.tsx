import {type Accessor, createMemo, createSignal, type JSX, type Signal} from "solid-js";
import {effect} from "solid-js/web";
import {generatePassword, LOWER_CASE, NUMBERS, SYMBOLS, UPPER_CASE} from "@/client.ts";
import Toggle from "@/comp/Toggle.tsx";

const OPTIONS = [UPPER_CASE, LOWER_CASE, NUMBERS, SYMBOLS] as const;

const OPTION_TO_NAME: { [Key in typeof OPTIONS[number]]: string } = {
    [UPPER_CASE]: "Uppercase",
    [LOWER_CASE]: "Lowercase",
    [NUMBERS]: "Numbers",
    [SYMBOLS]: "Symbols",
};

const enum SectionBackgroundColor {
    DarkRed = 0,
    Red = 1,
    Yellow = 2,
    Black = 3,
    Blue = 4,
}

const Section = ({name, add, children, bg = () => SectionBackgroundColor.Black}: {name: JSX.Element, add?: JSX.Element, children?: JSX.Element, bg?: Accessor<SectionBackgroundColor>}) => (
    <section class={`mt-6 -mx-6 p-6 sm:rounded-3xl bg-black/5 ${(() => {
        switch(bg()) {
            case SectionBackgroundColor.DarkRed: return "bg-red/70";
            case SectionBackgroundColor.Red: return "bg-red/50";
            case SectionBackgroundColor.Yellow: return "bg-yellow/50";
            case SectionBackgroundColor.Blue: return "bg-blue/10";
            case SectionBackgroundColor.Black: return "bg-black/5";
        }
    })()}`}>
        <div class={"mb-4 flex"}>
            <h2 class={"mt-0 mb-0 flex"}>{name}</h2>
            {add}
        </div>
        {children}
    </section>
);

export default () => {
    const [password, setPassword] = createSignal("");
    const [length, setLength] = createSignal(16);
    const [regenerate, setRegenerate] = createSignal(Math.random());
    let customPassword = false;

    const optionSelected: { [Key in typeof OPTIONS[number]]: Signal<boolean> } = Object.fromEntries(OPTIONS.map(option =>
        [option, createSignal(true)])) as unknown as typeof optionSelected;

    const charset = createMemo(() => Object.entries(optionSelected).reduce((acc, [option, [selected]]) => selected() ? acc + option : acc, ""));

    effect(() => {
        if(customPassword) return;

        regenerate();

        setPassword(generatePassword(length(), charset()));
    });

    const [showPassword, setShowPassword] = createSignal(false);
    const [copyText, setCopyText] = createSignal("📋 Copy");

    const entropy = () => Math.round(length() * Math.log2(charset().length) * 100) / 100;
    const strengthIndex = createMemo(() => ENTROPY_BOUNDARIES.findIndex(({max}) => !max || max >= entropy())!)
    const strength = () => ENTROPY_BOUNDARIES[strengthIndex()]!;

    const [clearClipboardProgressBar, setClearClipboardProgressBar] = createSignal(0);

    return (
        <>
            <Section name={"Character Set"}>
                {OPTIONS.map(option => (
                    <label
                        class={"flex gap-3 cursor-pointer mt-2 h-8 select-none"}
                    >
                        <Toggle
                            setState={() => {
                                const [selected, setSelected] = optionSelected[option];

                                customPassword = false;
                                setSelected(!selected());
                            }}
                            state={optionSelected[option][0]}
                        />
                        {OPTION_TO_NAME[option]}
                    </label>
                ))}
            </Section>
            <Section name={<>Length: {length}</>}>
                <input
                    type="range"
                    class={"w-full accent-blue"}
                    min={16}
                    max={128}
                    step={1}
                    value={length()}
                    onInput={e => setLength(+e.target.value)}
                />
            </Section>
            <Section
                name={"Output"}
                add={(
                    <button
                        class={"ml-auto bg-blue rounded-xl px-3 text-white text-lg shadow-button active:shadow-none active:translate-y-1 shrink-0"}
                        onMouseDown={() => {
                            customPassword = false;
                            setRegenerate(Math.random());
                        }}
                    >🔄 Regenerate</button>
                )}
            >
                <div class={"flex gap-4 h-10"}>
                    <button
                        class={"flex items-center bg-blue px-1 rounded-xl shadow-button active:shadow-none active:translate-y-1 mb-1"}
                        onMouseDown={() => {
                            customPassword = false;
                            setShowPassword(!showPassword());
                        }}
                    >
                        <svg xmlns={"https://www.w3.org/2000/svg"} viewBox={"0 0 32 32"} width={32} height={32}
                             class={"fill-none m-0 stroke-2 stroke-white"}>
                            <path
                                d={"M16 23C11 23 5 20 5 16S11 9 16 9 27 12 27 16 21 23 16 23M16 20A1 1 0 0016 12 1 1 0 0016 20"}
                            />
                            <path d={"M4 28 28 4"} class={showPassword() ? "opacity-0" : ""}/>
                        </svg>
                    </button>
                    <input
                        type={showPassword() ? "text" : "password"}
                        class={"tracking-tight min-w-0 overflow-x-auto bg-black/10 rounded-xl block px-3 font-mono grow"}
                        value={password()}
                        oninput={e => {
                            customPassword = true;
                            setPassword(e.target.value);
                        }}
                    />
                    <button
                        class={"bg-blue rounded-xl px-3 text-white shadow-button text-lg mb-1 active:translate-y-1 active:shadow-none shrink-0"}
                        onclick={() => {
                            setCopyText("📋 Copied 🗸");
                            navigator.clipboard.writeText(password())
                                .then(() => {
                                    setTimeout(() => setCopyText("📋 Copy"), 1000);
                                });

                            setClearClipboardProgressBar(10);

                            let i = setInterval(() => {
                                setClearClipboardProgressBar(clearClipboardProgressBar() - 1);

                                if(clearClipboardProgressBar() != 0) return;

                                clearInterval(i);
                                navigator.clipboard.writeText("");
                            }, 1000);
                        }}
                    >
                        {copyText()}
                    </button>

                </div>
                {clearClipboardProgressBar() > 0 && (
                    <div class={"text-sm text-red mt-4 mb-2"}>
                        Clipboard will be cleared in {clearClipboardProgressBar()}s
                    </div>
                )}
                <div class={`rounded-full bg-red ${clearClipboardProgressBar() > 0 ? "h-1 w-[calc-size(auto,size)] duration-[10s]" : "w-0"} transition-all ease-linear`}/>
            </Section>
            <Section
                name={<>
                    Strength: {strength().name}
                </>}
                bg={() => strengthIndex()}
            >
                {strength().info}
            </Section>
        </>
    );
};

const ENTROPY_BOUNDARIES: {max?: number, name: string, info: string}[] = [
    {
        max: 39,
        name: "Insecure",
        info: "This password is easily guessed or cracked by brute-force attacks in seconds to minutes."
    },
    {
        max: 59,
        name: "Weak",
        info: "This password can be brute-forced with modern tools in hours to days."
    },
    {
        max: 79,
        name: "Moderate",
        info: "This password is acceptable for non-critical accounts or systems with rate-limited login attempts."
    },
    {
        max: 99,
        name: "Strong",
        info: "This password is resilient against most offline attacks and brute-forcing with current technology."
    },
    {
        name: "Very Strong",
        info: "This password is uncrackable with modern computing power for decades or centuries."
    }
];