async function storeDepositOperation(dbConnection, user, txId) {
  try {
    let result = await dbConnection.query('INSERT INTO `operations` (`Type`,`txId`,`FK_User`)' + 'VALUES ("Deposit",  "' + txId + '",' + user.ID + ');');
    return result.insertId;
  } catch (e) {
    console.log(e);
    console.log('storeDepositOperation error');
    return false;
  }
}

async function storeWithdrawalOperation(dbConnection, funds, amount) {
  try {
    let sum = await dbConnection.query('SELECT coalesce(sum(Amount),0) sum  FROM operations WHERE FK_Funds=' + funds.ID);
    console.log(sum[0].sum);
    console.log(sum[0].sum + amount);
    console.log(funds.Amount);
    if (sum[0].sum + amount > funds.Amount) return false;

    let result = await dbConnection.query('INSERT INTO `operations` (`Type`,`Asset`,`Amount`,`Status`,`FK_User`, `FK_Funds`)' + 'VALUES ("Withdrawal",  "' + funds.Asset + '",' + amount + ',"Confirmed",' + funds.FK_User + ',' + funds.ID + ');');
    return result.insertId;
  } catch (e) {
    console.log(e);
    console.log('storeWithdrawalOperation error');
    return false;
  }
}

async function getConfirmedOperationsFromFunds(dbConnection, funds) {
  try {
    let result = await dbConnection.query('SELECT * FROM operations WHERE Status="Done" AND FK_Funds=' + funds.ID);
    return result;
  } catch (e) {
    console.log(e);
    console.log('getConfirmedOperationsFromFunds Error');
    return false;
  }
}
async function getUnconfirmedOperationsFromFunds(dbConnection, funds) {
  try {
    let result = await dbConnection.query('SELECT * FROM operations WHERE Status="Unconfirmed" AND FK_Funds=' + funds.ID);
    return result;
  } catch (e) {
    console.log(e);
    console.log('getUnconfirmedOperationsFromFunds Error');
    return false;
  }
}

async function checkExistingDeposit(dbConnection, txId) {
  try {
    let result = await dbConnection.query('SELECT * FROM operations WHERE txId="' + txId + '"');
    return result;
  } catch (e) {
    console.log(e);
    console.log('checkExistingDeposit Error');
    return false;
  }
}

module.exports = {
  storeDepositOperation,
  storeWithdrawalOperation,
  getConfirmedOperationsFromFunds,
  getUnconfirmedOperationsFromFunds,
  checkExistingDeposit,
};
