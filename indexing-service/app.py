import traceback
import sys
import time
import boto3
from botocore.config import Config
import json
from typing import List, Optional, Union, Dict, Any, Generator
from pinecone import Pinecone
import nest_asyncio
nest_asyncio.apply()
from llama_parse import LlamaParse
from config import S3_BUCKET_NAME,AWS_SECRET_KEY,AWS_ACCESS_KEY,MONGO_DB_NAME,MONGODB_URL,AWS_REGION,LLAMA_PARSER_API,PINECONE_API_KEY,PINECODNE_INDEX,SAGEMAKER_SECRET_KEY,SAGEMAKER_ACCESS_KEY,SAGEMAKER_REGION
from llama_index.core.schema import TextNode
from pinecone import Pinecone
from copy import deepcopy
from config import MONGODB_URL,MONGO_DB_NAME
import pymongo

mongo_client = pymongo.MongoClient(MONGODB_URL)
mongo_collection = mongo_client[MONGO_DB_NAME]
mongo_db = mongo_collection["rag_document"]

pinecone_obj = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pinecone_obj.Index(PINECODNE_INDEX)
parser = LlamaParse(
    api_key=LLAMA_PARSER_API,  # can also be set in your env as LLAMA_CLOUD_API_KEY
    result_type="text",  # "markdown" and "text" are available
    verbose=True,
)
class SageMakerApi():
    def __init__(
            self,
            access_key: str,
            secret_key:str,
            region:str
    ):
        self.access_key = access_key
        self.secret_key=secret_key
        self.region=region
        self.runtime = boto3.client('sagemaker-runtime',
                       aws_access_key_id=access_key,
                       aws_secret_access_key=secret_key,
                       region_name=region,config=Config(connect_timeout=5, read_timeout=60, retries={'max_attempts': 20}))

    def feature_extraction_single(self, text: str, endpoint_name: str):
        """

        """
        
        # Prepare your input data in the appropriate format for your model
        input_data = {'inputs':[text]}
        # Invoke the endpoint using the `invoke_endpoint` method of the SageMaker runtime client object
        response = self.runtime.invoke_endpoint(EndpointName=endpoint_name,
                                        ContentType='application/json',
                                        Body=json.dumps(input_data))

        # Parse the output data returned by the endpoint
        if(response['ResponseMetadata']['HTTPStatusCode']==200):
            output_data = json.loads(response['Body'].read().decode())
            return output_data['embeddings'][0]
        else:
            return None
        


def get_page_nodes(docs, separator="\n---\n"):
    """Split each document into page node, by separator."""
    nodes = []
    for doc in docs:
        doc_chunks = doc.text.split(separator)
        for doc_chunk in doc_chunks:
            node = TextNode(
                text=doc_chunk,
                metadata=deepcopy(doc.metadata),
            )
            nodes.append(node)

    return nodes

def handler(event, context):
    """

    :param event:
    :param context:
    :return:
    """

    #message = ast.literal_eval(event['Records'][0]['body'])
    print(event)
    message = event
    # message=event

    # print(message)
    try:
        # s3 = boto3.resource('s3', aws_access_key_id=AWS_ACCESS_KEY,
        #                     aws_secret_access_key=AWS_ACCESS_KEY, region_name=AWS_REGION)
        # obj = s3.Object(S3_BUCKET_NAME, message['file_path'])
        # file_object = obj.get()['Body']
        output_path = "/tmp/temp_file.pdf"
        s3_ = boto3.client('s3', region_name='us-east-1')
        s3_.download_file(S3_BUCKET_NAME, message['file_path'], output_path)

        print("Download Successfully")
    except Exception as err:
        print("Download Failed")
        print(err)
        return False
    try:
        documents = parser.load_data(output_path)
        print("doc parsing successfully")
    except Exception as err:
        print("doc parsing unsuccessfully")
        print(err)
        return False
    
    page_nodes = get_page_nodes(documents)
    so=SageMakerApi(access_key=SAGEMAKER_ACCESS_KEY,secret_key=SAGEMAKER_SECRET_KEY,region=SAGEMAKER_REGION)

    vectors=[]
    metadata=[]
    cnt=0
    try:
        for i in page_nodes:
            text_for_embadding=i.text
            emb=so.feature_extraction_single(text=text_for_embadding,endpoint_name='bge-base-en')
            vectors.append({"id":i.id_,"values":emb,"metadata":{"page":cnt,"text":text_for_embadding,"doc_name":message['file_path']}})
            metadata.append({"id":i.id_,"text":text_for_embadding,"page":cnt})
            cnt+=1
        print("embadding done")
    except Exception as err:
            print(err)
            return False
    try:
        pinecone_index.upsert(
        vectors=vectors,
        namespace= "ns1"
        )
        myquery = { "doc_name": message['file_path'] }
        newvalues = { "$set": { "data": metadata,"status":"processed" } }

        mongo_db.update_one(myquery, newvalues)
        # mongo_db.insert_one({"doc_name":message['file_path'],"data":metadata})
        print("INDEXING DONE")
        return True
    
    except Exception as err:
            print(err)
            return False
    

    
