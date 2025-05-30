import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI()

# Get the absolute path to the model file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "..", "packages", "models", "model", "lightgbm_model.pkl")
preprocessor_path = os.path.join(current_dir, "..", "..", "packages", "models", "model", "preprocessor.pkl")

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

@app.post("/predict")
def predict(input_data: PredictionInput):
    df = pd.DataFrame([input_data.dict()])
    df = preprocessor.transform(df)
    prediction = model.predict(df)
    return {"predicted_sold_quantity": float(prediction[0])}