const promise = require('bluebird');
const glob = promise.promisify(require('glob'));
const path = require('path');
const pkg = require('./pkg');
const {
  readFile
} = require('mz/fs');

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
  return pkg.getDeps(dir, options).then((pkgDeps) => {
    let {
      deps,
      devDeps,
      scripts
    } = pkgDeps;
    const depMaps = initDepMap(deps, devDeps);
    let scriptDev = pkg.analyseScript(scripts, devDeps);
    addMap(depMaps.dev, scriptDev, 'npm script');
    return glob('{**/*.js,bin/**/*}', {
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

let main = (options) => {
  if (!options) {
    options = require('./config.default.js');
  }
  const dir = options.path || process.cwd();
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
