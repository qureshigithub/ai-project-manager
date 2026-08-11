from app.agents.base_agent import BaseAgent
from app.db.session import SessionLocal
from app.services import report_service
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

class RiskAgent(BaseAgent):
    def run(self, state: dict) -> dict:
        context = state.get("context", {})
        project_id = context.get("project_id")
        
        if not project_id:
            return {"result": "Please provide a project_id to check risk."}
        
        db = SessionLocal()
        try:
            # Internal service se risk data lo
            risk_data = report_service.predict_risk(db, project_id)
            
            # Groq AI initialize karo
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                api_key=settings.GROQ_API_KEY,
                temperature=0.3
            )
            
            # Prompt banao
            system_prompt = SystemMessage(
                content="You are a Senior Project Risk Analyst. Give a concise, actionable alert."
            )
            user_prompt = HumanMessage(
                content=f"""
                Project ID: {project_id}
                Risk Level: {risk_data['risk']}
                Risky Tasks: {risk_data['risky_tasks']} out of {risk_data['total_tasks']}
                
                Give a short alert (2 sentences) and suggest 1 immediate action.
                """
            )
            
            response = llm.invoke([system_prompt, user_prompt])
            return {"result": response.content, "data": risk_data}
        finally:
            db.close()