async function checkDiffTradingPool(dbConnection) {
  try {
    let result = await dbConnection.query('SELECT * FROM trading_pool WHERE BalanceMinusWithdrawals IS NOT NULL AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(Date))/60/60 <1');
    return result;
  } catch (e) {
    console.log(e);
    console.log('checkDiffTradingPool Error');
    return false;
  }
}

module.exports = {
  checkDiffTradingPool,
};
