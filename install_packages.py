import subprocess
import sys

def install():
    packages = [
        "python-jose[cryptography]", 
        "langchain", 
        "langchain-community", 
        "langchain-core", 
        "faiss-cpu", 
        "sentence-transformers",
        "langchain-text-splitters"
    ]
    
    print("⏳ Installing missing packages... please wait...")
    
    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        
    print("✅ All packages installed successfully!")

if __name__ == "__main__":
    install()
