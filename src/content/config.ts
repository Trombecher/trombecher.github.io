import { TAGS } from "@/server-util";
import { defineCollection, z } from "astro:content";

export const collections = {
    posts: defineCollection({
        type: "content",
        schema: ({ image }) => z.object({
            title: z.string(),
            pubUnix: z.coerce.date().optional(),
		    updatedUnix: z.coerce.date().optional(),
            tags: z.array(z.enum(TAGS)).min(1).refine(array => new Set(array).size === array?.length, {
                message: "Duplicate tag(s)",
            }),
            description: z.string(),
            hero: image().refine(img => img.width * 9 === img.height * 16, {
                message: "Hero image must be 16/9"
            }).optional(),
        })
    })
};