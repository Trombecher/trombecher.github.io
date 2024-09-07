import { defineCollection, z } from "astro:content";

export const collections = {
    blog: defineCollection({
        type: "content",
        schema: ({ image }) => z.object({
            title: z.string(),
            pubUnix: z.coerce.date(),
		    updatedUnix: z.coerce.date().optional(),
            tags: z.array(z.string()).optional(),
            hero: image().refine(img => img.width * 9 === img.height * 16, {
                message: "Hero image must be 16/9"
            }).optional(),
        })
    })
};