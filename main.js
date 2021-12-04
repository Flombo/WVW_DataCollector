const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const request=require('request');
const { Kafka } = require('kafkajs')
const cron = require('node-cron');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));


const kafka = new Kafka({
    clientId: 'producersite',
    brokers: ['localhost:9092']
});

let producerMatchMap = new Map();

const wvwURL = "https://api.guildwars2.com/v2/wvw/matches/";

async function initProducer(){
    let producerMatch2_1 = kafka.producer();
    await producerMatch2_1.connect();
    producerMatchMap.set('2-1', producerMatch2_1);

    let producerMatch2_2 = kafka.producer();
    await producerMatch2_2.connect();
    producerMatchMap.set('2-2', producerMatch2_2);

    let producerMatch2_3 = kafka.producer();
    await producerMatch2_3.connect();
    producerMatchMap.set('2-3', producerMatch2_3);

    let producerMatch2_4 = kafka.producer();
    await producerMatch2_4.connect();
    producerMatchMap.set('2-4', producerMatch2_4);

    let producerMatch2_5 = kafka.producer();
    await producerMatch2_5.connect();
    producerMatchMap.set('2-5', producerMatch2_5);
}

initProducer();

function callAPI(){
    producerMatchMap.forEach((producer, topicName) => {
        request.get(wvwURL + topicName + '.json', async (err,res,body) => {
            try {
                if (err) console.log(err);

                await producer.send({
                    topic: topicName,
                    messages: [
                        {
                            value : body
                        }
                    ]
                });

            } catch (exception) {
                console.log(exception);
            }
        });
    });
}

cron.schedule('* * * * * *', function() {
    callAPI();
});

app.get('/', (req, res) => {
   res.send('hello');
});

server.listen(3000, '141.28.73.146');