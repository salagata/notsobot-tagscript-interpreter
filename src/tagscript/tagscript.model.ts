import { PrivateVariables, TagSettings } from './tagscript.constants'

export interface TagVariables {
  [PrivateVariables.AI_EXECUTIONS]: number,
  [PrivateVariables.API_MANIPULATIONS]: number,
  [PrivateVariables.ARGS]: Array<string>,
  [PrivateVariables.ARGS_STRING]: string,
  [PrivateVariables.COMPONENT_EXECUTIONS]: number,
  [PrivateVariables.FILE_SIZE]: number,
  [PrivateVariables.IS_FROM_CHILD_PARSING]: number,
  [PrivateVariables.ITERATIONS_REMAINING]: number,
  [PrivateVariables.NETWORK_REQUESTS]: number,
  [PrivateVariables.NETWORK_REQUESTS_ML]: number,
  [PrivateVariables.NETWORK_REQUESTS_OPENAI]: number,
  [PrivateVariables.PARENT_TAG_ID]: string,
  [PrivateVariables.RESULTS]: any,
  [PrivateVariables.SETTINGS]: {
    [TagSettings.AI_MODEL]?: string,
    [TagSettings.AI_PERSONALITY]?: string,
    [TagSettings.MEDIA_AV_FALLBACK]?: any,
    [TagSettings.MEDIA_IV_FALLBACK]?: any, 
    [TagSettings.ML_IMAGINE_DO_NOT_ERROR]?: boolean,
    [TagSettings.ML_IMAGINE_MODEL]?: any,
  },
  [PrivateVariables.TAG_EXECUTIONS]: number,
  [key: string]: number | string | Array<string> | Record<string, any>,
}

export interface TagLimits {
  MAX_AI_EXECUTIONS: number,
  MAX_API_MANIPULATIONS: number,
  MAX_ATTACHMENTS: number,
  MAX_COMPONENT_EXECUTIONS: number,
  MAX_EMBEDS: number,
  MAX_ITERATIONS: number,
  MAX_NETWORK_REQUESTS: number,
  MAX_NETWORK_REQUESTS_ML: number,
  MAX_NETWORK_REQUESTS_OPENAI: number,
  MAX_PAGES: number,
  MAX_STORAGE_GLOBAL_AMOUNT: number,
  MAX_STORAGE_GUILD_AMOUNT: number,
  MAX_STORAGE_CHANNEL_AMOUNT: number,
  MAX_STORAGE_USER_AMOUNT: number,
  MAX_STORAGE_KEY_LENGTH: number,
  MAX_STORAGE_VALUE_LENGTH: number,
  MAX_TAG_EXECUTIONS: number,
  MAX_TIME_REGEX: number,
  MAX_VARIABLE_KEY_LENGTH: number,
  MAX_VARIABLE_LENGTH: number,
  MAX_VARIABLES: number,
}

export interface TagResult {
    text: string,
    variables: Partial<TagVariables>,
    limits: Partial<TagLimits>,
    context: any,
}