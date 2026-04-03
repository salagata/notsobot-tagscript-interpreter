export function traverseJSON(data: any, path: string): any {
  if (!path || typeof(path) !== 'string') {
    return data;
  }

  const segments = traverseJSONParsePath(path);

  let current = data;
  try {
    for (const segment of segments) {
      current = current[segment];
    }
  } catch(error) {
    return undefined;
  }

  return current;
}


export function traverseJSONParsePath(path: string): Array<string> {
  const segments = [];
  let current = '';
  let i = 0;

  while (i < path.length) {
    const character = path[i];
    if (character === '.') {
      // first key is done being read from `keyone.keytwo`.
      if (current) {
        segments.push(current);
        current = '';
      }
      i++;
    } else if (character === '[') {
      // read characters in brackets, `[0]`, `[asd]`, `["asd.asd"]`, `['123']`
      if (current) {
        segments.push(current);
        current = '';
      }
      i++;

      let bracketContent = '';
      let quoteCharacter = null;
      if (path[i] === '"' || path[i] === '\'') {
        quoteCharacter = path[i];
        i++;

        // read characters in the brackets that are surrounded by quotes
        // ["asd.asd"], ['123']
        while (i < path.length && path[i] !== quoteCharacter) {
          if (path[i] === '\\' && i + 1 < path.length) {
            i++;
            bracketContent += path[i];
          } else {
            bracketContent += path[i];
          }
          i++;
        }
        i++;
      } else {
        // read the characters in the brackets, e.g. `[0]` or `[asd]`
        while (i < path.length && path[i] !== ']') {
          bracketContent += path[i];
          i++;
        }
      }

      segments.push(bracketContent);
      i++;
    } else {
      // read it as a normal key, e.g. `somekeyvalue`
      current += character;
      i++;
    }
  }
  if (current) {
    segments.push(current);
  }
  return segments;
}


export function bigIntMax(...args: Array<bigint>): bigint {
  let value = args[0];
  for (let x of args) {
    if (value < x) {
      value = x;
    }
  }
  return value;
}


export function bigIntMin(...args: Array<bigint>): bigint {
  let value = args[0];
  for (let x of args) {
    if (x < value) {
      value = x;
    }
  }
  return value;
}

export function randomFromArray<T>(
  array: Array<T>,
): T {
  return array[Math.floor(Math.random() * array.length)];
}


export function bigIntGenerateBetween(value1: bigint, value2: bigint): bigint {
  const lowBigInt = bigIntMin(value1, value2);
  const highBigInt = bigIntMax(value1, value2);

  const difference = highBigInt - lowBigInt + 1n;
  const differenceLength = difference.toString().length;
  let multiplier = '';
  while (multiplier.length < differenceLength) {
    multiplier += Math.random().toString().split('.')[1];
  }
  multiplier = multiplier.slice(0, differenceLength);
  const divisor = '1' + '0'.repeat(differenceLength);

  const randomDifference = (difference * BigInt(multiplier)) / BigInt(divisor);
  return lowBigInt + randomDifference;
}


const TEXT_TO_BOOLEAN_TRUE = ['true', '+', 'y', 'yes'];
const TEXT_TO_BOOLEAN_FALSE = ['false', '-', 'n', 'no'];

export function textToBoolean(value: string, defaultValue: boolean = false): boolean {
  value = value.toLowerCase();
  if (TEXT_TO_BOOLEAN_TRUE.includes(value)) {
    return true;
  } else if (TEXT_TO_BOOLEAN_FALSE.includes(value)) {
    return false;
  }
  return defaultValue;
}


export const MAX_BIGINT_DECIMAL_PLACES = 10;

export function convertToBigIntFloats(...args: Array<string>): [Array<bigint>, number] {
  const getDecimalPlaces = (str: string): number => {
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : Math.min(str.length - decimalIndex - 1, MAX_BIGINT_DECIMAL_PLACES);
  };

  const stringToBigInt = (str: string, decimalPlaces: number): bigint => {
    const [integerPart = '0', fractionalPart = ''] = str.split('.');
    const paddedFractional = (fractionalPart + '0'.repeat(decimalPlaces)).slice(0, decimalPlaces);
    const combined = integerPart + paddedFractional;
    return BigInt(combined);
  };

  const maxDecimalPlaces = Math.max(...args.map(getDecimalPlaces));
  const hasDecimals = 0 < maxDecimalPlaces;
  const values = args.map((value) => {
    if (hasDecimals) {
      return stringToBigInt(value, maxDecimalPlaces);
    } else {
      return BigInt(value);
    }
  }) as Array<bigint>;
  return [values, maxDecimalPlaces];
}

export function getCodeLanguage(value?: string): {language: string, version: string | null} | null {
  return null;
}
// Just a polyfill
export enum MLDiffusionModels {
  FLUX_KLEIN = 'FLUX_KLEIN',
  FLUX_SCHNELL = 'FLUX_SCHNELL',
  QWEN_IMAGE_EDIT_2509_LIGHTNING = 'QWEN_IMAGE_EDIT_2509_LIGHTNING',
  SDXL_TURBO = 'SDXL_TURBO',
}
export enum TagGenerationModels {
  CLAUDE_4_5_SONNET = 'CLAUDE_4_5_SONNET',
  CLAUDE_4_5_HAIKU = 'CLAUDE_4_5_HAIKU',
  DEEPSEEK_CHAT = 'DEEPSEEK_CHAT',
  GOOGLE_GEMINI_2_5_PRO = 'GOOGLE_GEMINI_2_5_PRO',
  GOOGLE_GEMINI_2_5_FLASH = 'GOOGLE_GEMINI_2_5_FLASH',
  GOOGLE_GEMINI_2_5_FLASH_LITE = 'GOOGLE_GEMINI_2_5_FLASH_LITE',
  GOOGLE_GEMMA_3_0 = 'GOOGLE_GEMMA_3_0',
  META_LLAMA = 'META_LLAMA',
  OPENAI_CHATGPT_5_2 = 'OPENAI_CHATGPT_5_2',
  OPENAI_CHATGPT_5_MINI = 'OPENAI_CHATGPT_5_MINI',
  QWEN_3_CODER = 'QWEN_3_CODER',
  XAI_GROK_4_1_FAST = 'XAI_GROK_4_1_FAST',
  XAI_GROK_CODE_1_FAST = 'XAI_GROK_CODE_1_FAST',
}

