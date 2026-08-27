const app = require('../server/index');
const { readyPromise } = require('../server/db/db');

module.exports = async (req, res) => {
  await readyPromise;
  return app(req, res);
};
