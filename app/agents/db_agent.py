from app.agents.base_agent import BaseAgent
from app.db.session import SessionLocal
from app.services import project_service, task_service, user_service
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

class DatabaseQueryAgent(BaseAgent):
    def run(self, state: dict) -> dict:
        query = state.get("query", "").lower()
        context = state.get("context", {})
        project_id = context.get("project_id")
        
        if not project_id:
            return {"result": "Please provide a project_id to query."}
        
        db = SessionLocal()
        try:
            # 1. Fetch Project
            project = project_service.get_project(db, project_id)
            if not project:
                return {"result": f"Project with ID {project_id} not found."}
            
            # 2. Fetch All Users
            all_users = user_service.get_users(db)
            user_map = {u.name.lower(): u.id for u in all_users}
            reverse_user_map = {u.id: u.name for u in all_users}
            
            # 3. Detect if query mentions a specific user
            mentioned_user_id = None
            mentioned_user_name = None
            
            for name, uid in user_map.items():
                if name in query:
                    mentioned_user_id = uid
                    mentioned_user_name = name.title()
                    break
            
            # 4. Fetch Tasks
            all_tasks = task_service.get_tasks_by_project(db, project_id)
            
            if mentioned_user_id is not None:
                tasks = [t for t in all_tasks if t.assigned_to == mentioned_user_id]
                user_obj = db.query(User).filter(User.id == mentioned_user_id).first()
                if user_obj:
                    mentioned_user_name = user_obj.name
                else:
                    mentioned_user_name = "Unknown User"
            else:
                tasks = all_tasks
                mentioned_user_name = None
            
            task_count = len(tasks)
            
            # 5. Build Structured Data
            response_text = ""
            response_text += f"📁 **Project Name:** {project.name}\n"
            
            if mentioned_user_name:
                response_text += f"👤 **Filtering tasks for:** {mentioned_user_name}\n"
            
            response_text += f"\n📋 **Total Tasks (Filtered):** {task_count}\n"
            
            # Status Breakdown
            status_counts = {}
            for t in tasks:
                status_counts[t.status] = status_counts.get(t.status, 0) + 1
            
            if status_counts:
                response_text += "📊 **Status Breakdown:**\n"
                emoji_map = {"todo": "📝", "in_progress": "🔄", "review": "👀", "done": "✅", "blocked": "🚫"}
                for status, count in status_counts.items():
                    emoji = emoji_map.get(status, "📋")
                    response_text += f"   {emoji} {status}: {count}\n"
            
            # ============================================================
            # 🆕 ALWAYS SHOW TASK LIST (Jab bhi user poochhe)
            # ============================================================
            if tasks:
                response_text += f"\n📋 **Task List ({task_count} tasks):**\n"
                for t in tasks:
                    emoji = emoji_map.get(t.status, "📋")
                    assignee_name = reverse_user_map.get(t.assigned_to, "Unassigned")
                    response_text += f"   {emoji} **{t.title}** (ID: {t.id}) - {t.status} | 👤 {assignee_name}\n"
            else:
                response_text += "\n📭 No tasks found for this user in this project.\n"
            
            # 6. LLM Paraphrasing with Roman Urdu support
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                api_key=settings.GROQ_API_KEY,
                temperature=0.3
            )

            # 🆕 Check if query contains Urdu/Roman Urdu
            def is_urdu_query(text: str) -> bool:
                urdu_patterns = ['hai', 'hain', 'ka', 'ki', 'ko', 'se', 'mein', 'main', 'aur', 'or', 'ho', 'tha', 'thi', 'nahi', 'karo', 'kya', 'kitne', 'konsa', 'kahan', 'kaun', 'kisko', 'hian']
                words = text.lower().split()
                for word in words:
                    if word in urdu_patterns or any(ord(c) > 127 for c in word):
                        return True
                return False

            language_instruction = "Respond in Roman Urdu (Urdu written in English script) with a friendly, conversational tone. Use simple words." if is_urdu_query(state['query']) else "Respond in English with a professional tone."

            system_prompt = SystemMessage(
                content=f"""You are a helpful database assistant. 
                **CRITICAL RULES:**
                1. Only use the exact names and data provided in the 'Raw Data' section.
                2. Do NOT invent or assume any user names, task names, or numbers that are not present.
                3. {language_instruction}
                4. Keep the answer concise, friendly, and conversational.
                5. If the user asks for task names, include them clearly.
                """
            )
            
            user_prompt = HumanMessage(
                content=f"""
                User asked: {state['query']}
                
                Raw Data:
                {response_text}
                
                Generate a natural, friendly response based ONLY on the data above.
                """
            )
            
            response = llm.invoke([system_prompt, user_prompt])
            return {"result": response.content}
            
        finally:
            db.close()