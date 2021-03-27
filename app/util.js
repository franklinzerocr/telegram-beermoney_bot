// Get current DateTime in MySQL format
function getDateTime() {
  let date_ob = new Date();
  // adjust 0 before single digit date
  let date = ('0' + date_ob.getDate()).slice(-2);
  // current month
  let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
  // current year
  let year = date_ob.getFullYear();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
}

function datetimeToTimeStamp(datetime) {
  return Date.parse(datetime) / 1000;
}

Number.prototype.noExponents = function () {
  var data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  var z = '',
    sign = this < 0 ? '-' : '',
    str = data[0].replace('.', ''),
    mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + '0.';
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
};

function btcToSatoshi(btc) {
  return Number((btc * 100000000).toFixed(0));
}

function satoshiToBTC(satoshi) {
  satoshi = satoshi / 100000000;
  satoshi = Number(satoshi.toFixed(8));
  satoshi = satoshi.noExponents();
  return satoshi;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
  btcToSatoshi,
  getDateTime,
  sleep,
  satoshiToBTC,
  datetimeToTimeStamp,
  numberWithCommas,
};
