import {type PasteData, SCHEMA_PASTE_DATA} from "@/privatebin/schemas";

export const getPasteContent = async(
    provider: string,
    pasteId: string,
): Promise<PasteData> => {
    const json = await (await fetch(
        `${provider}?${pasteId}`,
        {
            headers: {
                "X-Requested-With": "JSONHttpRequest",
            },
        },
    )).json();

    return SCHEMA_PASTE_DATA.parse(json);
};