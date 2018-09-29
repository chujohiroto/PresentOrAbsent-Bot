'use strict';

const http = require('http');
const https = require('https');
const crypto = require('crypto');

const HOST = 'api.line.me';
const REPLY_PATH = '/v2/bot/message/reply';//リプライ用
const CH_SECRET = 'ea46a5b3b13d5c720709adbc1762782c'; //Channel Secretを指定
const CH_ACCESS_TOKEN = 'PWp2/OpgqiMmz8jeZaMXLSsYB313ElEb2BUixY7F49PR/GhZTg39VwXLXwjUF/VUvNG+N7sL1PALiN2ErfYcd3s0Vu0nedpKsZaWWqaOgXCeIvb4Yp3DSMpM8lcgAzMMp0utm5jW7ri36zmMDd5MxgdB04t89/1O/w1cDnyilFU='; //Channel Access Tokenを指定
const SIGNATURE = crypto.createHmac('sha256', CH_SECRET);
const PORT = process.env.PORT || 8080;

/**
 * httpリクエスト部分
 */
const client = (replyToken, SendMessageObject) => {
    let postDataStr = JSON.stringify({ replyToken: replyToken, messages: SendMessageObject });
    let options = {
        host: HOST,
        port: 443,
        path: REPLY_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Line-Signature': SIGNATURE,
            'Authorization': `Bearer ${CH_ACCESS_TOKEN}`,
            'Content-Length': Buffer.byteLength(postDataStr)
        }
    };

    return new Promise((resolve, reject) => {
        let req = https.request(options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });
        req.write(postDataStr);
        req.end();
    });
};

http.createServer((req, res) => {
    if (req.url !== '/webhook' || req.method !== 'POST') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('');
    }

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        if (body === '') {
            console.log('bodyが空です。');
            return;
        }

        let WebhookEventObject = JSON.parse(body).events[0];
        //メッセージが送られて来た場合
        if (WebhookEventObject.type === 'message') {
            let SendMessageObject;
            if (WebhookEventObject.message.type === 'text') {
                SendMessageObject = [{
                    type: 'text',
                    text: WebhookEventObject.message.text
                }];
            }
            let message = getMessage(WebhookEventObject.message.text);
            console.log(message);
            client(WebhookEventObject.replyToken, SendMessageObject)
                .then((message) => {
                    console.log(message);
                }, (e) => { console.log(e) });
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('success');
    });

}).listen(PORT);

console.log(`Server running at ${PORT}`);

function getMessage(t) {
    var dtl = getUnixTimeLesson(t);
    console.log(dtl);
    dtl.setMinutes(dtl.getMinutes - 30);
    console.log(dtl);
    if (dtl > getToday()) {
        return "間に合うよ";
    } else {
        return "諦めろ";
    }
}


function getUnixTimeLesson(t) {
    var lesson;
    var tint = Number(t)
    switch (tint) {
        case 1:
            lesson = new Date(new Date().setHours(9, 0, 0, 0));
            break;
        case 2:
            lesson = new Date(new Date().setHours(10, 30, 0, 0));
            break;
        case 3:
            lesson = new Date(new Date().setHours(13, 0, 0, 0));
            break;
        case 4:
            lesson = new Date(new Date().setHours(14, 30, 0, 0));
            break;
        case 5:
            lesson = new Date(new Date().setHours(16, 0, 0, 0));
            break;
        case 6:
            lesson = new Date(new Date().setHours(17, 30, 0, 0));
            break;
        case 7:
            lesson = new Date(new Date().setHours(19, 0, 0, 0));
            break;
        case 8:
            lesson = new Date(new Date().setHours(21, 30, 0, 0));
            break;
    }
    return lesson;
}

function getToday() {
    var today = new Date(new Date().setHours(0, 0, 0, 0));
    return today;
}
