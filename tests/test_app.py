from fastapi.testclient import TestClient
import pytest

from src.app import app, activities


@pytest.fixture(autouse=True)
def reset_activities():
    # Make a shallow copy of participants lists to restore after each test
    original = {k: v["participants"][:] for k, v in activities.items()}
    yield
    for k, v in original.items():
        activities[k]["participants"] = v


def test_get_activities_contains_expected_keys():
    client = TestClient(app)
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    client = TestClient(app)
    activity = "Chess Club"
    email = "testuser+signup@example.com"

    # Ensure email not present initially
    resp = client.get("/activities")
    assert resp.status_code == 200
    assert email not in resp.json()[activity]["participants"]

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert "Signed up" in resp.json().get("message", "")

    # Now email should be present
    resp = client.get("/activities")
    assert email in resp.json()[activity]["participants"]

    # Duplicate signup should return 400
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 400

    # Unregister
    resp = client.delete(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert "Unregistered" in resp.json().get("message", "")

    # Now email should be gone
    resp = client.get("/activities")
    assert email not in resp.json()[activity]["participants"]

    # Unregistering again should return 404
    resp = client.delete(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 404
