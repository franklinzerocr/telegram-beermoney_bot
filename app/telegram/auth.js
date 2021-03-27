const db = require('../DB/db');
const { resultsChannelMessage } = require('./messages');

async function checkAuth(dbConnection, username, T_userid) {
  let userByID = await db.users.getUserByT_userid(dbConnection, T_userid);
  let userByUsername = await db.users.getUserByUsername(dbConnection, username);
  if (userByID && userByUsername && userByID.T_userid == userByUsername.T_userid && userByID.Username == userByUsername.Username) {
    // Returning User
    return userByID;
  } else if (userByID && !userByUsername) {
    // Returning User but changed username
    await db.users.updateUserUsername(dbConnection, username, T_userid);
    return userByID;
  } else if (!userByID && userByUsername && userByUsername.T_userid == null) {
    // New user
    await db.users.updateUserT_userid(dbConnection, username, T_userid);
    resultsChannelMessage(ctx, bot);
    return userByUsername;
  } else return null;
}

module.exports = {
  checkAuth,
};
