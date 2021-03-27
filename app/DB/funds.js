async function getLastFundsFromUser(dbConnection, user) {
  try {
    let result = await dbConnection.query('SELECT * FROM funds WHERE FK_User=' + user.ID + ' ORDER BY ID DESC LIMIT 1');
    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getLastFundsFromUser Error');
    return false;
  }
}

async function getPreviousTwoFundsFromUser(dbConnection, user) {
  try {
    let result = await dbConnection.query('SELECT * FROM funds WHERE FK_User=' + user.ID + ' ORDER BY ID DESC LIMIT 2');
    return result;
  } catch (e) {
    console.log(e);
    console.log('getLastFundsFromUser Error');
    return false;
  }
}

module.exports = {
  getLastFundsFromUser,
  getPreviousTwoFundsFromUser,
};
