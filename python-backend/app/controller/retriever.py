from pinecone import Pinecone
from app.config import PINECODNE_INDEX,PINECONE_API_KEY,SAGEMAKER_ACCESS_KEY,SAGEMAKER_REGION,SAGEMAKER_SECRET_KEY,SAGEMAKER_ENDPOINT_NAME,COHER_API_KEY
from app.controller.sagemaker import SageMakerApi
from app.controller.coher import CohereRanker
from app.controller.openAi import generate_answer


pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECODNE_INDEX)
sagemaker_object=SageMakerApi(access_key=SAGEMAKER_ACCESS_KEY,secret_key=SAGEMAKER_SECRET_KEY,region=SAGEMAKER_REGION)
coher_object=CohereRanker(api_key=COHER_API_KEY)


def search(query:str,topk:int):
    
    embadding=sagemaker_object.feature_extraction_single(text=query,endpoint_name=SAGEMAKER_ENDPOINT_NAME)
    data=index.query(
    namespace="ns1",
    vector=embadding,
    top_k=topk,
    include_values=True,
    include_metadata=True,
    )
    res=[]
    for i in data['matches']:
        res.append({"text":i['metadata']['text'],"page_no":i['metadata']['page'],"doc_name":i['metadata']['doc_name']})
    ranked_documents=coher_object.run(query=query,top_n=topk,documents=res)
    return ranked_documents

def generative_search(query:str):
    
    embadding=sagemaker_object.feature_extraction_single(text=query,endpoint_name=SAGEMAKER_ENDPOINT_NAME)
    data=index.query(
    namespace="ns1",
    vector=embadding,
    top_k=5,
    include_values=True,
    include_metadata=True,
    )
    res=[]
    for i in data['matches']:
        res.append({"text":i['metadata']['text'],"page_no":i['metadata']['page'],"doc_name":i['metadata']['doc_name']})
    ranked_documents=coher_object.run(query=query,top_n=1,documents=res)
    print(ranked_documents['documents'][0])
    response=generate_answer(query=query,doc_text=ranked_documents['documents'][0]["text"])
    return {"answer":response,"context":ranked_documents['documents'][0]["text"],"page_no":ranked_documents['documents'][0]['page_no'],"doc_name":ranked_documents['documents'][0]['doc_name']}

