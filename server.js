var http = require('http');
var express = require('express');
var app = express();
const puppeteer = require('puppeteer');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('Hello World!');
// }).listen(8080);

app.get('/start', function(req, res){
    (async () => {
        try {
          const browser = await puppeteer.launch({
            headless: true
          });
          const page = await browser.newPage();
          await page.setDefaultNavigationTimeout(0);           
          await page.goto('https://www.target.com');

          let body = await page.evaluate(() => {
            return document.querySelector('body').innerHTML;
          });
          var hrefSegs = body.split(/href="(.*?)"/g);
          for (var i = 1;i < hrefSegs.length;i+=2)
          {
              console.log(hrefSegs[i] + "\n");
          }
          await browser.close();
        } catch (error) {
          console.log(error);
        }
    })();
});
  
app.listen(3000);