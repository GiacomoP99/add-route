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

const INDEX_ROUTE = (
  name,
  joinedName,
  path,
  isIndex,
  policy
) => `const ${name} = React.lazy(() => import('@pages/${joinedName}'));

export const route_${name} =  {
    path: '${path}',
    isIndex: ${isIndex},
    component: <${name} />,
    children: null,
    policy: ${policy || null}
}
`;

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
    const name = await askQuestion(rl, 'Route name: ');
    const policy = await askQuestion(rl, 'Policy name: ');
    const isIndex = await askQuestion(rl, 'Is index (y/n): ').then(
      data => data.toLowerCase() === 'y'
    );
    const path = await askQuestion(rl, 'Path: ');
    fs.mkdirSync(`src/routes/${name}`, { recursive: true }, err => {
      if (err) throw err;
    });
    fs.writeFile(
      `src/routes/${name}/index.tsx`,
      INDEX_ROUTE(name, name, path, isIndex, policy),
      err => {
        // In case of a error throw err.
        if (err) throw err;
      }
    );
    fs.readFile('src/routes/routes.tsx', 'utf-8', (err, contents) => {
      if (err) {
        return console.error(err);
      }
      const updated = contents
        .replace(
          '// DO NOT REMOVE ~IMPORT~',
          `import { route_${name} } from './${name}';\n// DO NOT REMOVE ~IMPORT~`
        )
        .replace(
          '// DO NOT REMOVE ~INTERNAL~',
          `, route_${name}\n// DO NOT REMOVE ~INTERNAL~`
        );
      fs.writeFile('src/routes/routes.tsx', updated, 'utf-8', err2 => {
        if (err2) {
          console.log(err2);
        }
      });
    });
    rl.close();
  }
};

main().catch(console.error);

// let data = "import { Route } from txt";

// fs.writeFile("src/routes/index.ts", data, (err) => {
//   // In case of a error throw err.
//   if (err) throw err;
// });
