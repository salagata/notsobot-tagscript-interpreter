// A simple compiler for testing
// context: The Discord Context
// value: The script to parse
// args: An string with the args
// variables: Variables
// tagContext: For now just the MathWorker
// limits: Limits
// shouldTrim: just asking if trim, MOSLTY USELESS
function parse(context,value,args,variables,tagContext,limits,shouldTrim) {
    const tag = {
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

    // Reset `lastIndex` if this regex is defined globally
    // regex.lastIndex = 0;

    tag.text = tag.text.replace(regex,(match,firstGroup,secondGroup) => {
        switch (firstGroup) {
            case "set":
                tag.limits.iterationsRemaining--
                const [key, value] = secondGroup.split("|");
                tag.variables[key] = value;
                return "";
            case "get":
                tag.limits.iterationsRemaining--
                return tag.variables[secondGroup];
            case "math":
                tag.limits.iterationsRemaining--
                tag.context.mathWorker.working = true;
                return eval(secondGroup);
            case "guild":
                tag.limits.iterationsRemaining--
                return context.guild;
            case "args":
                tag.limits.iterationsRemaining--
                return tag.variables["__argsString"];
            case "arg":
                tag.limits.iterationsRemaining--
                return tag.variables["__args"][Number(secondGroup)];
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


module.exports = parse;