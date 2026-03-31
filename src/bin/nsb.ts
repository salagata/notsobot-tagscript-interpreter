#!/usr/bin/env node

import { Command } from 'commander';

import fs from 'fs/promises'
import path from 'path';
import readline from 'readline';

import { parse } from '../compiler';

import { Stats } from 'fs';


const program = new Command();

type AuthorName = string;

type Version = string;

type Link = string;

type ProjectCommands = Record<string,string>;

interface ProjectHostLinks {
  link?: Link,
  cdn?: Link,
  home?: Link,
  issues?: Link,
  feedback?: Link,
  help?: Link,
  docs?: Link,
  reference?: Link,
  dashboard?: Link,
  support?: Link,
  [index: string]: string | undefined,
}

interface ProjectHost extends ProjectHostLinks {
  service: string,
  
}

interface ProjectStructure {
    title: string,
    version: Version,
    description?: string,
    entrance: string,
    host: ProjectHost | {},
    author: AuthorName,
    license: string,
    commands: ProjectCommands
}

program
  .name('nsb')
  .description('NotSoBot TagScript Project Handler and TagScript Parser in a CLI ')
  .version('0.0.1');

// nsb init [name] 
// -q, --quick : Answer yes to everything

program.command('init')
  .description('Creates a new project in the file')
  .argument("[name]","Title of the project, name of the directory if ommited",path.basename(__dirname))
  .option('-q, --quick', 'Does the config quick, answering yes to everything')
  .action( async (projectTitle: string,options: { quick: boolean }) => {
    const projectConfig: ProjectStructure = { 
      "title": projectTitle, 
      "version": "1.0.0",
      "description":"",
      "entrance":"mansion.nsb",
      "host": {},
      "author": "Unnamed",
      "license": "MIT",
      "commands":{
        "test": "echo \"Error: no test specified\" && exit 1"
      }
    };

    if(!options.quick) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      function askQuestion(query: string): Promise<string> {
        return new Promise((res,rej) => {
          rl.question(query,res);
        })
      }

      rl.on("SIGINT",() => {
        console.log("Process canceled with SIGINT");
      })

      projectConfig.version = await askQuestion(`Version: (1.0.0)`) || "1.0.0";
      projectConfig.license = await askQuestion("License: (MIT)") || "MIT";
      projectConfig.description = await askQuestion("Description:");
      projectConfig.entrance = await askQuestion("Entry Point: (mansion.nsb)") || "mansion.nsb";
      projectConfig.author = await askQuestion("Author: ") || "Unnamed";
      
      const formatted = JSON.stringify(projectConfig, undefined, 2);
      const projectFile = "project.nsb.json";
      console.log("About to write in " + projectFile + ":");
      console.log(formatted)
      
      const confirmation = (await askQuestion("Is this ok? (yes)") || "Y").toUpperCase();

      if(confirmation == "Y" || confirmation == "YES" || confirmation == "") {

        await fs.writeFile(projectFile, formatted);
      } else {
        console.log("Aborted.");
      }

      rl.close();
    } else {
      const formatted = JSON.stringify(projectConfig, undefined, 2);
      const projectFile = path.join(__dirname,"project.nsb.json");
      console.log("Writing in " + projectFile + ":");
      console.log(formatted);
      await fs.writeFile(projectFile, formatted);
    }
  });

// nsb run <file> 
// -a, --argument <argument> : Set an argument, simulating an argument being passed to the call (collector)
// -f, --file <filePath> : Add an file as attachment, simulating passing attachments to the call (collector)
// -o, --output-files <path> : If attachment are outputted, those attachments will be in this file, simulating the bot attaching files.
// -ctx, --context <contextType> : Where is the tag being executed, "dm" for bot's direct messages, "guild" for a guild, "private" for private channels
// -mc, --message-context <filePath> : Provide a message context to enable features that require a message context.
// -uc, --user-context <filePath> : Provide an user context to enable features that require an user context.
// -gmc, --guild-member-context <filePath> : Provide a member context to enable features that require a member context, not avaiable if context is not "guild".
// -gc, --guild-context <filePath> : Provide a guild context to enable features that require a guild context, not avaiable if context is not "guild".
// -cc, --channel-context <filePath> : Provide a channel context to enable features that require a channel context, if "dm" enabled, provide DM context, if "private" enabled, provide private then
// -mhc, --message-history-context <filePath> : Provide a message history context to enable features that require a message history context
// -tc, --tag-context <filePath> : Provide a tag context to enable features thar require a tag context
// -st, --storage <filePath> : Provide storage context to enable features that require a storage context
// -vt, --variables <filePath> : Optional pre-defined variables, util for test units
// -tl, --tag-limits <filePath> : Optional pre-defined tag limits
// -no-tl, --no-tag-limits : Remove the Tag Limits
// ! -dc, --discord-context <filePath> : Provide a discord context, if specified, message-context, user-context, guild-member-context, guild-context, channel-context, tag-context 

program.description('Run a file or the entry-point specified in the project config, with NotSoBot TagScript')
  .argument("[file]","Name of the file, the entry-point specified in the project config if no specified",".")
  .option('-a, --argument <arguments...>', 'Set an argument, simulating an argument being passed to the call (collector)')
  .option('-f, --file <filePaths...>', 'Set an argument, simulating an argument being passed to the call (collector)')
  .action(async (fileName: string,options: {
    argument: string[],
    file: string[]
  }) => {
    let file = fileName;
    let script: string; 
    if(file == ".") {
      try {
        const project: ProjectStructure = JSON.parse(await fs.readFile("project.nsb.json","utf-8"));
        file = project.entrance;
      } catch (err) {
        throw err;  
      }
    }

    let fileStat: Stats;
    try {
      fileStat = await fs.stat(file);
      
      if(fileStat.isFile()) {
        if(path.extname(file) == ".nsb") {
          script = await fs.readFile(file,"utf-8");
        } else {
          script = await fs.readFile(file + ".nsb","utf-8");
        }
      } else if(fileStat.isDirectory()) {
        file = path.join(file,"index.nsb");
        script = await fs.readFile(file, "utf-8");
      } else {
        throw new Error("Unsupported resource");
      }
    } catch (err) {
      try {
        file += ".nsb"
        fileStat = await fs.stat(file);
        if(fileStat.isFile()) {
          script = await fs.readFile(file,"utf-8");
        } else if(fileStat.isDirectory()) {
          file = path.join(file,"index.nsb");
          script = await fs.readFile(file, "utf-8");
        } else {
          throw new Error("Unsupported resource");
        }
      } catch (err2) {
        throw err2;
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
    },{
        iterationsRemaining: 10
    },true))
  })

program.parseAsync(process.argv);