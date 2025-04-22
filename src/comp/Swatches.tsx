import {createSignal} from "solid-js";
import {oklab, type Oklch, srgb} from "@thi.ng/color";

// https://www.npmjs.com/package/@thi.ng/color

const SUPPORTED_GAMUTS = ["sRGB", "DCI-P3"] as const;

type Gamut = typeof SUPPORTED_GAMUTS[number];

const isInSRGB = (oklch: Oklch) => {
     const color = srgb(oklch);
     return color.r >= 0 && color.r <= 1
         && color.g >= 0 && color.g <= 1
         && color.b >= 0 && color.b <= 1;
};

const isInDCI_P3 = (oklch: Oklch) => {
    const color = oklab(oklch);
    return color.l >= 0 && color.l <= 1
        && color.a >= -0.5 && color.a <= 0.5
        && color.b >= -0.5 && color.b <= 0.5;
};

const maxChromaForLHInGamut = (l: number, h: number, gamut: Gamut) => {

}

export default () => {
    const [hue, setHue] = createSignal(Math.floor(Math.random() * 360));
    const [saturation, setSaturation] = createSignal(Math.floor(Math.random() * 100)); // In percent
    const [targetGamut, setTargetGamut] = createSignal<Gamut>("sRGB");


    return (
        <>
            <section class={"mt-6 border border-shade-100 p-6 rounded-3xl"}>
                <label class={"block"}>
                    Hue: {hue()}°
                    <input
                        class={"block w-full accent-blue"}
                        type="range"
                        min={0}
                        max={359}
                        step={1}
                        value={hue()}
                        oninput={e => setHue(Number(e.currentTarget.value))}
                    />
                </label>
                <label class={"block mt-4"}>
                    Saturation: {saturation()}%
                    <input
                        type="range"
                        class={"block w-full accent-blue"}
                        min={0}
                        max={100}
                        step={1}
                        value={saturation()}
                        oninput={e => setSaturation(Number(e.currentTarget.value))}
                    />
                </label>

                <div class={"mt-4 mb-1"}>
                    Target Gamut:
                </div>
                {SUPPORTED_GAMUTS.map(space => (
                    <label class={"block pl-4"}>
                        <input
                            checked={space === targetGamut()}
                            type="radio"
                            name={"cs"}
                            onInput={() => setTargetGamut(space)}
                            class={"mr-2"}
                        />
                        {space}
                    </label>
                ))}
            </section>
            <section class={"mt-6 overflow-hidden"}>
                {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((l) => (
                    <div class={"flex"}>
                        <div class={"w-full"}>
                            l: {l}
                        </div>
                        <div class={"w-full"}
                             style={`background-color: oklch(${1 - l / 1000} ${saturation() / 100 * maxChromaForLHInGamut(1 - l / 1000, hue(), targetGamut())} ${hue()})`}>
                        </div>
                    </div>
                ))}
            </section>
        </>
    );
}