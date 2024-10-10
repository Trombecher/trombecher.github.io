import {insertList, insertToString} from "aena";
import {derive, get, List, setState, State} from "aena/state";
import {type CIE1931XYZ, toCIE1931XYZFromSRGB} from "allc/cie1931xyz";
import {toSRGBFromCIE1931XYZ} from "allc/srgb";
import {randomRGB, toHexFromRGBNumber, toRGBFromRGBNumber, toRGBNumberFromHex, toRGBNumberFromRGB} from "allc/rgb";
import {toHSLFromRGB} from "allc/hsl";

export default () => {
    const pads = new List<State<Readonly<CIE1931XYZ>>>([
        new State(toCIE1931XYZFromSRGB({r: 1, g: 0, b: 0})),
        new State(toCIE1931XYZFromSRGB({r: 1, g: 1, b: 0})),
        new State(toCIE1931XYZFromSRGB({r: 0, g: 1, b: 0})),
        new State(toCIE1931XYZFromSRGB({r: 0, g: 1, b: 1})),
        new State(toCIE1931XYZFromSRGB({r: 0, g: 0, b: 1})),
    ]);

    document.body.onkeydown = e => {
        if(e.key !== " ") return;

        for(const pad of get(pads)) {
            setState(pad, toCIE1931XYZFromSRGB(randomRGB()))
        }
    };

    return (
        <div className={"w-full h-full flex max-lg:flex-col select-none"}>
            {insertList(pads, cieXYZ => {
                const srgb = derive(cieXYZ, cie => toSRGBFromCIE1931XYZ(cie));
                const hsl = derive(srgb, srgb => toHSLFromRGB(srgb));
                const hex = derive(srgb, srgb => toHexFromRGBNumber(toRGBNumberFromRGB(srgb)));

                return (
                    <div className={"w-full h-full text-2xl font-semibold flex px-6 py-12 items-center lg:flex-col lg:justify-end text-adjust"} _style={derive(hex, hex => `background-color:#${hex};--adjust:${get(hsl).l > 0.5 ? "0 0 0" : "255 255 255"}`)}>
                        <label className={"block px-4 py-1 cursor-pointer hover:bg-adjust/10 active:bg-adjust/20 transition rounded-xl"} role={"button"}>
                            #{insertToString(hex)}
                            <input
                                type="color"
                                className={"w-0 h-0 p-0 m-0 border-0 [appearance:none] [inline-size:0] [block-size:0]"}
                                oninput={e => {
                                    setState(cieXYZ, toCIE1931XYZFromSRGB(toRGBFromRGBNumber(toRGBNumberFromHex(e.currentTarget.value))))
                                }}
                            />
                        </label>
                    </div>
                );
            })}
        </div>
    );
};