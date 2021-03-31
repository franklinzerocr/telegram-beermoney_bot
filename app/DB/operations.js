async function storeDepositOperation(dbConnection, funds, txId) {
  try {
    let result = await dbConnection.query('INSERT INTO `operations` (`Type`,`txId`,`FK_User`, `FK_Funds`)' + 'VALUES ("Deposit",  "' + txId + '",' + funds.FK_User + ',' + funds.ID + ');');
    return result.insertId;
  } catch (e) {
    console.log(e);
    console.log('storeDepositOperation error');
    return false;
  }
}

async function storeWithdrawalOperation(dbConnection, funds, amount) {
  try {
    let result = await dbConnection.query('INSERT INTO `operations` (`Type`,`Amount`,`Status`,`FK_User`, `FK_Funds`)' + 'VALUES ("Withdrawal",  ' + amount + ',"Confirmed",' + funds.FK_User + ',' + funds.ID + ');');
    return result.insertId;
  } catch (e) {
    console.log(e);
    console.log('storeDepositOperation error');
    return false;
  }
}

async function getOperationsFromFunds(dbConnection, funds) {
  try {
    let result = await dbConnection.query('SELECT * FROM operations WHERE FK_Funds=' + funds.ID);
    return result;
  } catch (e) {
    console.log(e);
    console.log('getOperationsFromFunds Error');
    return false;
  }
}

module.exports = {
  storeDepositOperation,
  storeWithdrawalOperation,
  getOperationsFromFunds,
};
