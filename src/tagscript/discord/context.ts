export interface Guild {
    afkChannelId: null | string,
    afkTimeout: number,
}

export interface DiscordContextLike {
    maxAttachmentSize: number,
    
    guild?: any,
    context?: "dm" | "guild" | "private",

}