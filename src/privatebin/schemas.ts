import {z} from "zod";

const SCHEMA_BASE64 = z.string()
    .base64()
    .transform(x => Uint8Array.from(atob(x), c => c.charCodeAt(0)).buffer);

const SCHEMA_ALGORITHM = z.literal("aes");

const SCHEMA_TAG_SIZE = z.union([
    z.literal(32),
    z.literal(64),
    z.literal(96),
    z.literal(104),
    z.literal(112),
    z.literal(112),
    z.literal(128),
]);

const SCHEMA_KEY_SIZE = z.union([
    z.literal(128),
    z.literal(128),
    z.literal(256),
]);

const SCHEMA_MODE = z.enum(["ctr", "cbc", "gcm"])
    .default("gcm");

const SCHEMA_COMPRESSION = z.enum(["zlib", "none"])
    .default("zlib");

const SCHEMA_CIPHER_PARAMETERS = z.tuple([
    SCHEMA_BASE64,
    SCHEMA_BASE64,
    z.number().int().min(1),
    SCHEMA_KEY_SIZE,
    SCHEMA_TAG_SIZE,
    SCHEMA_ALGORITHM,
    SCHEMA_MODE,
    SCHEMA_COMPRESSION,
]).transform(([
    iv,
    salt,
    iterations,
    keySize,
    tagSize,
    algorithm,
    mode,
    compression,
]) => ({
    iv,
    salt,
    iterations,
    keySize,
    tagSize,
    algorithm,
    mode,
    compression,
}));

const SCHEMA_FORMATTER = z.enum([
    "plaintext",
    "syntaxhighlighting",
    "markdown",
]).default("plaintext");

const SCHEMA_AUTHENTICATED_DATA = z.tuple([
    SCHEMA_CIPHER_PARAMETERS,
    SCHEMA_FORMATTER,
    z.coerce.boolean(),
    z.coerce.boolean(),
]).transform(([
    cipherParameters,
    formatter,
    openDiscussion,
    burnAfterReading,
]) => ({
    cipherParameters,
    formatter,
    openDiscussion,
    burnAfterReading,
}));

const SCHEMA_META_DATA = z.object({
    expire: z.enum([
        "5min",
        "10min",
        "1hour",
        "1day",
        "1week",
        "1month",
        "1year",
        "never",
    ]).default("1week"),
    time_to_live: z.number().int().min(1),
}).transform(({expire, time_to_live}) => ({
    expire,
    timeToLive: time_to_live,
}));

const SCHEMA_COMMENT_META_DATA = z.object({
    created: z.number().int(),
    icon: z.string(),
});

const SCHEMA_COMMENT = z.object({
    status: z.number().int(),
    id: z.string(),
    pasteid: z.string(),
    parentid: z.string(),
    url: z.string(),
    v: z.literal(2),
    ct: SCHEMA_BASE64,
    adata: SCHEMA_AUTHENTICATED_DATA,
    meta: SCHEMA_COMMENT_META_DATA,
}).transform(({
    pasteid,
    parentid,
    ct,
    adata,
    meta,
    v,
    ...rest
}) => ({
    pasteId: pasteid,
    parentId: parentid,
    cipherText: ct,
    authenticatedData: adata,
    metaData: meta,
    ...rest
}));

export type PasteData = z.infer<typeof SCHEMA_PASTE_DATA>;

export const SCHEMA_PASTE_DATA = z.object({
    status: z.number().int(),
    id: z.string(),
    deletetoken: z.string().optional(),
    url: z.string(),
    v: z.literal(2),
    ct: SCHEMA_BASE64,
    adata: SCHEMA_AUTHENTICATED_DATA,
    meta: SCHEMA_META_DATA,
    comments: z.array(SCHEMA_COMMENT),
    comment_count: z.number().int().min(0),
    comment_offset: z.number().int().min(0),
}).transform(({
    deletetoken,
    adata,
    meta,
    ct,
    v,
    comment_count,
    comment_offset,
    ...rest
}) => ({
    deleteToken: deletetoken,
    authenticatedData: adata,
    metaData: meta,
    cipherText: ct,
    commentCount: comment_count,
    commentOffset: comment_offset,
    ...rest
}))