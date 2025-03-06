#!/usr/bin/env node
const yargs = require('yargs');
const fs = require('fs');

const readline = require('readline');

const createInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
};

const askQuestion = (rl, question) => {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
};

const main = async () => {
  if (yargs.argv.init) {
    fs.mkdirSync('src/routes', { recursive: true }, err => {
      if (err) throw err;
    });
    fs.cpSync('init', 'src/routes', { recursive: true });
  } else if (yargs.argv.info) {
    console.log(
      `init - to create folders and index file\nadd - to create a new route`
    );
  } else {
    const rl = createInterface();
    const routeName = await askQuestion(rl, 'Route name: ');
    rl.close();
    console.log(routeName);
  }
};

main().catch(console.error);

// let data = "import { Route } from txt";

// fs.writeFile("src/routes/index.ts", data, (err) => {
//   // In case of a error throw err.
//   if (err) throw err;
// });
