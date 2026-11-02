import sys, os
sys.path.insert(0, r"C:\Users\MiraTymz\Documents\web-version\backend")
from app.db.base import Base
from app.db.session import engine
import app.models
Base.metadata.create_all(bind=engine)
print("ALL_TABLES_CREATED_SUCCESSFULLY")
