import type {Accessor} from "solid-js";

export default ({state, onToggle}: {
    state: Accessor<boolean>,
    onToggle: () => void
}) => {
    return (
        <button
            class={`h-8 w-14 ${state() ? "bg-blue" : "bg-shade-300"} cursor-pointer shrink-0 rounded-full flex p-1 transition-all`}
            role={"switch"}
            onclick={onToggle}
        >
            <div class={`w-6 h-6 bg-white rounded-full transition-all ${state() ? "ml-6" : "ml-0"}`}></div>
        </button>
    );
}