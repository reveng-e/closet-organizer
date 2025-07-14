from pymongo import MongoClient
connection_string = 'mongodb+srv://riddhi:<Jaden*0409>@closet.mk9xkpg.mongodb.net/?retryWrites=true&w=majority&appName=Closet'
client = MongoClient(connection_string)
db = client['closet'] 

