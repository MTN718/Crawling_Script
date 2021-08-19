var mysql = require('mysql');
var http = require('http');
const dotenv = require('dotenv');
dotenv.config();
const { fork } = require('child_process');
const child = fork(__dirname + '/crawling.js');


//Connect MySQL
console.log(process.env.DB_SERVER); 
console.log(process.env.DB_USER); 
console.log(process.env.DB_PW); 
var con = mysql.createConnection({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PW
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
//
// child.on('message', (message) => {
//   console.log('Returning /total results');
//   console.log(message);
// });
// child.send({cmd:'start',url:"http://aaa.com"});

