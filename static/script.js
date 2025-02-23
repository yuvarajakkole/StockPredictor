let stockChart;
let currentData = null;

Chart.register(ChartFinancial.CandlestickController, ChartFinancial.CandlestickElement);

function fetchPrediction(symbol) {
    console.log('Fetching data for symbol:', symbol);
    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `symbol=${symbol}`
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data);
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

    console.log('Rendering chart type:', chartType);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Date', color: '#ffffff' },
                ticks: { color: '#e6e6e6' },
                grid: { color: '#3e4a61' }
            },
            y: {
                title: { display: true, text: 'Price (INR)', color: '#ffffff' },
                ticks: { color: '#e6e6e6' },
                grid: { color: '#3e4a61' }
            }
        },
        plugins: {
            legend: { labels: { color: '#ffffff' } },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: '#2d3748',
                titleColor: '#ffffff',
                bodyColor: '#e6e6e6',
                borderColor: '#8e44ad',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += `₹${context.parsed.y.toFixed(2)}`;
                        } else if (context.parsed.c !== null) {
                            label += `Open: ₹${context.parsed.o.toFixed(2)}, Close: ₹${context.parsed.c.toFixed(2)}`;
                        }
                        return label;
                    }
                }
            }
        },
        hover: {
            mode: 'index',
            intersect: false
        }
    };

    if (chartType === 'line') {
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.prediction_dates,
                datasets: [
                    {
                        label: 'Historical Close',
                        data: data.historical_ohlc.close.concat(Array(30).fill(null)),
                        borderColor: '#f1c40f', // Warm gold
                        borderWidth: 3, // Thicker line
                        fill: false,
                        pointRadius: 0, // No default points
                        pointHoverRadius: 5, // Visible dot on hover
                        pointHoverBackgroundColor: '#f1c40f',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: 'Predicted Prices',
                        data: data.predicted,
                        borderColor: '#8e44ad', // Vivid purple
                        borderWidth: 3, // Thicker line
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#8e44ad',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2
                    }
                ]
            },
            options: chartOptions
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
                        up: '#f1c40f', // Gold for gains
                        down: '#8e44ad', // Purple for losses
                        unchanged: '#e6e6e6'
                    },
                    borderColor: '#ffffff',
                    borderWidth: 2 // Thicker borders
                }]
            },
            options: chartOptions
        });
    } else if (chartType === 'bar') {
        stockChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.dates,
                datasets: [{
                    label: 'Historical Close',
                    data: data.historical_ohlc.close,
                    backgroundColor: '#f1c40f',
                    borderColor: '#ffffff',
                    borderWidth: 2 // Thicker borders
                }]
            },
            options: chartOptions
        });
    }
}

function updateChartFromSelection() {
    if (currentData) {
        updateChart(currentData);
    }
}