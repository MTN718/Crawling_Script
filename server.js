var mysql = require('mysql');
var http = require('http');
const dotenv = require('dotenv');
const util = require('util');
dotenv.config();
const { fork } = require('child_process');


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
const child = fork(__dirname + '/crawling.js');
(async () => {
  try {
    while(isRunning)
    {      
      const rows = await query('select * from queue where is_processing=0');
      if (rows.length == 0)
      {
        //isRunning = false;
        console.log("No URL");        
      }
      else
      {
        
        item = rows[0];
        child.on('message', (message) => {
          var link = message.url;
          var site_id = message.site_id;
          //const siteDatas = await query('select * from sites where id=' + site_id);
          (async () => {
            try {
              const siteDatas = await  query('select * from sites where id=' + site_id);
              if (siteDatas.length == 0) 
              {
                  console.log('Unregistered Site ID');
                  return;
              }
              let siteData = siteDatas[0];
              if (link.startsWith(siteData.product_url_format) || link.startsWith("https://" + siteData.base_url + siteData.product_url_format))
              {
                const links = await query('select * from product_url where link=' + link);
                if (links.length == 0)
                {
                  console.log('Add:' + link);
                  await query("INSERT INTO product_url (site_id, link) VALUES ('" + site_id + "','" + link + "')");
                }
                //Add Product URL
              }
              else
              {
                //Add Queue
                //let escaped = mysql.escape(link);
                console.log(link);
                if (!link.startsWith("http"))
                    link = "https://" + siteData.base_url + link;
                const links = await query("select * from queue where link='" + link + "'");
                if (links.length == 0)
                {                  
                  //console.log('Add:' + link);
                  await query("INSERT INTO queue (site_id, link,is_processing) VALUES ('" + site_id + "','" + link + "','0')");
                }
              }  
            } finally {
              
            }
          })();      
        });
        console.log(item.link);     
        child.send({cmd:'start',url:item.link,site_id:item.site_id});      
        await query('update queue set is_processing=1 where id=' + item.id);
      }      
      await sleep(300000);
    }
  } finally {
    //con.end();
  }  
})()

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 
