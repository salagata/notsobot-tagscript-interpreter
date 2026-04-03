import * as ansi from 'ansi-colors'

export function processMarkup(text: string) {
    // TODO: An efficient way to do this, add more types, better processing of stacked types
    return text.replaceAll(/\*\*\*(.+?)\*\*\*/gs,(match,txt) => {
        return ansi.italic.bold(txt);
    })
    .replaceAll(/\~\~(.+?)\~\~/gs,(match,txt) => {
        return ansi.strikethrough(txt);
    })
    .replaceAll(/\_\_(.+?)\_\_/gs,(match,txt) => {
        return ansi.underline(txt);
    })
    .replaceAll(/\*\*(.+?)\*\*/gs,(match,txt) => {
        return ansi.bold(txt);
    })
    .replaceAll(/\*(.+?)\*/gs,(match,txt) => {
        return ansi.italic(txt);
    })
    .replaceAll(/\_(.+?)\_/gs,(match,txt) => {
        return ansi.italic(txt);
    })
    .replaceAll(/\`(.+?)\`/gs,(match,txt) => {
        return ansi.bgBlackBright(txt);
    })
}
