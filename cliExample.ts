import { input, select } from '@inquirer/prompts';

select({
 message: 'Select your favorite programming language:',
 choices: [
   { name: 'JavaScript', value: 'js', description: 'Popular for web development' },
   { name: 'Python', value: 'py', description: 'Great for data science and AI' },
   { name: 'Java', value: 'java', description: 'Widely used in enterprise applications' },
   { name: 'C++', value: 'cpp', disabled: 'Not available' }, // Disabled option
 ],
}).then((answer) => {
  console.log(`You selected: ${answer}`);
});