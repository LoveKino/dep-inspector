# dep-inspector
for npm dependencies inspector

[![Build Status](https://travis-ci.org/hongxuanlee/dep-inspector.svg?branch=master)](https://travis-ci.org/hongxuanlee/dep-inspector)
[![Coverage Status](https://coveralls.io/repos/github/hongxuanlee/dep-inspector/badge.svg?branch=master)](https://coveralls.io/github/hongxuanlee/dep-inspector?branch=master)

### usage

#### command use
```
  npm install -g dep-inspector
```

``` 
   cd yourProject
   dep-inspector
```

### npm require

```
  npm install dep-inspector
```

```
  const inspector = require('dep-inspector');
  const dir = __dirname; // or your specified path
  inspector(dir, options).then((result) => {
     // to do...
  });
```




