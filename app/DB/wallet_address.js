async function getWalletFromUser(dbConnection, user, asset) {
  try {
    let result = await dbConnection.query('SELECT * FROM wallet_address WHERE FK_User=' + user.ID + ' AND Asset="' + asset + '"  ORDER BY ID DESC LIMIT 1');
    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getWalletFromUser Error');
    return false;
  }
}

async function updateWalletAddress(dbConnection, wallet, address) {
  try {
    let result = await dbConnection.query("UPDATE wallet_address SET Wallet='" + address + "' WHERE ID='" + wallet.ID + "';");
    return result;
  } catch (e) {
    console.log(e);
    console.log('updateWalletAddress error');
  }
}

module.exports = {
  updateWalletAddress,
  getWalletFromUser,
};
