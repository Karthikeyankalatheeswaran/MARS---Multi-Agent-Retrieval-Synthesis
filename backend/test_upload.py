import requests

url = "http://127.0.0.1:8000/api/upload/"
files = {'file': ('dummy.pdf', b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Size 1 /Root 1 0 R >>\n%%EOF', 'application/pdf')}
data = {'namespace': 'test_namespace'}
response = requests.post(url, files=files, data=data)
print(response.status_code)
print(response.json())
