import requests
import sys
import time

BASE_URL = "http://localhost:8008"

def test():
    print("1. Registering user...")
    res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": f"test_{int(time.time())}@test.com",
        "password": "password123"
    })
    
    if res.status_code != 200:
        print(f"Register failed: {res.text}")
        return
        
    print("Register OK")
    
    email = res.json()["user"]["email"]
    
    print("2. Logging in...")
    res = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": email,
        "password": "password123"
    })
    
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
        
    print("Login OK")
    token = res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("3. Fetching /me...")
    res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Profile: {res.json()}")
    
    print("4. Fetching /jobs...")
    res = requests.get(f"{BASE_URL}/jobs", headers=headers)
    print(f"Jobs status: {res.status_code}")
    jobs_data = res.json()
    print(f"Jobs found: {jobs_data.get('total', 0)}")
    
    print("5. Testing Rate Limiter on /refresh...")
    for i in range(7):
        res = requests.post(f"{BASE_URL}/refresh", headers=headers)
        print(f"Attempt {i+1} status: {res.status_code}")
        if res.status_code == 429:
            print("Rate limit working correctly!")
            break

if __name__ == "__main__":
    try:
        test()
    except Exception as e:
        print(f"Test failed: {e}")
