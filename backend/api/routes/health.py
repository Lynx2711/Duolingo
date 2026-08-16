# ==============================================================================
# HEALTH CHECK ENDPOINT (api/routes/health.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Heartbeat Check!
# Cloud hosting providers (e.g. Render) har thodi der me `/health` endpoint par request
# bhejkar confirm karte hain ki backend app online aur responsive hai ya crash ho gaya.
# ==============================================================================

from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="", tags=["Health"])

@router.get("/health", response_model=dict[str, str])
def health_check() -> dict[str, str]:
    """
    Returns: JSON {"status": "ok", "app_name": "Duolingo Clone API"}
    """
    return {
        "status": "ok",
        "app_name": settings.APP_NAME
    }

