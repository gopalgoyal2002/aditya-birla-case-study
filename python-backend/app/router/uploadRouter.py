from datetime import datetime, timedelta, timezone
from typing import Union,List
from fastapi import APIRouter
from typing_extensions import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from app.controller.upload import get_presigned_url,get_presigned_url_for_download ,delete_document, get_all_document,call_indexing_lambda
from app.router.authRouter import User,get_current_active_user
from app.config import INDEXING_LAMBDA_URL
import json
from threading import Thread
import requests
from json import dumps


router = APIRouter()
    
def invoke_lambda_function(lambda_url, params):
    headers = {
        'Content-Type': 'application/json',
    }

    response = requests.post(lambda_url, headers=headers, data=dumps(params))

    return True

@router.post("/initiate-upload")
async def initiate_upload(
    file_names: List[str],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    try:
        result=[]
        for i in file_names:
            url_dict=get_presigned_url(i)
            result.append(url_dict)
        return {"status":200,"message":"success","data":result}
    except:
        return {"status":400,"message":"Server Error"}

@router.post("/complete-upload")
async def complete_upload(
    file_names: List[str],
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    
    try:
        res=call_indexing_lambda(file_names)
        return {"status":200,"message":"Processing Started"}
    except Exception as err:
        return {"status":400,"message":err}


@router.post("/delete-document")
async def complete_upload(
    file_name: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    try:
        res=delete_document(file_name=file_name)
        return {"status":200,"message":"success","data":res}
    except Exception as err:
        return {"status":400,"message":err}

@router.post("/download-document")
async def download_document(
    file_name: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    try:
        res=get_presigned_url_for_download(doc_name=file_name)
        return {"status":200,"message":"success","data":res}
    except Exception as err:
        return {"status":400,"message":err}
    
@router.post("/getalldocument")
async def get_all_docs(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    try:
        res=get_all_document()
        return {"status":200,"message":"success","data":res}
    except Exception as err:
        return {"status":400,"message":err}
   