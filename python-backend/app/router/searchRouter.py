from datetime import datetime, timedelta, timezone
from typing import Union,List
from fastapi import APIRouter
from typing_extensions import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from app.router.authRouter import User,get_current_active_user
from app.controller.retriever import search,generative_search
import json

router = APIRouter()

@router.post("/search")
async def document_retrival(
    query: str,
    topk:int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    try:
        result= search(query=query,topk=topk)
        return {"status":200,"message":"success","data":result}
    except Exception as err:
        return {"status":400,"message":err}


@router.post("/generative-search")
async def generative_search_(
    query: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    try:
        result= generative_search(query=query)
        return {"status":200,"message":"success","data":result}
    except Exception as err:
        return {"status":400,"message":err}
    return True

