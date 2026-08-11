from app.agents.base_agent import BaseAgent
from app.db.session import SessionLocal
from app.services import report_service
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

class PlanningAgent(BaseAgent):
    def run(self, state: dict) -> dict:
        context = state.get("context", {})
        project_id = context.get("project_id")
        
        if not project_id:
            return {"result": "Please provide a project_id to plan the sprint."}
        
        db = SessionLocal()
        try:
            # Internal service se daily summary lo
            summary = report_service.generate_daily_summary(db, project_id)
            
            # Groq AI initialize karo
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                api_key=settings.GROQ_API_KEY,
                temperature=0.5
            )
            
            # Prompt banao
            system_prompt = SystemMessage(
                content="You are a Technical Project Manager. Suggest the next Sprint Goal."
            )
            user_prompt = HumanMessage(
                content=f"""
                Project Name: {summary['project_name']}
                Completed: {summary['completed']} / {summary['total_tasks']}
                Blocked: {summary['blocked']}
                
                Suggest 1 specific Sprint Goal for the next iteration.
                """
            )
            
            response = llm.invoke([system_prompt, user_prompt])
            return {"result": response.content, "data": summary}
        finally:
            db.close()