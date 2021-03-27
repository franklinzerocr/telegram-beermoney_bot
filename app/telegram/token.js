const jwt = require('jsonwebtoken');
const db = require('../DB/db');
const config = require('config');

const generateTelegramLinkWithToken = async (dbConnection) => {
  //generate this in beermoney.io
  let users = await db.users.getAllUsers(dbConnection);

  let exitToken;
  for (let user of users) {
    let userAux = {
      username: user.Username,
    };
    let token = jwt.sign(userAux, config.telegram.secret, {
      expiresIn: 900, // 900 seconds = 15 minutes
    });

    let tokenSubString = token.substring(134, 177);

    // save this token in database to the corresponding user (only the part that would be passed into bot paypload)
    await db.users.updateTokenToUser(dbConnection, userAux, tokenSubString);
    if (user.Username == 'franklinzerocr') exitToken = token;
  }
  return exitToken;
};

const checkToken = async (token) => {
  if (token) {
    jwt.verify(token, config.telegram.secret, (err, decoded) => {
      if (err) {
        console.log('invalid token');
        return false;
      } else {
        return true;
      }
    });
  } else {
    console.log('Auth token is not supplied');
    return false;
  }
};

module.exports = {
  generateTelegramLinkWithToken,
  checkToken,
};
