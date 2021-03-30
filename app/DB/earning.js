async function getProfitEarningsFromFunds(dbConnection, funds) {
  try {
    let result = await dbConnection.query('SELECT * FROM earning WHERE FK_Funds=' + funds.ID);
    return result[0].Profit;
  } catch (e) {
    console.log(e);
    console.log('getEarningsFromFunds Error');
    return false;
  }
}

async function getBeermoneyEarningsFromTradingPool(dbConnection, tradingPool) {
  try {
    let result = await dbConnection.query('SELECT SUM(Beermoney) Beermoney FROM earning WHERE FK_TradingPool=' + tradingPool.ID);
    return result[0].Beermoney;
  } catch (e) {
    console.log(e);
    console.log('getEarningsFromTradingPool Error');
    return false;
  }
}

module.exports = {
  getProfitEarningsFromFunds,
  getBeermoneyEarningsFromTradingPool,
};
