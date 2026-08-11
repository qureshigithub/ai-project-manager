import os
import sys
from sqlalchemy import create_engine

# Live DB url
URL = "postgresql://neondb_owner:npg_X9eYRiDMol3F@ep-rough-block-axhy5of0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

try:
    engine = create_engine(URL)
    with engine.connect() as conn:
        res = conn.execute("SELECT email, password, is_admin FROM users")
        for row in res:
            print("USER:", dict(row))
        print("Success")
except Exception as e:
    print("Error:", e)
