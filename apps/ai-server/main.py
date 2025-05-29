from fastapi import FastAPI

app = FastAPI()

@app.get("/predict")
def predict():
    return {"price": 123.45}
