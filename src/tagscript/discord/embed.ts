interface EmbedAuthor {
    name?: string,
    iconUrl?: string,
    proxyIconUrl?: string,
    url?: string,
}

interface EmbedField {
    name?: string,
    value?: string,
    inline?: boolean,
}

interface EmbedFooter {
    iconUrl?: string,
    proxyIconUrl?: string,
    text?: string
}

interface EmbedImage {
    url: string,
    proxyUrl?: string,
    height?: number,
    width?: number
}

interface EmbedThumbnail extends EmbedImage {}

interface Embed {
    author?: EmbedAuthor,
    color?: number,
    description?: string,
    fields?: [EmbedField],
    footer?: EmbedFooter,
    image?: EmbedImage,
    thumbnail?: EmbedThumbnail,
    timestamp?: Date,
    title?: string,
    type: string,
    url?: string,
}