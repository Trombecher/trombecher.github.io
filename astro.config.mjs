import {defineConfig} from "astro/config";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import viteBasicSslPlugin from "@vitejs/plugin-basic-ssl";

// https://astro.build/config
export default defineConfig({
    integrations: [solidJs(), mdx()],
    vite: {
        plugins: [
            tailwindcss(),
            viteBasicSslPlugin({
                name: "yoyoyoyoyo",
            })
        ]
    },
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