import requests

url = "https://ai-project-manager-opal.vercel.app/api/v1/auth/login"
data = {"username": "admin@ezitech.com", "password": "admin123"}
response = requests.post(url, data=data)

print("STATUS CODE:", response.status_code)
print("RESPONSE TEXT:", response.text)
