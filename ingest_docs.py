import os
from app.services.rag_service import rag_service

def main():
    print("Starting document ingestion process...")
    
    # Check if DOCS_DIR exists, if not, it will be created by the service
    DOCS_DIR = os.path.join(os.path.dirname(__file__), "data", "docs")
    
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR, exist_ok=True)
        print(f"📁 Created directory: {DOCS_DIR}")
        print("⚠️ Ye folder abhi khali hai. Kripya apni real industry/project files (.txt, .pdf) is folder mein rakhein aur phir ye script dobara run karein.")
        return
    
    # Check if there are actually files in the directory
    files = os.listdir(DOCS_DIR)
    if not files:
        print("⚠️ Aapke data/docs/ folder mein koi files nahi hain. Apni real project files wahan rakhein aur dobara koshish karein.")
        return
    
    # Run the ingestion
    success = rag_service.ingest_documents()
    
    if success:
        print("\n✅ Success! All documents have been processed and stored in the FAISS vector database.")
        print("You can now ask the AI Project Manager questions about your documents!")
    else:
        print("\n⚠️ Ingestion could not complete. Make sure you have documents in the data/docs/ folder.")

if __name__ == "__main__":
    main()
