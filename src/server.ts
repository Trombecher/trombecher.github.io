import type {Tag} from "@/global.ts";
import {getCollection} from "astro:content";

export const getAllPosts = async(
    strip: boolean = !import.meta.env.DEV,
    onlyWithTag?: Tag,
) => (await getCollection("posts")).filter(post => !(strip && post.data.pubUnix === undefined)
    && (!onlyWithTag || (post.data.tags as readonly string[]).includes(onlyWithTag)));
