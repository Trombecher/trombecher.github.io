import Button from "@/comp/system/Button";
import {createSignal} from "solid-js";

const readHTMLFromClipboard = async() => {
    const items = await navigator.clipboard.read();
    for(const item of items) {
        if(item.types.includes("text/html")) {
            const blob = await item.getType("text/html");
            return await blob.text();
        }
    }
    throw new Error("No HTML content found in clipboard.");
};

const getCharWidthAndBaseline = (
    char: string,
    fontSize: string,
    lineHeight: number,
    fontFamily = "JetBrains Mono",
) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if(!context) throw new Error("No canvas context.");

    context.font = `${fontSize}/${lineHeight} '${fontFamily}'`;
    const metrics = context.measureText(char);

    return [metrics.width, metrics.fontBoundingBoxAscent] as const;
};

const convertToSVG = (htmlContent: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;

    const container = temp.children[0] as HTMLDivElement | null;
    if(!container) throw new Error("No container found.");

    const defaultTextColor = container.style.color;
    const bgColor = container.style.backgroundColor;
    const defaultFontWeight = container.style.fontWeight;
    const fontSize = container.style.fontSize;
    const lineHeight = container.style.lineHeight;
    const [charWidth, baseline] = getCharWidthAndBaseline("x", fontSize, +lineHeight.slice(0, -2));
    const lineHeightPx = parseInt(container.style.lineHeight.slice(0, -2));

    const rootSVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    rootSVGElement.innerHTML = `<style>text { white-space: pre; color: ${defaultTextColor}; }</style>`;
    rootSVGElement.setAttribute("fill", bgColor);

    // <rect width='100%' height='100%' fill='${bgColor}'/>

    let y = 0;

    let longestX = 0;

    for(const lineDiv of container.children) {
        if(lineDiv.tagName === "BR") {
            y += lineHeightPx;
            continue;
        }

        let x = 0;

        for(const span of lineDiv.children) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

            text.setAttribute("fill", (span as HTMLSpanElement).style.color);
            text.setAttribute("x", "" + x);
            text.setAttribute("y", "" + (y + baseline));
            text.setAttribute("font-size", fontSize);
            text.setAttribute("font-weight", defaultFontWeight);
            text.setAttribute("line-height", lineHeight);
            text.setAttribute("font-family", "JetBrains Mono");
            text.textContent = span.textContent;

            rootSVGElement.append(text);

            x += (span.textContent ?? "").length * charWidth;
        }

        y += lineHeightPx;

        if(x > longestX) longestX = x;
    }

    rootSVGElement.setAttribute("viewBox", `0 0 ${longestX} ${y}`);
    rootSVGElement.setAttribute("width", "" + longestX);
    rootSVGElement.setAttribute("height", "" + y);

    return rootSVGElement.outerHTML;
};

// async function copySVGToClipboard(svgString) {
//     const blob = new Blob([svgString], {type: "image/svg+xml"});
//     const clipboardItem = new ClipboardItem({"image/svg+xml": blob});
//     await navigator.clipboard.write([clipboardItem]);
// }

const ENTITIES: Record<string, string> = {
    // '&amp;': '&',
    // '&lt;': '<',
    // '&gt;': '>',
    // '&quot;': '"',
    // '&#039;': "'",
    "&ndash;": "-",
    "&nbsp;": " ",
};

const replaceHTMLEntities = (str: string) => {
    return str.replaceAll(/&[\w#]+;/g, entity => {
        return ENTITIES[entity] || entity;
    });
};

export default () => {
    const [showSuccess, setShowSuccess] = createSignal(false);

    return (
        <section class={"py-12 flex"}>
            <Button
                class={"mx-auto"}
                onclick={async() => {
                    try {
                        const html = await readHTMLFromClipboard();
                        const svg = convertToSVG(html);

                        await navigator.clipboard.writeText(replaceHTMLEntities(svg));

                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 1000);
                    } catch(err) {
                        console.error(err);
                        alert("Error: " + (err as Error).message);
                    }
                }}
            >
                {showSuccess() ? "Copied!" : "Convert"}
            </Button>
        </section>
    );
}