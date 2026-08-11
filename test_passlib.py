from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    pwd_context.verify("admin123", "$2b$12$12345678901234567890123456789012345678901234567890123")
except Exception as e:
    print("Test 1:", repr(e))

try:
    pwd_context.verify("a"*73, "$2b$12$12345678901234567890123456789012345678901234567890123")
except Exception as e:
    print("Test 2:", repr(e))

try:
    pwd_context.verify("admin123", "a"*73)
except Exception as e:
    print("Test 3:", repr(e))
