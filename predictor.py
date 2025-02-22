import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

def fetch_stock_data(symbol):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)
    stock = yf.Ticker(symbol)
    data = stock.history(start=start_date, end=end_date)
    return data[['Open', 'High', 'Low', 'Close']].dropna()

def predict_stock_prices(symbol):
    data = fetch_stock_data(symbol)
    data['Day'] = np.arange(len(data))
    X = data[['Day']]
    y = data['Close']
    model = LinearRegression()
    model.fit(X, y)
    future_days = np.arange(len(data), len(data) + 30).reshape(-1, 1)
    past_pred = model.predict(X)
    future_pred = model.predict(future_days)
    dates = data.index.strftime('%Y-%m-%d').tolist()
    historical_ohlc = {
        'open': data['Open'].tolist(),
        'high': data['High'].tolist(),
        'low': data['Low'].tolist(),
        'close': data['Close'].tolist()
    }
    predicted_prices = np.concatenate([past_pred, future_pred]).tolist()
    prediction_dates = (dates + [(data.index[-1] + timedelta(days=i)).strftime('%Y-%m-%d') 
                                for i in range(1, 31)])
    return {
        'dates': dates,
        'historical_ohlc': historical_ohlc,
        'prediction_dates': prediction_dates,
        'predicted': predicted_prices
    }