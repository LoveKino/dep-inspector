const {
  inspect
} = require('../../lib/inspector');
const path = require('path');

describe('inspect index', () => {
  it('inspect proj1', (done) => {
    const dir1 = path.join(__dirname, '../fixstures/proj1');
    let expect = {
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
    inspect(dir1).then((data) => {
      expect(data).to.deep.equal(data);
    }).catch((e) => {
      throw e;
    });
  });
});
