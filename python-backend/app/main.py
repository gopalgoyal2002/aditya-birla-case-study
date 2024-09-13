import logging
import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.router.router import router as api_router
from mangum import Mangum
logging.basicConfig(format="%(asctime)s %(message)s", datefmt="%m/%d/%Y %I:%M:%S %p")
logger = logging.getLogger(__name__)


def get_application() -> FastAPI:
    application = FastAPI(title="ADITYA-BIRLA-CASE-STUDY", debug=True, version="1.0")

    origins = [
        "*","http://localhost:3000"
    ]

    application.add_middleware(
        CORSMiddleware,
       
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        
    )
    application.include_router(api_router)
    return application


app = get_application()
handler = Mangum(app, lifespan="off")
# if __name__ == "__main__":
#   uvicorn.run(app, host="0.0.0.0", port=8000)