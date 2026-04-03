export const TagSymbols = Object.freeze({
  BRACKET_LEFT: '{',
  BRACKET_RIGHT: '}',
  IGNORE: '\\',
  SPLITTER_ARGUMENT: '|',
  SPLITTER_FUNCTION: ':',
});

export const ATTACHMENT_EXTENSIONS_IMAGE = [
  'bmp',
  'heic',
  'gif',
  'ico',
  'jpg',
  'jpeg',
  'png',
  'raw',
  'tiff',
  'webp',
];

export const ATTACHMENT_EXTENSIONS_MEDIA = [
  'flac',
  'mov',
  'mp3',
  'mp4',
  'txt',
  'wav',
  'webm',
];

export const ATTACHMENT_EXTENSIONS = [...ATTACHMENT_EXTENSIONS_IMAGE, ...ATTACHMENT_EXTENSIONS_MEDIA];

export enum PrivateVariables {
  AI_EXECUTIONS = '__aiExecutions',
  API_MANIPULATIONS = '__apiManipulations',
  ARGS = '__args',
  ARGS_STRING = '__argsString',
  COMPONENT_EXECUTIONS = '__componentExecutions',
  FILE_SIZE = '__fileSize',
  FILES = '__files',
  IS_FROM_CHILD_PARSING = '__isFromChildParsing',
  ITERATIONS_REMAINING = '__iterationsRemaining',
  NETWORK_REQUESTS = '__networkRequests',
  NETWORK_REQUESTS_ML = '__networkRequestsML',
  NETWORK_REQUESTS_OPENAI = '__networkRequestsOpenAI',
  PARENT_TAG_ID = '__parentTagId',
  RESULTS = '__results',
  SETTINGS = '__settings',
  TAG_EXECUTIONS = '__tagExecutions',
}

export enum TagIfComparisons {
  EQUAL = '=',
  EQUAL_NOT = "!=",
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  TILDE = '~',
}

export enum TagSettings {
  AI_MODEL = 'AI_MODEL',
  AI_PERSONALITY = 'AI_PERSONALITY',
  MEDIA_AV_FALLBACK = 'MEDIA_AV_FALLBACK',
  MEDIA_IV_FALLBACK = 'MEDIA_IV_FALLBACK',
  ML_IMAGINE_DO_NOT_ERROR = 'ML_IMAGINE_DO_NOT_ERROR',
  ML_IMAGINE_MODEL = 'ML_IMAGINE_MODEL',
}

export const PRIVATE_VARIABLE_PREFIX = '__';

export const ATTACHMENT_URL_REGEX = /(https?:\/\/(?:media\.discordapp\.net|cdn.discordapp.com)\/attachments\/[0-9]*\/[0-9]*\/[A-Za-z0-9_.-]*(?:\?[a-zA-Z0-9&=]*)?)/g;
export const MATH_NON_NUMERIC_REGEX = /[^+\-*\/()0-9.n><&]/g;
export const SCRIPT_REGEX = /\{((?:(?!:)(?:.|\s))*):([\s\S]+)\}/;
export const URL_FILE_REPLACEMENT_REGEX = /FILE_([0-9]+)(_COPY)?/g;

export const REGEX_ARGUMENT_SPLITTER = new RegExp(`(?<!\\\\)[${TagSymbols.SPLITTER_ARGUMENT}]`, 'g');
export const REGEX_ARGUMENT_SPLITTER_ESCAPE_REPLACEMENT = new RegExp(`\\\\\\${TagSymbols.SPLITTER_ARGUMENT}`, 'g');