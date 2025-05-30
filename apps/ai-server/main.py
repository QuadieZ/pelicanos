import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI()

# Get the absolute path to the model file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "..", "packages", "models", "model.pkl")
preprocessor_path = os.path.join(current_dir, "..", "..", "packages", "models", "preprocessor_numpy1.pkl")

# Load the model and preprocessor
model = joblib.load(model_path)
preprocessor = joblib.load(preprocessor_path)

class PredictionInput(BaseModel):
    distribution_channel_code: str
    channel_id: str
    net_price: float
    cost_price_x: float
    cost_price_y: float
    retail_price: float
    color_group: str
    listing_price: float
    gender: str
    product_group: str
    detail_product_group: str
    shoe_product: str
    size_group: str
    size: str
    age_group: str
    activity_group: str
    lifestyle_group: str
    launch_season: str
    brand_name: str
    discount: float

class Product(BaseModel):
    distribution_channel_code: str
    channel_id: str
    cost_price_x: float
    cost_price_y: float
    retail_price: float
    color_group: str
    listing_price: float
    gender: str
    product_group: str
    detail_product_group: str
    shoe_product: str
    size_group: str
    size: str
    age_group: str
    activity_group: str
    lifestyle_group: str
    launch_season: str
    brand_name: str
    discount: float

@app.post("/predict")
def predict(input_data: PredictionInput):
    df = pd.DataFrame([input_data.dict()])
    df = preprocessor.transform(df)
    prediction = model.predict(df)
    return {"predicted_sold_quantity": float(prediction[0])}

@app.post('/predict-range')
def predict_range(input_data: Product, start_price: float, end_price: float):
    result = {}
    for price in range(start_price, end_price, 50):
        input_data.net_price = price
        df = pd.DataFrame([input_data.dict()])
        df = preprocessor.transform(df)
        prediction = model.predict(df)
        result[price] = {
            "demand": float(prediction[0]),
            "price": price,
            "revenue": float(prediction[0]) * price
        }
    max_revenue = max(result.items(), key=lambda x: x[1]["revenue"])
    result["optimal_price"] = {
        "price": max_revenue[0],
        "demand": max_revenue[1]["demand"],
        "revenue": max_revenue[1]["revenue"]
    }
    
    return result["optimal_price"]