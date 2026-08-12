import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from app.agents.base_agent import BaseAgent
from app.services.rag_service import rag_service
from app.core.config import settings

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

class RagAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        # Ensure we have the Groq API key from settings
        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY is not set in environment or .env file.")
            
        self.llm = ChatGroq(api_key=groq_api_key, temperature=0.2, model_name="llama-3.1-8b-instant")
        
        # Setup the prompt template for answering based on context
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an AI Project Manager's documentation assistant. 
Answer the user's question based ONLY on the following context. 
If you don't know the answer based on the context, just say you don't know. 
Do not make up information. Keep your answers clear, professional, and concise.

Context:
{context}"""),
            ("human", "{input}")
        ])

    def run(self, state: dict) -> dict:
        query = state.get("query", "")
        
        try:
            retriever = rag_service.get_retriever(k=4)
            
            # Using Modern LangChain Expression Language (LCEL) 
            # This avoids the older 'langchain.chains' module completely
            rag_chain = (
                {"context": retriever | format_docs, "input": RunnablePassthrough()}
                | self.prompt
                | self.llm
                | StrOutputParser()
            )
            
            # Execute the chain
            answer = rag_chain.invoke(query)
            
            return {
                "result": answer,
                "data": {"context_used": True}
            }
        except ValueError as e:
            return {
                "result": "I am sorry, but the documentation vector store is not initialized. Please ask the administrator to ingest the project documents first.",
                "data": {"error": str(e)}
            }
        except Exception as e:
            return {
                "result": f"An error occurred while retrieving documentation: {str(e)}",
                "data": {"error": str(e)}
            }
