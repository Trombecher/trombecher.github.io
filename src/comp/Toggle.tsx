import type {Accessor, Setter} from "solid-js";

export default ({state, setState}: {state: Accessor<boolean>, setState: Setter<boolean>}) => {
    return (
        <button
            class={`h-8 w-14 ${state() ? "bg-blue" : "bg-black/30"} rounded-full flex p-1 transition-all`}
            role={"switch"}
            onclick={setState}
        >
            <div class={`w-6 h-6 bg-white rounded-full transition-all ${state() ? "ml-6" : "ml-0"}`}></div>
        </button>
    )
}