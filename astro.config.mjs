// @ts-check
import {defineConfig} from "astro/config";

import solidJs from "@astrojs/solid-js";

import tailwind from "@astrojs/tailwind";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
    integrations: [solidJs(), tailwind(), mdx()],
    trailingSlash: "always",
    site: "https://trombecher.github.io",
    markdown: {
        shikiConfig: {
            theme: "github-light-default"
        }
    },
    build: {
        inlineStylesheets: "always",
    }
});