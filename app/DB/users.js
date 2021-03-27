const updateUserT_userid = async (dbConnection, username, T_userid) => {
  try {
    let result = await dbConnection.query("UPDATE users SET T_userid='" + T_userid + "' WHERE Username='" + username + "';");
    return result;
  } catch (e) {
    console.log(e);
    console.log('updateUserT_userid error');
  }
};

const updateUserUsername = async (dbConnection, username, T_userid) => {
  try {
    let result = await dbConnection.query("UPDATE users SET Username='" + username + "' WHERE T_userid='" + T_userid + "';");
    return result;
  } catch (e) {
    console.log(e);
    console.log('updateUserUsername error');
  }
};

const updateUserCurrency = async (dbConnection, username, display) => {
  try {
    let result = await dbConnection.query("UPDATE users SET Display='" + display + "' WHERE Username='" + username + "';");
    return result;
  } catch (e) {
    console.log(e);
    console.log('updateUserCurrency error');
  }
};

async function getAllUsers(dbConnection) {
  try {
    let result = await dbConnection.query('SELECT * FROM users');

    return result;
  } catch (e) {
    console.log(e);
    console.log('getAllUsers error');
  }
}

async function getUserByUsername(dbConnection, username) {
  try {
    let result = await dbConnection.query('SELECT * FROM users WHERE Username="' + username + '"');

    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getUserByUsername error');
  }
}

async function getUserByT_userid(dbConnection, T_userid) {
  try {
    let result = await dbConnection.query('SELECT * FROM users WHERE T_userid="' + T_userid + '"');

    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getUserByUsername error');
  }
}

module.exports = {
  updateUserT_userid,
  getAllUsers,
  getUserByUsername,
  getUserByT_userid,
  updateUserUsername,
  updateUserCurrency,
};
