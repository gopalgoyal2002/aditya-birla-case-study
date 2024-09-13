import boto3
import os
from app.config import AWS_ACCESS_KEY,AWS_SECRET_KEY,AWS_REGION,S3_BUCKET_NAME,MONGODB_URL,MONGO_DB_NAME
from app.config import PINECODNE_INDEX,PINECONE_API_KEY
from app.config import LAMBDA_ACCESS_KEY,LAMBDA_SECRET_KEY,LAMBDA_REGION
from datetime import datetime
from pinecone import Pinecone
import pymongo
import json
mongo_client = pymongo.MongoClient(MONGODB_URL)
mongo_collection = mongo_client[MONGO_DB_NAME]
mongo_db = mongo_collection["rag_document"]


pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECODNE_INDEX)

def get_presigned_url_for_download(doc_name):
    session = boto3.Session(
            region_name=LAMBDA_REGION,
    aws_access_key_id=LAMBDA_ACCESS_KEY,
    aws_secret_access_key=LAMBDA_SECRET_KEY,
        )
    s3_client = session.client("s3",
                        config=boto3.session.Config(signature_version="s3v4"),
                        region_name=LAMBDA_REGION)
    # s3_client = get_s3_client()
    client_method = "get_object"
    file_path = doc_name
    method_parameters = {"Bucket": S3_BUCKET_NAME, "Key": file_path}
    expires_in = 60000
    url , path = None , None
    try:
        url = s3_client.generate_presigned_url(
            ClientMethod=client_method, Params=method_parameters, ExpiresIn=expires_in
        )
        path = 's3://' + S3_BUCKET_NAME + '/' + file_path
    except :
        "ERROR OCCURE"
    return {"url":url , "path":path}

def get_presigned_url(doc_name):
    mongo_db.insert_one({"doc_name":doc_name,"status":"uploaded","uploaded_at":str(datetime.now())})
    session = boto3.Session(
            region_name=LAMBDA_REGION,
    aws_access_key_id=LAMBDA_ACCESS_KEY,
    aws_secret_access_key=LAMBDA_SECRET_KEY,
        )
    s3_client = session.client("s3",
                        config=boto3.session.Config(signature_version="s3v4"),
                        region_name=LAMBDA_REGION)
    # s3_client = get_s3_client()
    client_method = "put_object"
    file_path = doc_name
    method_parameters = {"Bucket": S3_BUCKET_NAME, "Key": file_path}
    expires_in = 60000
    url , path = None , None
    try:
        url = s3_client.generate_presigned_url(
            ClientMethod=client_method, Params=method_parameters, ExpiresIn=expires_in
        )
        path = 's3://' + S3_BUCKET_NAME + '/' + file_path
    except :
        "ERROR OCCURE"
    return {"url":url , "path":path}



def delete_document(file_name:str):
    cur=mongo_db.find({"doc_name":file_name})
    ids=[]
    res={'doc_name':cur[0]['doc_name'],'data':cur[0]['data']}
    for i in res['data']:
        ids.append(i['id'])
   
    mongo_db.delete_one({"doc_name":file_name})
    try:
        index.delete(ids=ids, namespace='ns1')
    except Exception as err:
        print("error occure while delete vectors",err)
    return ids

def get_all_document():
    cur=mongo_db.find()
    res=[]
   
    # res={'doc_name':cur[0]['doc_name'],'data':cur[0]['data']}
    for i in cur:
        try:
            res.append({'doc_name':i['doc_name'],'uploaded_at':i['uploaded_at'],'status':i['status']})
        except:
            pass
   
    return res

def call_indexing_lambda(doc_list):
    lam = boto3.client('lambda',region_name=LAMBDA_REGION,
    aws_access_key_id=LAMBDA_ACCESS_KEY,
    aws_secret_access_key=LAMBDA_SECRET_KEY,)
    for i in doc_list:
        myquery = { "doc_name":i }
        newvalues = { "$set": { "status": "processing" } }
        mongo_db.update_one(myquery, newvalues)
        lam.invoke_async(
            FunctionName="indexing-lambda",
            InvokeArgs=json.dumps({"file_path":i})
        )
    return True
    
