from fastapi import APIRouter

from app.router import authRouter
from app.router import uploadRouter
from app.router import searchRouter

router=APIRouter()

router.include_router(authRouter.router,tags=["AUTH"])
router.include_router(uploadRouter.router,tags=["Document Management"])
router.include_router(searchRouter.router,tags=["Search Pipeline"])





