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
    console.log('storeWithdrawalOperation error');
    return false;
  }
}

async function getConfirmedOperationsFromFunds(dbConnection, funds) {
  try {
    let result = await dbConnection.query('SELECT * FROM operations WHERE Status="Done" FK_Funds=' + funds.ID);
    return result;
  } catch (e) {
    console.log(e);
    console.log('getConfirmedOperationsFromFunds Error');
    return false;
  }
}
async function getUnconfirmedOperationsFromFunds(dbConnection, funds) {
  try {
    let result = await dbConnection.query('SELECT * FROM operations WHERE Status="Unconfirmed" FK_Funds=' + funds.ID);
    return result;
  } catch (e) {
    console.log(e);
    console.log('getUnconfirmedOperationsFromFunds Error');
    return false;
  }
}

module.exports = {
  storeDepositOperation,
  storeWithdrawalOperation,
  getConfirmedOperationsFromFunds,
  getUnconfirmedOperationsFromFunds,
};
