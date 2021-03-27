const util = require('../util');

async function getTicker(binanceAPI) {
  while (1 == 1) {
    try {
      ticker = await binanceAPI.prices();
      return ticker;
    } catch (e) {
      // console.log(e.code)
      // console.log("getTicker error")
      await util.sleep(1000);
    }
  }
}

module.exports = {
  getTicker,
};
