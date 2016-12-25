const _ = require('lodash');
const path = require('path');
const {
  readFile,
  stat
} = require('mz/fs');

function readDep(dir) {
  const pkgPath = path.join(dir, 'package.json');
  return stat(pkgPath).then(() => {
    return readFile(pkgPath).then(data => {
      let pkg;
      try {
        pkg = JSON.parse(data);
      } catch (e) {
        throw new TypeError('json parse error');
      }
      return pkg;
    });
  });
}

function extractKey(obj, ignore = []) {
  let keys = Object.keys(obj);
  _.pullAll(keys, ignore);
  return keys;
}

function getDeps(dir, options) {
  let ignore = options.ignore;
  return readDep(dir).then((pkg) => {
    let {
      dependencies,
      devDependencies,
      scripts
    } = pkg;
    const deps = extractKey(dependencies, ignore);
    const devDeps = extractKey(devDependencies, ignore);
    return {
      deps,
      devDeps,
      scripts
    };
  });
}

function analyseScript(scripts, devs) {
  let scriptVals = _.values(scripts);
  return devs.map((dev) => {
    let len = scriptVals.length;
    while (len--) {
      let script = scriptVals[len];
      if (script.indexOf(dev) > -1) {
        return dev;
      }
    }
    return false;
  }).filter((item) => {
    return item;
  });
}

module.exports = {
  analyseScript,
  getDeps
};
