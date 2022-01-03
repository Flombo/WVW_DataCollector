const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const server = http.createServer(app);
const { Kafka } = require('kafkajs')
const cron = require('node-cron');
app.use(express.static(__dirname));

const kafka = new Kafka({
    clientId: 'producersite',
    brokers: ['localhost:9092']
});

let producerMatchMap = new Map();

const wvwURL = "https://api.guildwars2.com/v2/wvw/matches/";

/***
 * Inits for all 5 eu-matches kafka-producers
 * and adds them for later calls into the producerMatchMap
 *
 * @returns {Promise<void>}
 */
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

/***
 * calls foreach producer the match-api and the worlds-api.
 * the worlds-attribute of the match-object will be overridden by the fetched worlds.
 * In the end the match-object will be sent to kafka.
 */
function callAPI(){
    producerMatchMap.forEach((producer, topicName) => {
        https.get(wvwURL + topicName + '.json', res => {
            try {

                let body = "";

                res.on("data", (data) => {
                    body += data;
                });

                res.on("end", () => {
                    try {
                        const matchJSON = JSON.parse(body);

                        const redID = matchJSON.worlds.red;
                        const blueID = matchJSON.worlds.blue;
                        const greenID = matchJSON.worlds.green;

                        const worldURL = `https://api.guildwars2.com/v2/worlds?ids=${redID},${blueID},${greenID}`;

                        https.get(worldURL, res => {

                            let worldsBody = "";

                            res.on("data", (data) => {
                                worldsBody += data;
                            });

                            res.on("end", async () => {

                                const worlds = JSON.parse(worldsBody);

                                if (worlds.length === 3) {
                                    matchJSON.worlds.red = worlds[0];
                                    matchJSON.worlds.blue = worlds[1];
                                    matchJSON.worlds.green = worlds[2];
                                }

                                await producer.send({
                                    topic: topicName,
                                    messages: [
                                        {
                                            value : JSON.stringify(matchJSON)
                                        }
                                    ]
                                });
                            });

                        });
                    } catch (error) {
                        console.error(error.message);
                    }
                });

            } catch (exception) {
                console.log('error ' + exception);
            }
        });
    });
}

/*cron job calls every half minute the callApi function*/
cron.schedule('*/30 * * * * *', function() {
    callAPI();
});

server.listen(3000, '141.28.73.146');