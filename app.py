from flask import Flask, render_template, request, jsonify
from predictor import predict_stock_prices
import yfinance as yf

app = Flask(__name__)

STOCK_CATEGORIES = {
    "Down-Falling": {
        "IndusInd Bank": "INDUSINDBK.NS",
        "NTPC": "NTPC.NS",
        "M&M": "M&M.NS",
        "Britannia": "BRITANNIA.NS"
    },
    "Stable": {
        "UltraTech Cement": "ULTRACEMCO.NS",
        "Titan": "TITAN.NS",
        "Cipla": "CIPLA.NS",
        "HCL Tech": "HCLTECH.NS"
    },
    "Most Viewed/Invested": {
        "Reliance": "RELIANCE.NS",
        "TCS": "TCS.NS",
        "HDFC Bank": "HDFCBANK.NS",
        "Infosys": "INFY.NS",
        "Wipro": "WIPRO.NS",
        "ICICI Bank": "ICICIBANK.NS",
        "SBI": "SBIN.NS",
        "Bharti Airtel": "BHARTIARTL.NS",
        "HUL": "HINDUNILVR.NS",
        "Adani Ports": "ADANIPORTS.NS",
        "Tata Motors": "TATAMOTORS.NS",
        "Axis Bank": "AXISBANK.NS",
        "ITC": "ITC.NS",
        "Bajaj Finance": "BAJFINANCE.NS",
        "Maruti Suzuki": "MARUTI.NS",
        "Sun Pharma": "SUNPHARMA.NS",
        "Kotak Mahindra Bank": "KOTAKBANK.NS",
        "L&T": "LT.NS",
        "Asian Paints": "ASIANPAINT.NS",
        "Nestle India": "NESTLEIND.NS",
        "Zomato": "ZOMATO.NS",
        "Jio Financial": "JIOFIN.NS",
        "Adani Enterprises": "ADANIENT.NS",
        "Bajaj Auto": "BAJAJ-AUTO.NS",
        "Tata Steel": "TATASTEEL.NS"
    }
}

@app.route('/')
def index():
    return render_template('index.html', stock_categories=STOCK_CATEGORIES)

@app.route('/predict', methods=['POST'])
def predict():
    symbol = request.form['symbol']
    try:
        data = predict_stock_prices(symbol)
        stock = yf.Ticker(symbol)
        current_price = stock.history(period="1d")['Close'].iloc[-1]
        data['current_price'] = current_price
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)