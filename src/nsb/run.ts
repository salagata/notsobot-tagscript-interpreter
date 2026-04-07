import fs from 'fs/promises';
import path from 'path';

import { parse, TagLimitDefaults } from '../tagscript/compiler';
import { renderTagResult } from "../renderer/renderer";

import type { ProjectStructure } from './project.model';
import { DiscordContextLike } from '../tagscript/discord/context';

interface TagRunOptions {
    argument: string[],
    file: string[],
    debug: boolean,
    markup: boolean,
    maxAttachmentSize: number,
    guildContext: any,
}

async function getProjectFileObject(): Promise<ProjectStructure> {
    try {
        const project: ProjectStructure = JSON.parse(await fs.readFile("project.nsb.json", "utf-8"));
        return project;
    } catch (err) {
        throw err;
    }
}

async function resolveFilePath(file: string): Promise<string> {
    const pathsToTry = [file, file + ".nsb"];
    let lastError: Error | undefined;

    for (const pathToTry of pathsToTry) {
        try {
            const fileStat = await fs.stat(pathToTry);
            if (fileStat.isFile()) {
                return path.extname(pathToTry) === ".nsb" ? pathToTry : pathToTry + ".nsb";
            } else if (fileStat.isDirectory()) {
                return path.join(pathToTry, "index.nsb");
            } else {
                throw new Error("Unsupported resource");
            }
        } catch (err) {
            lastError = err as Error;
        }
    }

    throw lastError;
}

async function resolveFileJSON(filePathOrJSON: string) {
    let obj: any;
    try {
        obj = JSON.parse(filePathOrJSON);
    } catch (err) {
        // is not json and is a filepath
        try {
            obj = JSON.parse(await fs.readFile(filePathOrJSON,"utf-8"));
        } catch (error) {
            throw error
        }
    }
    return obj
}

export async function runScript(fileName: string, options: TagRunOptions) {
    let file = fileName;
    let script: string = "";
    if (file == ".") {
        try {
            const project = await getProjectFileObject();
            script = await fs.readFile(project.entrance, "utf-8");
        } catch (err) {
            throw err;
        }
    } else {
        try {
            file = await resolveFilePath(file);
            script = await fs.readFile(file, "utf-8");
        } catch (err) {
            throw err;
        }
    }

    const tagContext: DiscordContextLike = {
        maxAttachmentSize: Number(options.maxAttachmentSize),
    };

    if(options?.guildContext) {
        tagContext.guild = await resolveFileJSON(options.guildContext)
    }

    const tagArguments = (options?.argument ?? []).map(a => '"' + a + '"').join(" ");
    const tagFiles = options?.file ?? [];
    // Testing purposes Only
    const tag = await parse(tagContext, script, tagArguments);
    
    if(options.debug) {
        console.log(tag);
    } else {
        renderTagResult(tag,options.markup);
    }

}