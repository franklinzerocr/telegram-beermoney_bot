async function getNewlyCreatedFloors(dbConnection) {
  try {
    // 1min Delay
    let timeConditionEntry = '(UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 <1 AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 >=0';
    let timeConditionEnd = '(UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 <1 AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 >=0';

    let result = await dbConnection.query('SELECT * FROM floor f WHERE DateTime IS NOT NULL AND ((Level=0 AND ' + timeConditionEntry + ') OR (Level=-4 AND ' + timeConditionEnd + ' )) AND TelegramID is Null AND OrderID>0 AND Pair<>"BNB" ');
    return result;
  } catch (e) {
    console.log(e);
    console.log('getNewlyCreatedFloor Error');
    return false;
  }
}

async function getNewlyCreatedFloorsSignals(dbConnection) {
  try {
    // Delay conditions
    let timeConditionEntry = '(UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 <1 AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 >=0';
    let timeConditionEnd = '(UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 <(f.RandomMinutes+1) AND (UNIX_TIMESTAMP(CURRENT_TIME())-UNIX_TIMESTAMP(f.DateTime))/60 >=f.RandomMinutes';

    let result = await dbConnection.query('SELECT * FROM floor f WHERE DateTime IS NOT NULL AND ((Level=0 AND ' + timeConditionEntry + ') OR (Level=-4 AND ' + timeConditionEnd + ' )) AND SignalsID is Null AND OrderID>0 AND Pair<>"BNB" ');
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
async function getAlertOfFloor(dbConnection, floor) {
  try {
    let result = await dbConnection.query('SELECT ta.Channel Channel FROM trading_plan tp, trade_cycle tc, telegram_alert ta WHERE ta.ID=tc.FK_Telegram_Alert AND tc.ID=tp.FK_Trade_Cycle AND tp.ID=' + floor.FK_Trading_Plan);

    return result[0];
  } catch (e) {
    console.log(e);
    console.log('getAlertOfFloor Error');
    return false;
  }
}

async function updateTelegramFloor(dbConnection, floor, telegramID) {
  try {
    let result = await dbConnection.query('UPDATE floor SET TelegramID=' + telegramID + '  WHERE ID=' + floor.ID);

    return result;
  } catch (e) {
    console.log(e);
    console.log('updateTelegraamFloor Error');
    return false;
  }
}

async function updateTelegramFloorSignals(dbConnection, floor, telegramID) {
  try {
    let result = await dbConnection.query('UPDATE floor SET SignalsID=' + telegramID + '  WHERE ID=' + floor.ID);

    return result;
  } catch (e) {
    console.log(e);
    console.log('updateTelegramFloorSignals Error');
    return false;
  }
}

module.exports = {
  getInitialFloor,
  getNewlyCreatedFloors,
  updateTelegramFloor,
  getAlertOfFloor,
  getNewlyCreatedFloorsSignals,
  updateTelegramFloorSignals,
};
