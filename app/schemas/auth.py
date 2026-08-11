from pydantic import BaseModel

# Login ke liye user ka data
class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    role: str
    is_admin: bool