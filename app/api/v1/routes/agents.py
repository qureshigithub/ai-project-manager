from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.agents.supervisor import Supervisor

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    project_id: Optional[int] = None
    task_id: Optional[int] = None
    agent_type: Optional[str] = None  # 🆕 Accept agent_type

class QueryResponse(BaseModel):
    result: str

@router.post("/query", response_model=QueryResponse)
def agent_query(request: QueryRequest):
    try:
        supervisor = Supervisor()
        context = {
            "project_id": request.project_id,
            "task_id": request.task_id,
            "forced_agent": request.agent_type  # 🆕 Pass to supervisor
        }
        result = supervisor.run(request.query, context)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))