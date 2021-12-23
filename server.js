const express = require('express')
const path = require('path')
const app = express()
require('express-ws')(app);
const fs = require('fs');
const rxjs = require('rxjs');
const basicAuth = require('express-basic-auth')

const password = 'Es6I7jxAEIvgVUlSbjoomYy4rYT7byajSKbnW9zI9MktIenWvRzOtq7zsOKFApPm';

const auth = basicAuth({
    challenge: true,
    users: {
        'admin': password
    }
})

const port = 3000

const fileSubject = new rxjs.BehaviorSubject(null);

app.ws('/', async (ws, req) => {
    if (req.query.token !== password) {
        console.log('unauthorized', req.query.token, password);
        ws.close();
        return;
    }

    fileSubject.subscribe(
        (data) => {
            ws.send(data);
        }
    )
});

app.get('/', auth, async (req, res) => {
    fs.readFile(
        path.resolve(__dirname, 'index.html'),
        'utf8',
        (err, data) => {
            res.send(data);
        }
    )
})

app.post('/', auth, async (req, res, next) => {
    var data = '';
    req.setEncoding('utf8');
  
    req.on('data', (chunk) => { 
        data += chunk;
    });
  
    req.on('end', async () => {
        fileSubject.next(data);
        res.send();
        next();
    });
});

app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`)
})