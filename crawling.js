var http = require('http');
var express = require('express');
var app = express();
const puppeteer = require('puppeteer');

process.on('message', (message) => {
    if (message.cmd == 'start') {
        console.log('------------------Starting-----------------');
        crawlPage(message.url,message.site_id);        
    }
});

async function crawlPage(link,site_id) {
    try {
        const browser = await puppeteer.launch({
          headless: true
        });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);           
        await page.goto(link);

        let body = await page.evaluate(() => {
          return document.querySelector('body').innerHTML;
        });
        var hrefSegs = body.split(/href="(.*?)"/g);
        for (var i = 1;i < hrefSegs.length;i+=2)
        {
            console.log(hrefSegs[i] + "\n");
            if (hrefSegs[i].startsWith('http')) continue;
            let message = {url:hrefSegs[i],site_id:site_id}
            process.send(message);
        }
        await browser.close();
      } catch (error) {
        console.log(error);
    }
}