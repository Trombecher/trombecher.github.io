import { getCollection } from "astro:content";

export const getAllPosts = async (
    strip: boolean = !import.meta.env.DEV,
    onlyWithTag?: string
) => (await getCollection("posts")).filter(post => (!strip || post.data.pubUnix !== undefined)
        && (!onlyWithTag || (post.data.tags as readonly string[]).includes(onlyWithTag)));

export const TAGS = ["tools", "articles"] as const;

export const toPascalCase = (s: string) => s[0]!.toUpperCase() + s.slice(1);