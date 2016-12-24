const promise = require('bluebird');
const glob = promise.promisify(require('glob'));
const path = require('path');
const _ = require('lodash');
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
      return {
        dep: pkg.dependencies,
        devDep: pkg.devDependencies
      };
    });
  });
}

function extractKey(obj, ignore=[]) {
  let keys = Object.keys(obj);
  _.pullAll(keys, ignore);
  return keys;
}

function inspectContent(content, deps) {
  return deps.map((dep) => {
    let regRequire = new RegExp(`require\\([\\"|\\']${dep}\\/?`, 'g');
    let regImport = new RegExp(`import.*from\\s*[\\"\\']${dep}\\/?`, 'g');
    if (regRequire.test(content) || regImport.test(content)) {
      return dep;
    }
    return false;
  }).filter((item) => {
    return item;
  });
}

function initDepMap(deps, devs) {
  const depMap = {
    dep: {},
    dev: {}
  };
  deps.forEach((dep) => {
    depMap.dep[dep] = undefined;
  });
  devs.forEach((dev) => {
    depMap.dev[dev] = undefined;
  });
  return depMap;
}

function addMap(map, arr, val) {
  arr.map((item) => {
    if (!map[item]) {
      map[item] = [val];
    } else {
      map[item].push(val);
    }
  });
}

function inspector(dir, options) {
  let ignore = options.ignore;
  return readDep(dir).then((pkg) => {
    let {
      dep,
      devDep
    } = pkg;
    const deps = extractKey(dep, ignore);
    const devDeps = extractKey(devDep, ignore);
    const depMaps = initDepMap(deps, devDeps);
    return glob('**/*.js', {
      cwd: dir,
      ignore: 'node_modules/**/*'
    }).map((file) => {
      let rp = path.join(dir, file);
      return readFile(rp).then((content) => {
        let isdeps = inspectContent(content, deps);
        let isdepDevs = inspectContent(content, devDeps);
        addMap(depMaps.dep, isdeps, file);
        addMap(depMaps.dev, isdepDevs, file);
      });
    }).then(() => {
      return depMaps;
    });
  });
}

let main = (dir, options) => {
  if(!options){
    options = require('./config.default.js'); 
  }
  const display = {
    notDep: {
      dep: [],
      dev: []
    },
    deps: {}
  };
  return inspector(dir, options).then((devMap) => {
    for (let dk in devMap.dep) {
      if (!devMap.dep[dk]) {
        display.notDep.dep.push(dk);
        delete devMap.dep[dk];
      }
    }
    for (let devk in devMap.dev) {
      if (!devMap.dev[devk]) {
        display.notDep.dev.push(devk);
        delete devMap.dev[devk];
      }
    }
    display.deps = devMap;
    return display;
  });
};

module.exports = {
  inspectContent,
  inspect: main
};
