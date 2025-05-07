import {getAllPosts} from "@/server.ts";
import rss from "@astrojs/rss";
import type {APIRoute} from "astro";

export const GET: APIRoute = async context => {
    return rss({
        title: "Tobias Hillemanns",
        description: "This is my personal portfolio website.",
        site: context.site!,
        items: (await getAllPosts(true)).map((post) => ({
            link: `/${post.slug}/`,
            author: "Tobias Hillemanns",
            pubDate: post.data.pubUnix,
            description: post.data.description,
            title: post.data.title,
        })),
    });
};