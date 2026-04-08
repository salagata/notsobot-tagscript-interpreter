// A simple compiler for testing
// context: The Discord Context
// value: The script to parse
// args: An string with the args
// variables: Variables
// tagContext: For now just the MathWorker
// limits: Limits
// shouldTrim: just asking if trim
import type { TagLimits, TagVariables, TagResult } from "./tagscript.model"

import { ATTACHMENT_URL_REGEX, PrivateVariables, REGEX_ARGUMENT_SPLITTER, REGEX_ARGUMENT_SPLITTER_ESCAPE_REPLACEMENT, TagIfComparisons, TagSettings, TagSymbols } from "./tagscript.constants";
import * as Parameters from './parameters';

import { TagFunctions, TagFunctionsToString } from './tagFunctions';
import { ScriptTags } from './scriptTags';
import { TagExitError } from "./exceptions";
import { getCodeLanguage } from "./utils";

import type { DiscordContextLike } from "./discord/context";

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
export const TagWithoutLimits: TagLimits = Object.freeze({
  MAX_AI_EXECUTIONS: Infinity,
  MAX_API_MANIPULATIONS: Infinity,
  MAX_ATTACHMENTS: Infinity,
  MAX_COMPONENT_EXECUTIONS: Infinity,
  MAX_EMBEDS: Infinity,
  MAX_ITERATIONS: Infinity,
  MAX_NETWORK_REQUESTS: Infinity,
  MAX_NETWORK_REQUESTS_ML: Infinity,
  MAX_NETWORK_REQUESTS_OPENAI: Infinity,
  MAX_PAGES: Infinity,
  MAX_STORAGE_GLOBAL_AMOUNT: Infinity,
  MAX_STORAGE_GUILD_AMOUNT: Infinity,
  MAX_STORAGE_CHANNEL_AMOUNT: Infinity,
  MAX_STORAGE_USER_AMOUNT: Infinity,
  MAX_STORAGE_KEY_LENGTH: Infinity,
  MAX_STORAGE_VALUE_LENGTH: Infinity,
  MAX_TAG_EXECUTIONS: Infinity,
  MAX_TIME_REGEX: Infinity,
  MAX_VARIABLE_KEY_LENGTH: Infinity,
  MAX_VARIABLE_LENGTH: Infinity,
  MAX_VARIABLES: Infinity,
});

// export function parse(context: any,
//     value: string,
//     args: string = '',
//     variables: Partial<TagVariables> = Object.create(null),
//     tagContext: any = Object.create(null),
//     limits: Partial<TagLimits> = Object.create(null),
//     shouldTrim: boolean = true) {
//     const tag: TagResult = {
//         text:value,
//         variables: {
//             [PrivateVariables.ITERATIONS_REMAINING]: limits["MAX_ITERATIONS"],
//             ...variables
//         },
//         limits: limits,
//         context: tagContext
//     }

//     tag.variables[PrivateVariables.ARGS_STRING] = args;
//     tag.variables[PrivateVariables.ARGS] = args.split(/\s+/);

//     // A simple processor for Testing-only
//     const regex = /\{((?:(?!:)(?:.|\s))*)(?::([\s\S]+?))?\}/g;

//     // Alternative syntax using RegExp constructor
//     // const regex = new RegExp('\\{((?:(?!:)(?:.|\\s))*):([\\s\\S]+?)\\}', 'g')

//     tag.text = tag.text.replace(regex,(match,firstGroup: string,secondGroup: string) => {
//         switch (firstGroup) {
//             case "set":
//                 (tag.variables as any)[PrivateVariables.ITERATIONS_REMAINING]--;
//                 const [key, value] = secondGroup.split("|");
//                 tag.variables[key] = value;
//                 return "";
//             case "get":
//                 (tag.variables as any)[PrivateVariables.ITERATIONS_REMAINING]--;
//                 return tag.variables[secondGroup];
//             case "math":
//                 (tag.variables as any)[PrivateVariables.ITERATIONS_REMAINING]--;
//                 tag.context.mathWorker.working = true;
//                 return eval(secondGroup);
//             case "guild":
//                 (tag.variables as any)[PrivateVariables.ITERATIONS_REMAINING]--;
//                 return context.guild;
//             case "args":
//                 (tag.variables as any)[PrivateVariables.ITERATIONS_REMAINING]--;
//                 return tag.variables["__argsString"];
//             case "arg":
//                 (tag.variables as any)[PrivateVariables.ITERATIONS_REMAINING]--;
//                 return (tag.variables["__args"] as string[])[Number(secondGroup)];
//             case "note":
//                 return '';
//             case "ignore":
//                 return secondGroup;
//             default:
//                 break;
//         }
//     })

//     return tag;
// }

export async function parse(
  context: DiscordContextLike,
  value: string,
  args: string = '',
  variables: TagVariables = Object.create(null),
  tagContext: any = Object.create(null),
  limits: Partial<TagLimits> = Object.create(null),
  shouldTrim: boolean = true,
): Promise<TagResult> {
  const tagLimits: TagLimits = Object.assign({}, TagLimitDefaults);
  for (let key in limits) {
    if (key in tagLimits) {
      (tagLimits as any)[key] = (limits as any)[key];
    }
  }

  let isFirstParse = true;
  if (PrivateVariables.ITERATIONS_REMAINING in variables) {
    isFirstParse = false;
  } else {
    (variables as any)[PrivateVariables.ITERATIONS_REMAINING] = tagLimits.MAX_ITERATIONS;
    (variables as any)[PrivateVariables.ARGS_STRING] = args;
    (variables as any)[PrivateVariables.ARGS] = Parameters.stringArguments(args);
  }
  if (!(PrivateVariables.AI_EXECUTIONS in variables)) {
    (variables as any)[PrivateVariables.AI_EXECUTIONS] = 0;
  }
  if (!(PrivateVariables.API_MANIPULATIONS in variables)) {
    (variables as any)[PrivateVariables.API_MANIPULATIONS] = 0;
  }
  if (!(PrivateVariables.COMPONENT_EXECUTIONS in variables)) {
    (variables as any)[PrivateVariables.COMPONENT_EXECUTIONS] = 0;
  }
  if (!(PrivateVariables.FILE_SIZE in variables)) {
    (variables as any)[PrivateVariables.FILE_SIZE] = 0;
  }
  if (!(PrivateVariables.IS_FROM_CHILD_PARSING in variables)) {
    (variables as any)[PrivateVariables.IS_FROM_CHILD_PARSING] = 0;
  }
  if (!(PrivateVariables.NETWORK_REQUESTS in variables)) {
    (variables as any)[PrivateVariables.NETWORK_REQUESTS] = 0;
  }
  if (!(PrivateVariables.NETWORK_REQUESTS_ML in variables)) {
    (variables as any)[PrivateVariables.NETWORK_REQUESTS_ML] = 0;
  }
  if (!(PrivateVariables.NETWORK_REQUESTS_OPENAI in variables)) {
    (variables as any)[PrivateVariables.NETWORK_REQUESTS_OPENAI] = 0;
  }
  if (!(PrivateVariables.PARENT_TAG_ID in variables)) {
    (variables as any)[PrivateVariables.PARENT_TAG_ID] = '';
  }
  if (!(PrivateVariables.RESULTS in variables)) {
    (variables as any)[PrivateVariables.RESULTS] = {};
  }
  if (!(PrivateVariables.SETTINGS in variables)) {
    (variables as any)[PrivateVariables.SETTINGS] = {};
  }
  if (!(PrivateVariables.TAG_EXECUTIONS in variables)) {
    (variables as any)[PrivateVariables.TAG_EXECUTIONS] = 0;
  }

  // let replacement: string | null = null;
  if (isFirstParse) {
    // go through the text and replace
    // DON'T DO THIS BECAUSE WE DON'T HAVE THAT SERVERS (yet)1
    // And because this works with files duh
    // const expired = new Set();
    // // go through them all and see if they are expired, if so then replace
    // for (let match of value.matchAll(ATTACHMENT_URL_REGEX)) {
    //   const isValid = isValidAttachmentUrl(match[0]);
    //   if (!isValidAttachmentUrl(match[0])) {
    //     expired.add(match[0]);
    //   }
    // }

    // for (let match of args.matchAll(ATTACHMENT_URL_REGEX)) {
    //   const isValid = isValidAttachmentUrl(match[0]);
    //   if (!isValidAttachmentUrl(match[0])) {
    //     expired.add(match[0]);
    //   }
    // }

    // const oldValue = value;
    // if (expired.size && expired.size <= 50) {
    //   const { refreshed_urls: refreshedUrls } = await context.rest.request({
    //     body: {attachment_urls: Array.from(expired)},
    //     route: {
    //       method: 'post',
    //       path: '/attachments/refresh-urls',
    //     },
    //   });
    //   for (let item of refreshedUrls) {
    //     value = value.replace(item.original, item.refreshed);
    //     args = args.replace(item.original, item.refreshed);
    //   }
    //   if (oldValue !== value) {
    //     replacement = value;
    //   }
    // Only this for now
      if ((variables as any)[PrivateVariables.ARGS_STRING] !== args) {
        (variables as any)[PrivateVariables.ARGS_STRING] = args;
        (variables as any)[PrivateVariables.ARGS] = Parameters.stringArguments(args);
      }
    }
  // }

  const tag: TagResult = {
//    components: null, 
    context: tagContext, 
//    embeds: [], 
//    files: [], 
    limits: tagLimits, 
//    pages: [], replacement, 
    text: '', 
    variables: variables
  };
  tag.variables[PrivateVariables.ITERATIONS_REMAINING]--;

  // This is not discord duh (potential changes)
  const maxFileSize = Infinity // context.maxAttachmentSize;

  let depth = 0;
  let scriptBuffer = '';
  let position = 0;
  while (position < value.length) {
    if (maxFileSize < tag.text.length) {
      throw new Error(`Text exceeded ${maxFileSize} bytes`);
    }

    if (tag.variables[PrivateVariables.ITERATIONS_REMAINING] <= 0) {
      tag.text += value.slice(position);
      position = value.length;
      continue;
    }

    if (depth === 0) {
      // find next left bracket
      const nextLeftBracket = value.indexOf(TagSymbols.BRACKET_LEFT, position);
      if (nextLeftBracket === -1) {
        tag.text += value.slice(position);
        position = value.length;
        continue;
      }
      tag.text += value.slice(position, nextLeftBracket);
      position = nextLeftBracket;
    }

    increaseAIExecutions(tag, 0);
    increaseAPIManipulations(tag, 0);
    increaseComponentExecutions(tag, 0);
    increaseNetworkRequests(tag, 0);
    increaseNetworkRequestsML(tag, 0);
    increaseNetworkRequestsOpenAI(tag, 0);
    increaseTagExecutions(tag, 0);

    // add network checks
    try {
      let result = value.slice(position, ++position);
      scriptBuffer += result;
      switch (result) {
        case TagSymbols.IGNORE: {
          const nextValue = value.slice(position, position + 1);
          if (nextValue === TagSymbols.BRACKET_LEFT) {
            depth--;
          } else if (nextValue === TagSymbols.BRACKET_RIGHT) {
            depth++;
          }
        }; break;
        case TagSymbols.BRACKET_LEFT: {
          // start of the script
          depth++;
        }; break;
        case TagSymbols.BRACKET_RIGHT: {
          // end of the script
          depth--;
          if (depth <= 0) {
            let [scriptName, arg] = parseInnerScript(scriptBuffer, shouldTrim);
            if (TagFunctionsToString.EVAL_SILENT.includes(scriptName)) {
              const wasValid = await ScriptTags[TagFunctions.EVAL_SILENT](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.IGNORE.includes(scriptName)) {
              tag.text += arg;
            } else if (TagFunctionsToString.NOTE.includes(scriptName)) {
              // do nothing
            } else if (TagFunctionsToString.LOGICAL_AND.includes(scriptName)) {
              // do this separate because we dont want to parse args yet
              const wasValid = await ScriptTags[TagFunctions.LOGICAL_AND](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.LOGICAL_FOR_EACH.includes(scriptName)) {
              const wasValid = await ScriptTags[TagFunctions.LOGICAL_FOR_EACH](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.LOGICAL_GET.includes(scriptName)) {
              // do this separate because we dont want to parse args yet
              const wasValid = await ScriptTags[TagFunctions.LOGICAL_GET](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            // } else if (TagFunctionsToString.LOGICAL_GET_CHANNEL.includes(scriptName)) {
            //   // do this separate because we dont want to parse args yet
            //   const wasValid = await ScriptTags[TagFunctions.LOGICAL_GET_CHANNEL](context, arg, tag);
            //   if (!wasValid) {
            //     tag.text += scriptBuffer;
            //   }
            // } else if (TagFunctionsToString.LOGICAL_GET_GLOBAL.includes(scriptName)) {
            //   // do this separate because we dont want to parse args yet
            //   const wasValid = await ScriptTags[TagFunctions.LOGICAL_GET_GLOBAL](context, arg, tag);
            //   if (!wasValid) {
            //     tag.text += scriptBuffer;
            //   }
            // } else if (TagFunctionsToString.LOGICAL_GET_SERVER.includes(scriptName)) {
            //   // do this separate because we dont want to parse args yet
            //   const wasValid = await ScriptTags[TagFunctions.LOGICAL_GET_SERVER](context, arg, tag);
            //   if (!wasValid) {
            //     tag.text += scriptBuffer;
            //   }
            // } else if (TagFunctionsToString.LOGICAL_GET_USER.includes(scriptName)) {
            //   // do this separate because we dont want to parse args yet
            //   const wasValid = await ScriptTags[TagFunctions.LOGICAL_GET_USER](context, arg, tag);
            //   if (!wasValid) {
            //     tag.text += scriptBuffer;
            //   }
            } else if (TagFunctionsToString.LOGICAL_IF.includes(scriptName)) {
              // do this separate because we dont want to parse args yet
              const wasValid = await ScriptTags[TagFunctions.LOGICAL_IF](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.LOGICAL_IF_ERROR.includes(scriptName)) {
              // do this separate because we dont want to parse args yet
              const wasValid = await ScriptTags[TagFunctions.LOGICAL_IF_ERROR](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.LOGICAL_OR.includes(scriptName)) {
              // do this separate because we dont want to parse args yet
              const wasValid = await ScriptTags[TagFunctions.LOGICAL_OR](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.RNG_CHOOSE.includes(scriptName)) {
              // do this separate from below because we don't want our args parsed yet
              const wasValid = await ScriptTags[TagFunctions.RNG_CHOOSE](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.STRING_INDEX_OF.includes(scriptName)) {
              const wasValid = await ScriptTags[TagFunctions.STRING_INDEX_OF](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            } else if (TagFunctionsToString.STRING_SUB.includes(scriptName)) {
              const wasValid = await ScriptTags[TagFunctions.STRING_SUB](context, arg, tag);
              if (!wasValid) {
                tag.text += scriptBuffer;
              }
            // } else if (TagFunctionsToString.COMPONENTS_ON_TIMEOUT.includes(scriptName)) {
            //   const wasValid = await ScriptTags[TagFunctions.COMPONENTS_ON_TIMEOUT](context, arg, tag);
            //   if (!wasValid) {
            //     tag.text += scriptBuffer;
            //   }
            } else {
              // check the other tags now
              let codeLanguage = getCodeLanguage(scriptName); 
              if (codeLanguage) {
                // check code languages first to stop {tag} parsing
                tag.variables[PrivateVariables.IS_FROM_CHILD_PARSING] = 1;
              }

              const argParsed = await parse(context, arg, '', tag.variables, tag.context, tag.limits);
              normalizeTagResults(tag, argParsed, false);

              if (arg !== argParsed.text) {
                arg = argParsed.text;
                const firstSplitter = scriptBuffer.indexOf(TagSymbols.SPLITTER_FUNCTION);
                if (firstSplitter !== -1) {
                  scriptBuffer = scriptBuffer.slice(0, firstSplitter) + TagSymbols.SPLITTER_FUNCTION + arg + TagSymbols.BRACKET_RIGHT;
                }
              }

              let found = !!codeLanguage;
              if (codeLanguage) {
                tag.variables[PrivateVariables.IS_FROM_CHILD_PARSING] = 0;
                const wasValid = await ScriptTags._code(context, arg, tag, codeLanguage.language, codeLanguage.version);
                if (!wasValid) {
                  tag.text += scriptBuffer;
                }
              }

              if (!found) {
                for (let TAG_FUNCTION of Object.values(TagFunctions)) {
                  if ((TagFunctionsToString as any)[TAG_FUNCTION].includes(scriptName)) {
                    found = true;
                    const wasValid = await ((ScriptTags as any)[TAG_FUNCTION] as any)(context, arg, tag);
                    if (!wasValid) {
                      tag.text += scriptBuffer;
                    }
                    break;
                  }
                }
              }

              if (!found) {
                tag.text += scriptBuffer;
              }
            }

            scriptBuffer = '';
          }
        }; break;
      }
    } catch(error) {
      if (isFirstParse && error instanceof TagExitError) {
        if (error.isSilent) {
          tag.text += error.message;
        } else {
          // tag.components = null;
          // tag.embeds = (tag.embeds.length) ? [] : tag.embeds;
          // tag.files = (tag.files.length) ? [] : tag.files;
          // tag.pages = (tag.pages.length) ? [] : tag.pages;
          tag.text = error.message || 'Tag Exited';
        }
        scriptBuffer = '';
        break;
      } else {
        throw error;
      }
    }
  }

  tag.text = (tag.text + scriptBuffer);
  if (isFirstParse) {
    tag.text = tag.text.replace(/\u200B/g, '\n');
  }
  return tag;
}


export function increaseAIExecutions(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.AI_EXECUTIONS] += amount;
  }
  if (tag.limits.MAX_TAG_EXECUTIONS < tag.variables[PrivateVariables.AI_EXECUTIONS]) {
    throw new Error(`Tag attempted to use too many AI executions (Max ${tag.limits.MAX_AI_EXECUTIONS.toLocaleString()} Executions)`);
  }
}


export function increaseAPIManipulations(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.API_MANIPULATIONS] += amount;
  }
  if (tag.limits.MAX_API_MANIPULATIONS < tag.variables[PrivateVariables.API_MANIPULATIONS]) {
    throw new Error(`Tag attempted to use too many API Manipulations (Max ${tag.limits.MAX_API_MANIPULATIONS.toLocaleString()} Manipulations)`);
  }
}


export function increaseComponentExecutions(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.COMPONENT_EXECUTIONS] += amount;
  }
  if (tag.limits.MAX_COMPONENT_EXECUTIONS < tag.variables[PrivateVariables.COMPONENT_EXECUTIONS]) {
    throw new Error(`Tag attempted to use too many Component Executions (Max ${tag.limits.MAX_COMPONENT_EXECUTIONS.toLocaleString()} Executions)`);
  }
}


export function increaseNetworkRequests(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.NETWORK_REQUESTS] += amount;
  }
  if (tag.limits.MAX_NETWORK_REQUESTS < tag.variables[PrivateVariables.NETWORK_REQUESTS]) {
    throw new Error(`Tag attempted to use too many network requests (Max ${tag.limits.MAX_NETWORK_REQUESTS.toLocaleString()} Requests)`);
  }
}


export function increaseNetworkRequestsML(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.NETWORK_REQUESTS_ML] += amount;
  }
  if (tag.limits.MAX_NETWORK_REQUESTS_ML < tag.variables[PrivateVariables.NETWORK_REQUESTS_ML]) {
    throw new Error(`Tag attempted to use too many machine learning network requests (Max ${tag.limits.MAX_NETWORK_REQUESTS_ML.toLocaleString()} Requests)`);
  }
}


export function increaseNetworkRequestsOpenAI(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.NETWORK_REQUESTS_OPENAI] += amount;
  }
  if (tag.limits.MAX_NETWORK_REQUESTS_OPENAI < tag.variables[PrivateVariables.NETWORK_REQUESTS_OPENAI]) {
    throw new Error(`Tag attempted to use too many OpenAI network requests (Max ${tag.limits.MAX_NETWORK_REQUESTS_OPENAI.toLocaleString()} Requests)`);
  }
}


export function increaseTagExecutions(tag: TagResult, amount: number = 1) {
  if (amount) {
    tag.variables[PrivateVariables.TAG_EXECUTIONS] += amount;
  }
  if (tag.limits.MAX_TAG_EXECUTIONS < tag.variables[PrivateVariables.TAG_EXECUTIONS]) {
    throw new Error(`Tag attempted to use too many tag executions (Max ${tag.limits.MAX_TAG_EXECUTIONS.toLocaleString()} Executions)`);
  }
}

export function checkTagComponentsLimit(components: any) {
  // does nothing
  return;
}

// export function checkTagComponentsLimit(components: TagResultComponents | null) {
//   if (components && components.components.length) {
//     let actionRows: number = 0;
//     let buttons: number = 0;
//     for (let component of components.components) {
//       switch (component.type) {
//         case MessageComponentTypes.ACTION_ROW: {
//           actionRows++;
//           if (buttons) {
//             throw new Error('Only support ActionRows or Buttons, not both for now');
//           }
//           /*
//           for (let x of component.components) {
//             if (25 <= buttons) {
//               throw new Error('TagScript only supports up to 25 buttons');
//             }
//             switch (x.type) {
//               case MessageComponentTypes.BUTTON: buttons++; break;
//             }
//           }
//           */
//         }; break;
//         case MessageComponentTypes.BUTTON: {
//           buttons++;
//           if (actionRows) {
//             throw new Error('Only support ActionRows or Buttons, not both for now');
//           }
//         }; break;
//       }
//       if (5 < actionRows) {
//         throw new Error('TagScript only supports up to 5 action rows');
//       }
//       if (25 < buttons) {
//         throw new Error('TagScript only supports up to 25 buttons');
//       }
//     }
//   }
// }


export function resetTagLimits(tag: TagResult) {
  const variables = tag.variables;
  (variables as any)[PrivateVariables.ITERATIONS_REMAINING] = tag.limits.MAX_ITERATIONS;
  (variables as any)[PrivateVariables.AI_EXECUTIONS] = 0;
  (variables as any)[PrivateVariables.API_MANIPULATIONS] = 0;
  (variables as any)[PrivateVariables.COMPONENT_EXECUTIONS] = 0;
  (variables as any)[PrivateVariables.NETWORK_REQUESTS] = 0;
  (variables as any)[PrivateVariables.NETWORK_REQUESTS_ML] = 0;
  (variables as any)[PrivateVariables.NETWORK_REQUESTS_OPENAI] = 0;
  (variables as any)[PrivateVariables.FILE_SIZE] = 0;
  (variables as any)[PrivateVariables.TAG_EXECUTIONS] = 0;
  Object.assign(tag.variables, {
    [PrivateVariables.RESULTS]: Object.assign({}, tag.variables[PrivateVariables.RESULTS], {
//      [TagFunctions.ATTACHMENT]: undefined,
    }),
  });
}


export function split(value: string, amount: number = 0): Array<string> {
  if (!value.includes(TagSymbols.SPLITTER_ARGUMENT)) {
    return [value];
  }

  let depth = 0;
  let position = 0;
  let text = '';

  const args: Array<string> = [];
  while (position < value.length) {
    if (amount && amount <= args.length) {
      if (args.length) {
        args[args.length - 1] += value.slice(position - 1);
      }
      break;
    }

    if (depth === 0 && !text) {
      // find next left bracket
      const nextLeftBracket = value.indexOf(TagSymbols.BRACKET_LEFT, position);
      if (nextLeftBracket === -1) {
        // no script tags found inside, so we have no splitters to ignore
        for (let x of value.slice(position).split(REGEX_ARGUMENT_SPLITTER)) {
          x = x.replace(REGEX_ARGUMENT_SPLITTER_ESCAPE_REPLACEMENT, TagSymbols.SPLITTER_ARGUMENT);
          args.push(x);
        }
        position = value.length;
        continue;
      }
    }

    let result = value.slice(position, ++position);
    text += result;
    switch (result) {
      case TagSymbols.SPLITTER_ARGUMENT: {
        if (depth <= 0) {
          // use the arg, we arent in the function anymore
          args.push(text.slice(0, -1));
          text = '';
        }
      }; break;
      case TagSymbols.IGNORE: {
        const nextValue = value.slice(position, position + 1);
        if (nextValue === TagSymbols.BRACKET_LEFT) {
          depth--;
        } else if (nextValue === TagSymbols.BRACKET_RIGHT) {
          depth++;
        } else if (nextValue === TagSymbols.SPLITTER_ARGUMENT) {
          position++;
        }
      }; break;
      case TagSymbols.BRACKET_LEFT: {
        // start of the script
        depth++;
      }; break;
      case TagSymbols.BRACKET_RIGHT: {
        // end of the script
        depth--;
      }; break;
    }
  }

  if (text) {
    args.push(text);
  }
  return args;
}


function parseInnerScript(value: string, shouldTrim: boolean = true): [string, string] {
  let scriptName: string;
  let arg: string;

  // remove the brackets from both sides of the value
  value = value.slice(1, value.length - 1);
  if (shouldTrim) {
    value = value.trim();
  }

  const firstSplitter = value.indexOf(TagSymbols.SPLITTER_FUNCTION);
  if (firstSplitter === -1) {
    scriptName = value;
    arg = '';
  } else {
    scriptName = value.slice(0, firstSplitter);
    arg = value.slice(firstSplitter + 1);
  }

  return [scriptName.toLowerCase(), arg];
}


export function normalizeTagResults(main: TagResult, other: TagResult, content: boolean = true): void {
  if (content) {
    main.text += other.text;
  }

  // not supported for now
  // if (other.components) {
  //   if (main.components) {
  //     main.components.components = [...main.components.components, ...other.components.components];
  //     checkTagComponentsLimit(main.components);
  //     if (other.components.onTimeout) {
  //       main.components.onTimeout = other.components.onTimeout;
  //     }
  //   } else {
  //     main.components = other.components;
  //   }
  // }

  // not supported for now
  // if (main.limits.MAX_EMBEDS < main.embeds.length + other.embeds.length) {
  //   throw new Error(`Embeds surpassed max embeds length of ${main.limits.MAX_EMBEDS}`);
  // }
  // for (let embed of other.embeds) {
  //   main.embeds.push(embed);
  // }

  // if (main.limits.MAX_ATTACHMENTS < main.files.length + other.files.length) {
  //   throw new Error(`Attachments surpassed max attachments length of ${main.limits.MAX_ATTACHMENTS}`);
  // }
  // for (let file of other.files) {
  //   main.files.push(file);
  // }

  // if (main.limits.MAX_PAGES < main.pages.length + other.pages.length) {
  //   throw new Error(`Pages surpassed max page length of ${main.limits.MAX_PAGES}`);
  // }
  // for (let page of other.pages) {
  //   main.pages.push(page);
  // }
}

