async function getNewlyCreatedFloors(dbConnection) {
  try {
    // 1min Delay
    let timeConditionEntry = '(UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 <1 AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 >=0';
    let timeConditionEnd = '(UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 <1 AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 >=0';

    let result = await dbConnection.query('SELECT * FROM floor f WHERE DateTime IS NOT NULL AND ((Level=0 AND ' + timeConditionEntry + ') OR (Level=-2 AND ' + timeConditionEnd + ' AND Profit<=10)) AND TweetID is Null AND OrderID>0 ');
    return result;
  } catch (e) {
    console.log(e);
    console.log('getNewlyCreatedFloor Error');
    return false;
  }
}

async function getInitialFloor(dbConnection, tradingPlanID) {
  try {
    let result = await dbConnection.query('SELECT * FROM floor f WHERE Level=0 AND FK_Trading_Plan=' + tradingPlanID);

    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getInitialFloor Error');
    return false;
  }
}

module.exports = {
  getInitialFloor,
  getNewlyCreatedFloors,
};
