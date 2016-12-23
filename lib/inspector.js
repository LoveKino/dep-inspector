const promise = require('promise');
const glob = promise.promisify(require('glob'));
const {
  readFile,
  writeFile,
  stat
} = require('mz/fs');

function readDep(dir) {
  return stat(dir).then(() => {
    return readFile(dir).then(data => {
      let pkg;
      try {
        pkg = JSON.parse(data);
      } catch (e) {
        throw new TypeError('json parse error');
      }
      return {
        dep: pkg.dependencies,
        devDep: pkg.devDependencies
      }
    })
  })
}

function extractKey(obj) {
  return Object.keys(obj);
}

function inspectContent(content, deps) {
  return deps.map((dep) => {
    let regRequire = new RegExp(`require\\([\\"|\\']${dep}`, 'g');
    let regImport = new RegExp(`import(.*)from/s[\\"\\']${dep}`, 'g');
    if (regRequire.test(content) || regImport.test(content)) {
      return dep
    }
    return false
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
      map[item].push(val)
    }
  })
}

function inspector(dir) {
  readDep(dir).then((deps) => {
    let {
      dep,
      devDep
    } = deps;
    const deps = extractKey(dep);
    const devDeps = extractKey(devDep);
    const depMaps = initDepMap(deps, devDeps);
    glob('**/*.js', {
      cwd: dir
    }).map((file) => {
      let rp = path.join(dir, file);
      return readFile(rp).then((content) => {
        let isdeps = inspectContent(content, deps);
        let isdepDevs = inspectContent(content, devDeps);
        addMap(depMap.dep, isdeps, file);
        addMap(depMap.dev, isdepDevs, file);
      })
    });
  });
}
