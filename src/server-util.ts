import { getCollection } from "astro:content";

export const getAllPosts = async (
    strip: boolean = !import.meta.env.DEV,
    onlyWithTag?: Tag
) => (await getCollection("posts")).filter(post => !(strip && post.data.pubUnix === undefined)
        && (!onlyWithTag || (post.data.tags as readonly string[]).includes(onlyWithTag)));

export const TAGS = ["Tool", "Article", "Project"] as const;

export const SLUG_TO_TAG = {
    tools: "Tool",
    articles: "Article",
    projects: "Project"
} as const;

export const TAG_TO_SLUG = {
    Tool: "tools",
    Article: "articles",
    Project: "projects"
} as const;

export const TAG_TO_MULTIPLE = {
    Tool: "Tools",
    Article: "Articles",
    Project: "Projects"
} as const;

export type Tag = typeof TAGS[number];
export type Slug = typeof TAG_TO_SLUG[Tag];
export type Multiple = typeof TAG_TO_MULTIPLE[Tag];

// export const toPascalCase = (s: string) => s[0]!.toUpperCase() + s.slice(1);