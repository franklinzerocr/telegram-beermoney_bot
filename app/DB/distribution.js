async function getDistributionFromUser(dbConnection, user) {
  try {
    let result = await dbConnection.query('SELECT * FROM distribution WHERE Type="Profit" FK_User=' + user.ID);
    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getLastFundsFromUser Error');
    return false;
  }
}

module.exports = {
  getDistributionFromUser,
};
