// A simple compiler for testing
// context: The Discord Context
// value: The script to parse
// args: An string with the args
// variables: Variables
// tagContext: For now just the MathWorker
// limits: Limits
// shouldTrim: just asking if trim
import type { TagLimits, TagVariables, TagResult} from "./tagscript.model"

export function parse(context: any,
    value: string,
    args: string = '',
    variables: TagVariables = Object.create(null),
    tagContext: any = Object.create(null),
    limits: Partial<TagLimits> = Object.create(null),
    shouldTrim: boolean = true) {
    const tag: TagResult = {
        text:value,
        variables: {
            "__argsString": args,
            "__args": args.split(/\s+/),
            ...variables
        },
        limits: limits,
        context: tagContext
    }
    const regex = /\{((?:(?!:)(?:.|\s))*)(?::([\s\S]+?))?\}/g;

    // Alternative syntax using RegExp constructor
    // const regex = new RegExp('\\{((?:(?!:)(?:.|\\s))*):([\\s\\S]+?)\\}', 'g')

    tag.text = tag.text.replace(regex,(match,firstGroup: string,secondGroup: string) => {
        switch (firstGroup) {
            case "set":
                tag.limits.iterationsRemaining!--
                const [key, value] = secondGroup.split("|");
                tag.variables[key] = value;
                return "";
            case "get":
                tag.limits.iterationsRemaining!--
                return tag.variables[secondGroup];
            case "math":
                tag.limits.iterationsRemaining!--
                tag.context.mathWorker.working = true;
                return eval(secondGroup);
            case "guild":
                tag.limits.iterationsRemaining!--
                return context.guild;
            case "args":
                tag.limits.iterationsRemaining!--
                return tag.variables["__argsString"];
            case "arg":
                tag.limits.iterationsRemaining!--
                return (tag.variables["__args"] as string[])[Number(secondGroup)];
            case "note":
                return '';
            case "ignore":
                return secondGroup;
            default:
                break;
        }
    })

    return tag;
}