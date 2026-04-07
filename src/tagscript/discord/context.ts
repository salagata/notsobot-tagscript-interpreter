export interface DiscordContextLike {
    maxAttachmentSize: number,
    
    guild?: any,
    context?: "dm" | "guild" | "private",

}