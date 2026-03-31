// A simple compiler for testing
// context: The Discord Context
// value: The script to parse
// args: An string with the args
// variables: Variables
// tagContext: For now just the MathWorker
// limits: Limits
// shouldTrim: just asking if trim
import type { TagLimits, TagVariables, TagResult,  } from "./tagscript.model"

import { PrivateVariables, TagIfComparisons } from "./tagscript.constants";

export const TAG_IF_COMPARISONS = [
  TagIfComparisons.EQUAL,
  TagIfComparisons.EQUAL_NOT,
  TagIfComparisons.GREATER_THAN,
  TagIfComparisons.GREATER_THAN_OR_EQUAL,
  TagIfComparisons.LESS_THAN,
  TagIfComparisons.LESS_THAN_OR_EQUAL,
  TagIfComparisons.TILDE,
];

export const TagLimitDefaults: TagLimits = Object.freeze({
  MAX_AI_EXECUTIONS: 1,
  MAX_API_MANIPULATIONS: 1,
  MAX_ATTACHMENTS: 10,
  MAX_COMPONENT_EXECUTIONS: 2,
  MAX_EMBEDS: 10,
  MAX_ITERATIONS: 450,
  MAX_NETWORK_REQUESTS: 15,
  MAX_NETWORK_REQUESTS_ML: 5,
  MAX_NETWORK_REQUESTS_OPENAI: 2,
  MAX_PAGES: 1000,
  MAX_STORAGE_GLOBAL_AMOUNT: 5,
  MAX_STORAGE_GUILD_AMOUNT: 5,
  MAX_STORAGE_CHANNEL_AMOUNT: 5,
  MAX_STORAGE_USER_AMOUNT: 5,
  MAX_STORAGE_KEY_LENGTH: 128,
  MAX_STORAGE_VALUE_LENGTH: 16384,
  MAX_TAG_EXECUTIONS: 2,
  MAX_TIME_REGEX: 25,
  MAX_VARIABLE_KEY_LENGTH: 64,
  MAX_VARIABLE_LENGTH: 1 * 1024 * 1024,
  MAX_VARIABLES: 100,
});

export function parse(context: any,
    value: string,
    args: string = '',
    variables: Partial<TagVariables> = Object.create(null),
    tagContext: any = Object.create(null),
    limits: Partial<TagLimits> = Object.create(null),
    shouldTrim: boolean = true) {
    const tag: TagResult = {
        text:value,
        variables: {
            ...variables
        },
        limits: limits,
        context: tagContext
    }

    tag.variables[PrivateVariables.ARGS_STRING] = args;
    tag.variables[PrivateVariables.ARGS] = args.split(/\s+/);

    // A simple processor for Testing-only
    const regex = /\{((?:(?!:)(?:.|\s))*)(?::([\s\S]+?))?\}/g;

    // Alternative syntax using RegExp constructor
    // const regex = new RegExp('\\{((?:(?!:)(?:.|\\s))*):([\\s\\S]+?)\\}', 'g')

    tag.text = tag.text.replace(regex,(match,firstGroup: string,secondGroup: string) => {
        switch (firstGroup) {
            case "set":
                tag.limits.MAX_ITERATIONS!--
                const [key, value] = secondGroup.split("|");
                tag.variables[key] = value;
                return "";
            case "get":
                (tag.limits as any)[PrivateVariables.ITERATIONS_REMAINING]--;
                return tag.variables[secondGroup];
            case "math":
                (tag.limits as any)[PrivateVariables.ITERATIONS_REMAINING]--;
                tag.context.mathWorker.working = true;
                return eval(secondGroup);
            case "guild":
                (tag.limits as any)[PrivateVariables.ITERATIONS_REMAINING]--;
                return context.guild;
            case "args":
                (tag.limits as any)[PrivateVariables.ITERATIONS_REMAINING]--;
                return tag.variables["__argsString"];
            case "arg":
                (tag.limits as any)[PrivateVariables.ITERATIONS_REMAINING]--;
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