var mysql = require('mysql');
var http = require('http');
const dotenv = require('dotenv');
const util = require('util');
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
  password: process.env.DB_PW,
  database: process.env.DB_NAME
});
const query = util.promisify(con.query).bind(con);
var isRunning = true;

(async () => {
  try {
    while(isRunning)
    {
      const rows = await query('select * from queue where is_processing=0');
      if (rows.length == 0)
      {
        isRunning = false;
        console.log("No URL");
      }
      else
      {
        item = rows[0];
        child.on('message', (message) => {
          var link = message.url;
          var site_id = message.site_id;

          const siteDatas = await query('select * from sites where id=' + site_id);
          if (siteDatas.length == 0) 
          {
              console.log('Unregistered Site ID');
              return;
          }
          let siteData = siteDatas[0];
          if (link.startsWith(siteData.product_url_format))
          {
            var sql = "INSERT INTO product_url (site_id, link) VALUES ('Company Inc', 'Highway 37')";
            //Add Product URL
          }
          else
          {
            //Add Queue
          }      
        });
        console.log(item.link);     
        child.send({cmd:'start',url:item.link,site_id:item.site_id});      
        await query('update queue set is_processing=1 where id=' + item.id);
      }      
    }
  } finally {
    conn.end();
  }
})()

// child.on('message', (message) => {
//   console.log('Returning /total results');
//   console.log(message);
// });
// child.send({cmd:'start',url:"http://aaa.com"});

