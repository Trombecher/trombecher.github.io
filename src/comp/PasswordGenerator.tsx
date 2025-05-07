import {EX_SYMBOLS, generatePassword, LEGACY_SYMBOLS, LOWER_CASE, NUMBERS, UPPER_CASE} from "@/client.ts";
import Button from "@/comp/system/Button";
import Toggle from "@/comp/system/Toggle";
import {rockyou} from "@/rockyou";
import {type Accessor, createMemo, createSignal, type JSX, type Signal} from "solid-js";
import {effect} from "solid-js/web";

const OPTIONS = [UPPER_CASE, LOWER_CASE, NUMBERS, LEGACY_SYMBOLS, EX_SYMBOLS] as const;

const OPTION_TO_NAME: { [Key in typeof OPTIONS[number]]: string } = {
    [UPPER_CASE]: "Uppercase",
    [LOWER_CASE]: "Lowercase",
    [NUMBERS]: "Numbers",
    [LEGACY_SYMBOLS]: "Legacy Symbols",
    [EX_SYMBOLS]: "Other Symbols (may not be supported)",
};

const enum SectionBackgroundColor {
    DarkRed = 0,
    Red = 1,
    Yellow = 2,
    Black = 3,
    Blue = 4,
}

const Section = ({
    name,
    add,
    children,
    bg = () => SectionBackgroundColor.Black,
}: {
    name: JSX.Element,
    add?: JSX.Element,
    children?: JSX.Element,
    bg?: Accessor<SectionBackgroundColor>
}) => (
    <section class={`mt-6 p-6 rounded-3xl border-2 border-shade-100 ${(() => {
        switch(bg()) {
            case SectionBackgroundColor.DarkRed:
                return "bg-red/70";
            case SectionBackgroundColor.Red:
                return "bg-red/50";
            case SectionBackgroundColor.Yellow:
                return "bg-yellow/50";
            case SectionBackgroundColor.Blue:
                return "bg-blue/10";
            case SectionBackgroundColor.Black:
                return "";
        }
    })()}`}>
        <div class={"mb-6 flex"}>
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

    optionSelected[EX_SYMBOLS][1](false);

    const charset = createMemo(() => Object.entries(optionSelected).reduce((acc, [option, [selected]]) => selected() ? acc + option : acc, ""));

    effect(() => {
        if(customPassword) return;

        regenerate();

        setPassword(generatePassword(length(), charset()));
    });

    const [showPassword, setShowPassword] = createSignal(false);
    const [copyText, setCopyText] = createSignal("📋 Copy");

    const entropy = () => Math.round(length() * Math.log2(charset().length) * 100) / 100;
    const strengthIndex = createMemo(() => ENTROPY_BOUNDARIES.findIndex(({max}) => !max || max >= entropy())!);
    const strength = () => ENTROPY_BOUNDARIES[strengthIndex()]!;

    return (
        <>
            <Section name={"Character Set"}>
                {OPTIONS.map(option => (
                    <label
                        class={"flex gap-3 cursor-pointer mt-2 select-none"}
                    >
                        <Toggle
                            onToggle={() => {
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
            >
                <div class={"flex gap-4"}>
                    <Button
                        onMouseDown={() => {
                            customPassword = false;
                            setRegenerate(Math.random());
                        }}
                    >🔄 Regenerate</Button>
                    <Button
                        onclick={() => {
                            setCopyText("📋 Copied 🗸");
                            navigator.clipboard.writeText(password())
                                .then(() => {
                                    setTimeout(() => setCopyText("📋 Copy"), 1000);
                                });
                        }}
                    >
                        {copyText()}
                    </Button>
                </div>
                <div class={"flex gap-4 mt-6"}>
                    <Button
                        title={"Show / hide password"}
                        onclick={() => {
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
                    </Button>
                    <input
                        type={showPassword() ? "text" : "password"}
                        class={"tracking-tight min-w-0 overflow-x-auto bg-shade-100 rounded-xl block px-3 font-mono grow"}
                        value={password()}
                        oninput={e => {
                            customPassword = true;
                            setPassword(e.target.value);
                        }}
                    />
                </div>
            </Section>
            <Section
                name={<>
                    Strength: {strength().name}
                </>}
                bg={() => strengthIndex()}
            >
                {(() => strength().info) as any}

                {rockyou.has(password()) && (
                    <div class={"bg-red text-black mt-4 p-4 rounded-2xl font-bold"}>
                        Your password is in the top 10,000 most common passwords. DO NOT USE THIS PASSWORD!
                    </div>
                )}
            </Section>
        </>
    );
};

const ENTROPY_BOUNDARIES: {max?: number, name: string, info: string}[] = [
    {
        max: 39,
        name: "Insecure",
        info: "This password is easily guessed or cracked by brute-force attacks in seconds to minutes.",
    },
    {
        max: 59,
        name: "Weak",
        info: "This password can be brute-forced with modern tools in hours to days.",
    },
    {
        max: 79,
        name: "Moderate",
        info: "This password is acceptable for non-critical accounts or systems with rate-limited login attempts.",
    },
    {
        max: 99,
        name: "Strong",
        info: "This password is resilient against most offline attacks and brute-forcing with current technology.",
    },
    {
        name: "Very Strong",
        info: "This password is uncrackable with modern computing power for decades or centuries.",
    },
];