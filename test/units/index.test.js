const inspect = require('../../');
const path = require('path');
const expect = require('chai').expect;

describe('inspect index', () => {
  it('inspect proj1', (done) => {
    const dir1 = path.join(__dirname, '../fixtures/proj1');
    let expected = {
      "notDep": {
        "dep": [
          "glob"
        ],
        "dev": []
      },
      "deps": {
        "dep": {
          "bluebird": [
            "lib/a.js",
            "lib/c.js"
          ],
          "mz": [
            "lib/b.js"
          ]
        },
        "dev": {
          "chai": [
            "test/index.js"
          ]
        }
      }
    };
    inspect({
      path: dir1
    }).then((data) => {
      expect(data).to.deep.equal(expected);
      done();
    }).catch((e) => {
      throw e;
    });
  });

  it('inspect proj2', () => {
    const dir2 = path.join(__dirname, '../fixtures/proj2');
    inspect({
      path: dir2
    }).then((data) => {
      let expected = {
        notDep: {
          dep: [],
          dev: []
        },
        deps: {
          dep: {},
          dev: {}
        }
      };
      expect(data).to.deep.equal(expected);
    }).catch((e) => {
      throw e;
    });
  });
});
