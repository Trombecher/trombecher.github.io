import {convert_image, initSync} from "@/gen/image-converter/image_converter";
import {type Accessor, createSignal, For, onMount, type Signal} from "solid-js";
import wm from "@/gen/image-converter/image_converter_bg.wasm?url";

type InputFile = {
    fileName: string;
    progressOrContent: Accessor<Blob | number>;
    selectedOutputFormat: Signal<string>
}

export const SUPPORTED_OUTPUT_FORMATS = ["png", "jpeg", "gif", "bmp", "tiff", "avif", "webp"];

export const SupportedOutputFormats = () => (
    <ul>
        {SUPPORTED_OUTPUT_FORMATS.map(format => (
            <li>{format}</li>
        ))}
    </ul>
);

export default () => {
    const [images, setImages] = createSignal<InputFile[]>([]);
    const [_loaded, setLoaded] = createSignal(false);
    const [hovering, setHovering] = createSignal(false);

    onMount(async() => {
        const mod = await WebAssembly.compileStreaming(fetch(wm));
        initSync({module: mod});
        setLoaded(true);
    });

    const handleFiles = (files: File[]) => {
        for(const file of files) {
            const [progress, setProgress] = createSignal<number | Blob>(0);

            setImages(prev => [...prev, {
                progressOrContent: progress,
                fileName: file.name,
                selectedOutputFormat: createSignal("webp"),
            }]);

            const reader = new FileReader();
            reader.onloadend = () => {
                setProgress(new Blob([reader.result!], {type: file.type}));
            };

            reader.onprogress = e => {
                setProgress(e.loaded / e.total);
            };

            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <>
            <label
                attr:data-hovering={hovering() ? "" : null}
                class={"mt-12 transition data-[hovering]:bg-blue/20 select-none flex flex-col items-center justify-center aspect-video bg-blue/10 rounded-3xl border-dashed border-blue border-2 text-blue"}
                ondrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHovering(false);
                    handleFiles([...e.dataTransfer?.files || []]);
                }}
                ondragover={e => {
                    e.preventDefault();
                    setHovering(true);
                }}
                ondragleave={() => setHovering(false)}
            >
                <input
                    type="file"
                    class={"hidden w-full"}
                    onchange={e => {
                        handleFiles([...e.currentTarget.files || []]);
                    }}
                />
                <span class={"font-semibold"}>Drop your images here</span>
                <span class={"text-blue/80"}>or</span>
                <span class={"font-semibold"}>click to select files</span>
            </label>

            <div class={"grid grid-cols-1 sm:grid-cols-2 text-base gap-6 mb-12"}>
                <For each={images()}>
                    {image => (
                        <div
                            class={"rounded-3xl flex flex-col h-80 mt-6 p-6 border border-shade-100 overflow-hidden"}>
                            {(() => {
                                const progress = image.progressOrContent();

                                if(typeof progress === "number") {
                                    return (
                                        <div>{progress}</div>
                                    );
                                }

                                return (
                                    <img
                                        src={URL.createObjectURL(progress)}
                                        alt={""}
                                        class={"gap-6 min-h-0 h-full object-contain m-0 rounded-none"}
                                    />
                                );
                            }) as any}
                            <div class={"text-center mb-4 mt-2 italic"}>{image.fileName}</div>
                            <div class={"flex gap-4"}>
                                <select
                                    oninput={e => {
                                        image.selectedOutputFormat[1](e.currentTarget.value);
                                    }}
                                >
                                    {SUPPORTED_OUTPUT_FORMATS.toSorted().map(format => (
                                        <option selected={format === "webp"} value={format}>{format.toUpperCase()}</option>
                                    ))}
                                </select>
                                <button
                                    onclick={async() => {
                                        const format = image.selectedOutputFormat[0]();

                                        const blob = image.progressOrContent();
                                        if(typeof blob === "number") return;

                                        const convertedImage = convert_image(new Uint8Array(await blob.arrayBuffer()), format);
                                        const newFileName = `${image.fileName.slice(0, image.fileName.lastIndexOf("."))}.${format}`;

                                        const anchor = document.createElement("a");
                                        anchor.download = newFileName;
                                        anchor.href = URL.createObjectURL(new Blob([convertedImage]));
                                        document.body.append(anchor);
                                        anchor.click();
                                        document.body.removeChild(anchor);
                                    }}
                                    class={"block bg-blue rounded-full py-0.5 px-3 text-base text-white"}
                                >
                                    Get
                                </button>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </>
    );
}