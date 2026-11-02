"""Dashboard router – placeholder for stats and reports.
Provides a simple endpoint that can be expanded later.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/stats", summary="Dashboard stats")
def get_stats():
    return {"message": "Dashboard stats placeholder"}
