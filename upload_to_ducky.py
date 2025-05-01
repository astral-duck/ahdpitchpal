import os
from duckyai import DuckyAI

# Ducky.ai API key and index name
API_KEY = "c859dd98-7aef-41ad-a7ed-d97501c34760"
INDEX_NAME = "knowledge"
KNOWLEDGE_DIR = r"c:\ahdpitchpal\knowledge"

client = DuckyAI(api_key=API_KEY)

def load_txt_files(folder):
    docs = []
    for filename in os.listdir(folder):
        if filename.endswith('.txt'):
            path = os.path.join(folder, filename)
            with open(path, encoding='utf-8') as f:
                content = f.read()
            title = os.path.splitext(filename)[0]
            docs.append({
                "index_name": INDEX_NAME,
                "content": content,
                "title": title,
                "source_document_id": filename,
                "metadata": {"source": "AHD", "filename": filename}
            })
    return docs

def batch_upload(docs):
    # Ducky batch upload limit is 100 docs per call
    for i in range(0, len(docs), 100):
        batch = docs[i:i+100]
        client.documents.batch_index(documents=batch)
        print(f"Uploaded {len(batch)} documents.")

if __name__ == "__main__":
    docs = load_txt_files(KNOWLEDGE_DIR)
    batch_upload(docs)
    print("All files uploaded to Ducky.ai.")
