import { getCollection } from "astro:content";

export const getAllPosts = async () => (await getCollection("posts"))
    .filter(e => import.meta.env.DEV || e.data.pubUnix !== undefined);