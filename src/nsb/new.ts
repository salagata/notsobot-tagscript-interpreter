import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';

import type { ProjectStructure } from './project.model';

export async function createNewProject(projectTitle: string, options: { quick: boolean }): Promise<void> {
    const projectConfig: ProjectStructure = {
        "title": projectTitle,
        "version": "1.0.0",
        "description": "",
        "entrance": "mansion.nsb",
        "host": {},
        "author": "Unnamed",
        "license": "MIT",
        "commands": {
            "test": "echo \"Error: no test specified\" && exit 1"
        }
    };

    if (!options.quick) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        function askQuestion(query: string): Promise<string> {
            return new Promise((res, rej) => {
                rl.question(query, res);
            })
        }

        rl.on("SIGINT", () => {
            console.log("Process canceled with SIGINT");
        })

        projectConfig.version = await askQuestion("Version: (1.0.0) ") || "1.0.0";
        projectConfig.license = await askQuestion("License: (MIT) ") || "MIT";
        projectConfig.description = await askQuestion("Description: ");
        projectConfig.entrance = await askQuestion("Entry Point: (mansion.nsb) ") || "mansion.nsb";
        projectConfig.author = await askQuestion("Author: ") || "Unnamed";

        const formatted = JSON.stringify(projectConfig, undefined, 2);
        const projectFile = "project.nsb.json";
        console.log("About to write in " + projectFile + ":");
        console.log(formatted)

        const confirmation = (await askQuestion("Is this ok? (yes)") || "Y").toUpperCase();

        if (confirmation == "Y" || confirmation == "YES" || confirmation == "") {
            await fs.writeFile(projectFile, formatted);
        } else {
            console.log("Aborted.");
        }

        rl.close();
    } else {
        const formatted = JSON.stringify(projectConfig, undefined, 2);
        const projectFile = path.join(__dirname, "project.nsb.json");
        console.log("Writing in " + projectFile + ":");
        console.log(formatted);
        await fs.writeFile(projectFile, formatted);
    }
}