from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_predict_endpoint():
    response = client.get("/predict")
    assert response.status_code == 200
    assert response.json() == {"price": 123.45} 