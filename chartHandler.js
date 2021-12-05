let scores = [0,0,0];
let currentScoreSum = 0;
let myChart;
let ctx;

window.onload = async () => {
    ctx = document.getElementById('scoresChart');
    buildChart();
    fetchVictoryPointsFromAPI();
}

async function fetchVictoryPointsFromAPI() {
    let socket = new io();
    socket.emit('connected', 'scores');
    socket.on('sentscores', (msg) => {
        let json = JSON.parse(msg);
        let newScores = [json.scores.red, json.scores.blue, json.scores.green];
        let newsScoreSum = newScores[0] + newScores[1] + newScores[2];

        if(newsScoreSum !== currentScoreSum) {
            console.log(json.scores)

            scores = newScores;
            currentScoreSum = newsScoreSum;

            myChart.destroy();
            buildChart();
            myChart.update();
        }
    });
}

function buildChart() {
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Green'],
            datasets: [{
                label: 'scores by teams',
                data: scores,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(10, 206, 10, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(10, 206, 10, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}