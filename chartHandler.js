let victoryPoints = [0,0,0];
let currentVictorySum = 0;
let myChart;
let ctx;

window.onload = async () => {
    ctx = document.getElementById('victoryPointsChart');
    buildChart();
    fetchVictoryPointsFromAPI();
}

async function fetchVictoryPointsFromAPI() {
    let socket = new io();
    socket.emit('connected', 'victoryPoints');
    socket.on('victoryPoints', (msg) => {
        let json = JSON.parse(msg);
        let newVictoryPoints = [json.victory_points.blue, json.victory_points.red, json.victory_points.green];
        let newVictorySum = newVictoryPoints[0] + newVictoryPoints[1] + newVictoryPoints[2];

        if(newVictorySum !== currentVictorySum) {
            console.log(json.victory_points)

            victoryPoints = newVictoryPoints;
            currentVictorySum = newVictorySum;

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
                label: 'Victory-points by teams',
                data: victoryPoints,
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