import type { DiscordContextLike } from "./discord/context";

export function requestGuildContext(context: DiscordContextLike) {
    if (!context?.guild && (context?.context != "guild")) {
        throw new Error("A guild context was not specified");
    }
}