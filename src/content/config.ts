import { defineCollection, z } from "astro:content";

export const collections = {
    blog: defineCollection({
        type: "content",
        schema: z.object({
            title: z.string(),
            pubUnix: z.coerce.number(),
		    updatedUnix: z.coerce.number().optional(),
            tags: z.array(z.string()).optional(),
            hero: z.string().optional()
        })
    })
};