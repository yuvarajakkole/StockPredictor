let stockChart;
let currentData = null;

Chart.register(ChartFinancial.CandlestickController, ChartFinancial.CandlestickElement);

function fetchPrediction(symbol) {
    console.log('Fetching data for symbol:', symbol); // Debug log
    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `symbol=${symbol}`
    })
    .then(response => {
        console.log('Response status:', response.status); // Debug log
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Debug log
        if (data.error) {
            alert(data.error);
            return;
        }
        currentData = data;
        document.getElementById('current-price').innerText = `Current Price: ₹${data.current_price.toFixed(2)}`;
        updateChart(data);
    })
    .catch(error => console.error('Fetch error:', error));
}

function updateChart(data) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    const chartType = document.getElementById('chart-type').value;
    
    if (stockChart) stockChart.destroy();

    console.log('Rendering chart type:', chartType); // Debug log

    if (chartType === 'line') {
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.prediction_dates,
                datasets: [
                    {
                        label: 'Historical Close',
                        data: data.historical_ohlc.close.concat(Array(30).fill(null)),
                        borderColor: '#3498db',
                        fill: false
                    },
                    {
                        label: 'Predicted Prices',
                        data: data.predicted,
                        borderColor: '#e74c3c',
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Price (INR)' } }
                }
            }
        });
    } else if (chartType === 'candlestick') {
        const candlestickData = data.dates.map((date, i) => ({
            x: date,
            o: data.historical_ohlc.open[i],
            h: data.historical_ohlc.high[i],
            l: data.historical_ohlc.low[i],
            c: data.historical_ohlc.close[i]
        }));

        stockChart = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'Historical OHLC',
                    data: candlestickData,
                    color: {
                        up: '#2ecc71',
                        down: '#e74c3c',
                        unchanged: '#95a5a6'
                    }
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Price (INR)' } }
                }
            }
        });
    } else if (chartType === 'bar') {
        stockChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.dates,
                datasets: [{
                    label: 'Historical Close',
                    data: data.historical_ohlc.close,
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Price (INR)' } }
                }
            }
        });
    }
}

function updateChartFromSelection() {
    if (currentData) {
        updateChart(currentData);
    }
}