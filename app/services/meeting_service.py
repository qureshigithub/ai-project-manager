from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

def generate_meeting_summary(meeting_text: str, meeting_type: str = "general"):
    """
    Groq AI use karke meeting notes ko summarize karo
    """
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.3
    )
    
    system_prompt = SystemMessage(
        content="""You are a professional meeting summarizer. 
        Take the meeting transcript/notes and generate a concise summary with:
        1. Key Discussion Points (3-5 bullet points)
        2. Decisions Made
        3. Action Items (with owners if mentioned)
        4. Next Steps
        Format the response in a clear, professional way."""
    )
    
    user_prompt = HumanMessage(
        content=f"""
        Meeting Type: {meeting_type}
        
        Meeting Notes/Transcript:
        {meeting_text}
        
        Generate a professional meeting summary.
        """
    )
    
    response = llm.invoke([system_prompt, user_prompt])
    return response.content

def generate_quick_summary(meeting_text: str):
    """Short summary (2-3 sentences) - AI Agent ke liye"""
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.3
    )
    
    system_prompt = SystemMessage(
        content="You are a meeting summarizer. Give a brief 2-3 sentence summary."
    )
    
    user_prompt = HumanMessage(
        content=f"Summarize this meeting in 2-3 sentences:\n\n{meeting_text}"
    )
    
    response = llm.invoke([system_prompt, user_prompt])
    return response.content