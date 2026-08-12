import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

DOCS_DIR = os.path.join(os.path.dirname(__file__), "../../data/docs")
FAISS_INDEX_DIR = os.path.join(os.path.dirname(__file__), "../../data/faiss_index")

class RagService:
    def __init__(self):
        # Default embedding model (runs locally, free, good for general tasks)
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None

        if os.path.exists(FAISS_INDEX_DIR) and os.path.exists(os.path.join(FAISS_INDEX_DIR, "index.faiss")):
            self.load_index()
    
    def load_index(self):
        """Load the FAISS index from disk."""
        print(f"Loading FAISS index from {FAISS_INDEX_DIR}...")
        self.vector_store = FAISS.load_local(FAISS_INDEX_DIR, self.embeddings, allow_dangerous_deserialization=True)

    def ingest_documents(self):
        """Read documents from DOCS_DIR, split them, and store in FAISS."""
        if not os.path.exists(DOCS_DIR):
            os.makedirs(DOCS_DIR)
            print(f"Created {DOCS_DIR}. Please add some documents there.")
            return False

        print(f"Loading documents from {DOCS_DIR}...")
        
        # For this basic setup, load all txt and pdf files.
        loaders = [
            DirectoryLoader(DOCS_DIR, glob="**/*.txt", loader_cls=TextLoader),
            DirectoryLoader(DOCS_DIR, glob="**/*.pdf", loader_cls=PyPDFLoader)
        ]
        
        docs = []
        for loader in loaders:
            try:
                docs.extend(loader.load())
            except Exception as e:
                print(f"Error loading files: {e}")

        if not docs:
            print("No documents found to ingest.")
            return False

        print(f"Loaded {len(docs)} documents. Splitting into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = text_splitter.split_documents(docs)

        print(f"Generated {len(chunks)} chunks. Creating vector store...")
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)

        print(f"Saving vector store to {FAISS_INDEX_DIR}...")
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
        self.vector_store.save_local(FAISS_INDEX_DIR)
        print("Ingestion complete!")
        return True

    def get_retriever(self, k=3):
        """Return the retriever interface for the vector store."""
        if not self.vector_store:
            raise ValueError("Vector store not initialized. Please run ingestion first.")
        return self.vector_store.as_retriever(search_kwargs={"k": k})

rag_service = RagService()
