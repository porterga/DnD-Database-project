var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_porterga',
  password        : '0483',
  database        : 'cs340_porterga'
});
module.exports.pool = pool;
