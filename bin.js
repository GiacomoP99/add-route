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

const INDEX_ROUTE = (name, path, isIndex, policy) => `import React from 'react'
const ${name} = React.lazy(() => import('@pages/${name}'));
// OBJECT
const Mapper = {
  ${name}: <${name} />
  // ADD MAPPER
};
// OBJECT
const base = {
    path: "${path}",
    isIndex: ${isIndex},
    component: "${name}",
    children: [],
    policy: ${policy || null}
}
// OBJECT
const transform = obj => {
  return {
    ...obj,
    component: Mapper[base.component],
    children: obj.children?.map(el => transform(el))
  };
};

export const route_${name} = transform(base);
`;

const askQuestion = (rl, question) => {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
};

const addInCorrect = (obj, parents, toAdd, index) => {
  if (parents.length === index + 1 && obj.component === parents[index]) {
    return {
      ...obj,
      children: [...obj.children, toAdd]
    };
  }
  return {
    ...obj,
    children: obj.children.map(child =>
      addInCorrect(child, parents, toAdd, index + 1)
    )
  };
};

const main = async () => {
  if (yargs.argv.init) {
    fs.mkdirSync('src/routes', { recursive: true }, err => {
      if (err) throw err;
    });
    fs.cpSync('init', 'src/routes', { recursive: true });
  } else if (yargs.argv.info) {
    console.log(
      `init - to create folders and index file\nadd - to create a new route`,
      yargs.argv
    );
  } else {
    const rl = createInterface();
    let tmp;
    const parents = [];
    if (yargs.argv.sub) {
      do {
        tmp = await askQuestion(rl, 'Parent name: ');
        tmp && parents.push(tmp);
      } while (tmp);
    }
    const name = yargs.argv.name
      ? yargs.argv.name
      : await askQuestion(rl, 'Route name: ');
    const policy = yargs.argv.fast
      ? null
      : await askQuestion(rl, 'Policy name: ');
    const isIndex = yargs.argv.fast
      ? false
      : await askQuestion(rl, 'Is index (y/n): ').then(
          data => data.toLowerCase() === 'y'
        );
    const path = yargs.argv.fast
      ? `/${name.toLowerCase()}`
      : await askQuestion(rl, 'Path: ');
    if (parents.length > 0) {
      fs.readFile(
        `src/routes/${parents[0]}/index.tsx`,
        'utf-8',
        (err, contents) => {
          if (err) {
            return console.error(err);
          }
          const [imports, mapper, object, result] = contents.split('// OBJECT');
          const newImports = [
            ...imports.split('\n'),
            `const ${name} = React.lazy(() => import('@pages/${parents.join('/')}/${name}'));\n`
          ].filter(el => !!el);
          const newMapper = mapper.replace(
            '// ADD MAPPER',
            `,${name}: <${name} />\n// ADD MAPPER`
          );
          const [start, end] = object.split(' = ');
          const parsedObj = JSON.parse(
            end
              .replace(';', '')
              .replace(/(\w+):/g, '"$1":')
              .replaceAll(`'`, '"')
          );
          const newObj = addInCorrect(
            parsedObj,
            parents,
            {
              path: path,
              isIndex: isIndex,
              component: name,
              children: [],
              policy: policy || null
            },
            0
          );

          fs.writeFile(
            `src/routes/${parents[0]}/index.tsx`,
            [
              newImports.join('\n'),
              newMapper,
              [start, JSON.stringify(newObj)].join(' = '),
              result
            ].join('// OBJECT'),
            'utf-8',
            err2 => {
              if (err2) {
                console.log(err2);
              }
            }
          );
        }
      );
    } else {
      fs.mkdirSync(`src/routes/${name}`, { recursive: true }, err => {
        if (err) throw err;
      });
      fs.writeFile(
        `src/routes/${name}/index.tsx`,
        INDEX_ROUTE(name, path, isIndex, policy),
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
    }
    rl.close();
  }
};

main().catch(console.error);
