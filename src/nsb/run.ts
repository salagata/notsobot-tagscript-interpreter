import fs from 'fs/promises';
import path from 'path';

import { parse, TagLimitDefaults } from '../tagscript/compiler';

import type { ProjectStructure } from './project.model';

interface TagRunOptions {
    argument: string[],
    file: string[],
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

    const tagArguments = (options?.argument ?? []).map(a => '"' + a + '"').join(" ");
    const tagFiles = options?.file ?? [];
    // Testing purposes Only
    console.log(parse({
        guild: "Reisen's gang",
    }, script, tagArguments, {}, {
        mathWorker: {
            working: false
        }
    }, TagLimitDefaults, true))
}