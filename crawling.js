var mysql = require('mysql');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const util = require('util');
dotenv.config();

var con = mysql.createConnection({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME
});
const query = util.promisify(con.query).bind(con);
process.on('message', (message) => {
    if (message.cmd == 'start') {
        console.log('------------------Starting-----------------');
        crawlPage(message.url,message.site_id);        
    }
});

async function crawlPage(link,site_id) {
    const proxys = await query('select * from proxy');
    proxyCount = 0;
    isSuccess = false;
    while(!isSuccess)
    {
      try {        
          const browser = await puppeteer.launch({
            headless: true,
            args:[
              '--proxy-server=' + proxys[proxyCount].proxy_address_http
            ]
          });
          const page = await browser.newPage();
          await page.authenticate({username:proxys[proxyCount].username, password:proxys[proxyCount].password});
          await page.setDefaultNavigationTimeout(0);           
          await page.goto(link);

          let body = await page.evaluate(() => {
            return document.querySelector('body').innerHTML;
          });
          var hrefSegs = body.split(/href="(.*?)"/g);
          for (var i = 1;i < hrefSegs.length;i+=2)
          {
              //console.log(hrefSegs[i] + "\n");
              if (hrefSegs[i].startsWith('#')) continue;
              let message = {url:hrefSegs[i],site_id:site_id}
              await sleep(1000);
              console.log('Found Link:' + hrefSegs[i]);
              process.send(message);
          }
          await browser.close();
          isSuccess = true;
      } catch (error) {
        await sleep(1000);
        proxyCount = (proxyCount + 1) % proxys.length;
        console.log(error);
      }
    }
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 