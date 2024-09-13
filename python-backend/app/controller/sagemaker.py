import boto3
from botocore.config import Config
import json

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