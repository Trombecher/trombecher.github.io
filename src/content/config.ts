import { defineCollection, z } from "astro:content";

export const collections = {
    posts: defineCollection({
        type: "content",
        schema: ({ image }) => z.object({
            title: z.string(),
            pubUnix: z.coerce.date().optional(),
		    updatedUnix: z.coerce.date().optional(),
            tags: z.array(z.string()).optional(),
            description: z.string(),
            hero: image().refine(img => img.width * 9 === img.height * 16, {
                message: "Hero image must be 16/9"
            }).optional(),
        })
    })
};