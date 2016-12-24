const {
  inspectContent
} = require('../../lib/inspector');
const expect = require('chai').expect;

describe('inspect', () => {
  it('inspectContent require', () => {
    let str1 = 'let _ = require("lodash")';
    let str2 = "var promise = require('bluebird')";
    let str = [str1, str2].join('\n');
    let res = inspectContent(str, ['lodash', 'bluebird', 'glob']);
    expect(res).to.deep.equal(['lodash', 'bluebird']);
  });

  it('inspectContent import', () => {
    let str1 = 'import _ from "lodash"';
    let str2 = "import Promise from 'bluebird'";
    let str = [str1, str2].join('\n');
    let res = inspectContent(str, ['lodash', 'bluebird', 'glob']);
    expect(res).to.deep.equal(['lodash', 'bluebird']);
  });
  
  it('inspectContent /', () => {
    let str1 = 'import {readFile} from "mz/fs"';
    let str2 = "const {stat} = require('mz/fs')";
    let res = inspectContent(str1, ['lodash', 'bluebird', 'glob', 'mz']);
    let res1 = inspectContent(str2, ['lodash', 'bluebird', 'glob', 'mz']);
    expect(res).to.deep.equal(['mz']);
    expect(res1).to.deep.equal(['mz']);
  });


});
