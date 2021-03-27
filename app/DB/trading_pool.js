async function getPrevTradingPool(dbConnection) {
  try {
    let result = await dbConnection.query('SELECT * FROM trading_pool ORDER BY ID DESC LIMIT 1');
    return result;
  } catch (e) {
    console.log(e);
    console.log('getLastTradingPool Error');
    return false;
  }
}

async function checkDiffTradingPool(dbConnection) {
  try {
    let result = await dbConnection.query('SELECT * FROM trading_pool WHERE (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(Date))/60/60 <1');
    return result;
  } catch (e) {
    console.log(e);
    console.log('checkDiffTradingPool Error');
    return false;
  }
}

module.exports = {
  getPrevTradingPool,
  checkDiffTradingPool,
};
