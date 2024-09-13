from pydantic import BaseModel



class LoginSchema(BaseModel):
    email:str
    password:str

    class Config:
        schema_extra ={
            "example":{
                "email":"sample@gmail.com",
                "password":"samplepass123"
            }
        }