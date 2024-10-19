import {derive, setState, State} from "aena/state";
import {insertToString} from "aena";

export default async function() {
    // @ts-ignore
    if(typeof DeviceOrientationEvent.requestPermission === "function" && "denied" === await DeviceOrientationEvent.requestPermission())
        throw ":("

    const beta = new State<number>(0);
    const gamma = new State<number>(0);

    ondeviceorientation = e => {
        setState(beta, Math.round(e.beta!));
        setState(gamma, Math.round(e.gamma!));
    }

    return (
        <div className={derive(gamma, gamma => `${gamma <= 45 && gamma >= 0 ? "bg-[#0f0]" : gamma >= -45 && gamma <= 0 ? "bg-[#f00]" : ""} p-12`)}>
            Beta: {insertToString(beta)} <br/>
            Gamma: {insertToString(gamma)}
        </div>
    )
}