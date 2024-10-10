import {defineConfig} from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

const modPlugin = () => tree => {
    for(const child of tree.children) {
        if(child.type === "element") {
            visit(child, node => {
                if(node.tagName !== "li") return;

                const first = node.children[0],
                    nextBlockTagIndex = node.children.findIndex(node => !isInline(node));

                // const nextBlockTag = node.children[nextBlockTagIndex];

                // !["ol", "ul"].includes(nextBlockTag?.tagName)

                if(nextBlockTagIndex !== -1 && isInline(first))
                    node.children.splice(0, nextBlockTagIndex, {
                        type: "element",
                        tagName: "p",
                        children: [node.children.slice(0, nextBlockTagIndex)],
                    });
            });
        }
    }
};

const visit = (element, callback) => {
    callback(element);
    if(!element.children) return;
    for(const child of element.children) visit(child, callback);
};

const isInline = node => node?.type === "text" || ["code", "em", "i", "b", "a"].includes(node?.tagName);

// https://astro.build/config
export default defineConfig({
    site: "https://trombecher.github.io",
    integrations: [mdx(), sitemap(), tailwind()],
    markdown: {
        shikiConfig: {
            theme: "github-dark-default"
        },
        rehypePlugins: []
    },
    vite: {
        esbuild: {
            jsxInject: "import {createElement, Fragment} from \"aena\"",
        }
    }
});