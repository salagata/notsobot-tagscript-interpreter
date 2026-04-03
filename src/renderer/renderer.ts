import { input, select } from '@inquirer/prompts';
import * as ansi from 'ansi-colors'

import { processMarkup } from "./markup"
import type { TagResult } from '../tagscript/tagscript.model'

export function renderTagResult(tag: TagResult, markup = true) {
    
    if(markup) {
        console.log(processMarkup(tag.text))        
    } else {
        // Simple Text
        console.log(tag.text);
    }

    // TODO: Components, Embeds, Pages, Attachments
    // Components (Button.style is done with 'ansi-colors')
    // select({
    //  message: 'Select an option',
    //  choices: [
    //    { name: 'Button.label', value: 'Button.run'},
    //    { name: ansi.blue("Button.style = 1"), value: 'py' },
    //    { name: ansi.green("Button.style = 2"), value: 'java' },
    //    { name: ansi.red("Button.style = 3"), value: 'py' },
    //    { name: ansi.white.bgBlack("Button.style = 4"), value: 'py' },
    //    { name: ansi.blue("Button.disabled = true"), value: 'cpp', disabled: true }, // Disabled option
    //  ],
    // }).then((answer) => {
    //   console.log(`You selected: ${answer}`);
    // });
}