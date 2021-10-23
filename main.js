const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const request=require('request');
const { Kafka } = require('kafkajs')
app.set('view engine', 'ejs');
app.use(express.static(__dirname));


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

let producer;

async function initProducer(){
    producer = kafka.producer()
    await producer.connect()
}

async function initConsumer(){
    const consumer = kafka.consumer({ groupId: 'test-group' })

    await consumer.connect()
    await consumer.subscribe({ topic: 'wvwDataCollector', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            })
        },
    })
}

initProducer();
initConsumer();

function callAPI(){
    const wvwURL = "https://api.guildwars2.com/v2/wvw/matches/2-1.json";

    request.get(wvwURL,async (err,res,body) => {
        if(err) console.log(err);
        await producer.send({
            topic: 'wvwDataCollector',
            messages: [
                { value: body },
            ],
        })
    })
}

server.listen(3000, "localhost", null, () => {
    setInterval(callAPI, 1000);
});