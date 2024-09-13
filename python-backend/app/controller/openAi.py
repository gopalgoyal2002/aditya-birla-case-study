
from app.config import OPEN_AI_KEY
import requests
def generate_answer(query:str,doc_text:str):
        """
        """

        headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPEN_AI_KEY}"
        }
        prompt=f"Create an informative and factual answer (no more than 300 words) \
        for a given question based solely on the given context. Use an unbiased and journalistic tone. Do not use any \
        other information sources. Please show bullet points when a list of items are to be shown. Dont repeat the bullet \
        points. Paragraphs should be separated by new line character and paragraphs should not be repeated. \
        Give the answer as fast as possible in a concise manner. Context: {doc_text} \n Question: {query} \n Answer:"
        payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
            "role": "user",
            "content": [
                {
                "type": "text",
                "text": prompt
                }
            ]
            }
        ],
        "max_tokens": 300,
        "temperature":0.1
        }

        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        return response.json()['choices'][0]["message"]['content']