import os

print("=== Oracle Environment Variables ===")
oracle_vars = ['ORACLE_HOST', 'ORACLE_PORT', 'ORACLE_SERVICE_NAME', 'ORACLE_USERNAME', 'ORACLE_PASSWORD']
for var in oracle_vars:
    value = os.environ.get(var, 'NOT SET')
    print(f"{var}: {value}")

print(f"\n=== Building Connection String ===")

# Let's manually build the connection string to see what's wrong
host = os.environ.get('ORACLE_HOST', 'localhost')
port = os.environ.get('ORACLE_PORT', '1521')
service_name = os.environ.get('ORACLE_SERVICE_NAME', 'XE')
username = os.environ.get('ORACLE_USERNAME', 'system')
password = os.environ.get('ORACLE_PASSWORD', 'password')

print(f"Host: '{host}' (type: {type(host)})")
print(f"Port: '{port}' (type: {type(port)})")
print(f"Service: '{service_name}' (type: {type(service_name)})")
print(f"Username: '{username}' (type: {type(username)})")
print(f"Password: {'*' * len(password) if password != 'NOT SET' else 'NOT SET'}")

# Build connection string
oracle_connection_string = f"oracle+cx_oracle://{username}:{password}@{host}:{port}/{service_name}"
print(f"\nManual connection string: {oracle_connection_string}")