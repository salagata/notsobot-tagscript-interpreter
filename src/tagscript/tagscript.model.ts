export interface TagVariables {
    [key: string]:  number | string | Array<string> | Record<string, any>,
}

export interface TagLimits {
    iterationsRemaining: number,
}

export interface TagResult {
    text: string,
    variables: TagVariables,
    limits: Partial<TagLimits>,
    context: any,
}