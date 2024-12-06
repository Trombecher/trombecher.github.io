export const TAGS = ["Project", "Tool", "Article", "Game"] as const;

export const SLUG_TO_TAG = {
    tools: "Tool",
    articles: "Article",
    projects: "Project",
    games: "Game",
} as const;

export const TAG_TO_SLUG = {
    Tool: "tools",
    Article: "articles",
    Project: "projects",
    Game: "games",
} as const;

export const TAG_TO_DESCRIPTION = {
    Tool: "I was dissatisfied with the tools I had, so I made my own.",
    Article: "I like to write about things. They are here.",
    Project: "I have a lot of ideas, and a lot of unfinished ones...",
    Game: "The indie dev is thriving in me right now...",
};

export const TAG_TO_MULTIPLE = {
    Tool: "Tools",
    Article: "Articles",
    Project: "Projects",
    Game: "Games",
} as const;

export type Tag = typeof TAGS[number];
export type Slug = typeof TAG_TO_SLUG[Tag];
export type Multiple = typeof TAG_TO_MULTIPLE[Tag];

// export const toPascalCase = (s: string) => s[0]!.toUpperCase() + s.slice(1);