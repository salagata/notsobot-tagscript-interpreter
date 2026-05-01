#!/usr/bin/env node

import { Command } from 'commander';

import path from 'path';

import { createNewProject } from '../nsb/new';
import { runScript } from '../nsb/run';
import { TagLimitDefaults } from '../tagscript/compiler';

const program = new Command();

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
  .action(createNewProject);

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
  .option('--debug',"For debugging, shows the Object Tag Result instead of rendering it")
  .option('--no-markup',"Disable Markup Options")
  .option('--ctx, --context',"Where is the tag being executed, \"dm\" for bot's direct messages, \"guild\" for a guild, \"private\" for private channels")
  .option('--max, --max-attachment-size <size>',"Specifies the max attachment size, Infinity if not specified", "Infinity")
  .option('--gc, --guild-context <filePathOrJSON>',"Provide a guild context to enable features that require a guild context, not avaiable if context is not \"guild\".")
//  .option('-v, --variables <filePathOrJSON>')
  .option('--tag-limits <filePathOrJSON>',"Optional pre-defined tag limits",JSON.stringify(TagLimitDefaults))
  .option('--no-tag-limits',"Removes the tag limits")
  .option('--math',"Enables the Math Worker, which uses eval() as a temporal solution for eval (DO NOT USE IN PRODUCTION, THE eval() WILL BE DELETED AS SOON AS POSIBLE)")
  .action(runScript)

program.parseAsync(process.argv);