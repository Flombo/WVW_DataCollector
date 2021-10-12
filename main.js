const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const request=require('request');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));

app.get('/', (req, response)=>{
    const wvwURL = "https://api.guildwars2.com/v1/wvw/matches.json";

    request.get(wvwURL, (err,res,body) => {
        if(err) console.log(err);
        response.send(body);
    })
})

function callAPI(){
    const wvwURL = "https://api.guildwars2.com/v1/wvw/matches.json";

    request.get(wvwURL, (err,res,body) => {
        if(err) console.log(err);
        console.log(body);
    })
}

server.listen(3000, "localhost", null, () => {
    setInterval(callAPI, 1000);
});