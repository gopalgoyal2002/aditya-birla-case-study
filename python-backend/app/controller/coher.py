from typing import Optional, List, Dict, Any, Tuple, Union, Callable
import cohere


class CohereRanker():
    outgoing_edges = 1
    def __init__(self,api_key:str="",top_n:int=3,model:str='rerank-multilingual-v2.0'):
        self.client = cohere.Client(api_key)
        self.top_n=top_n
        self.model=model
    def run(
        self,
        query: Optional[str] = None,
        top_n: Optional[int]=None,
        documents: List[Dict] = None,
        **kwargs
        )->List[str]:
        text_docs=[]

        rerank_hits = self.client.rerank(query=query,
                        documents=documents, top_n=top_n, model=self.model)


        final_documents=[]
        for i in rerank_hits.results:
            final_documents.append(documents[i.index])
        

        return {"query": query, "documents": final_documents}
