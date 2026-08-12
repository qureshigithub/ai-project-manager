from typing import TypedDict
from app.agents.risk_agent import RiskAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.db_agent import DatabaseQueryAgent
from app.agents.rag_agent import RagAgent
from langgraph.graph import StateGraph, END

risk_agent = RiskAgent()
planning_agent = PlanningAgent()
db_agent = DatabaseQueryAgent()
rag_agent = RagAgent()

class AgentState(TypedDict):
    query: str
    context: dict
    next: str
    result: str
    data: dict

def supervisor_node(state: AgentState) -> AgentState:
    query = state["query"].lower()
    context = state.get("context", {})
    
    # 1. Check if user manually selected an agent (forced_agent)
    forced_agent = context.get("forced_agent")
    
    if forced_agent == "risk":
        state["next"] = "risk_agent"
    elif forced_agent == "planning":
        state["next"] = "planning_agent"
    elif forced_agent == "db":
        state["next"] = "db_agent"
    elif forced_agent == "rag":
        state["next"] = "rag_agent"
    else:
        # 2. No forced agent → route based on query keywords (fallback)
        if "risk" in query or "alert" in query or "danger" in query:
            state["next"] = "risk_agent"
        elif "plan" in query or "sprint" in query or "goal" in query:
            state["next"] = "planning_agent"
        elif "document" in query or "doc" in query or "wiki" in query or "requirement" in query or "pdf" in query:
            state["next"] = "rag_agent"
        else:
            state["next"] = "db_agent"
    
    return state

def risk_node(state: AgentState) -> AgentState:
    response = risk_agent.run({"query": state["query"], "context": state["context"]})
    state["result"] = response["result"]
    state["data"] = response.get("data", {})
    state["next"] = "END"
    return state

def planning_node(state: AgentState) -> AgentState:
    response = planning_agent.run({"query": state["query"], "context": state["context"]})
    state["result"] = response["result"]
    state["data"] = response.get("data", {})
    state["next"] = "END"
    return state

def db_node(state: AgentState) -> AgentState:
    response = db_agent.run({"query": state["query"], "context": state["context"]})
    state["result"] = response["result"]
    state["data"] = response.get("data", {})
    state["next"] = "END"
    return state

def rag_node(state: AgentState) -> AgentState:
    response = rag_agent.run({"query": state["query"], "context": state["context"]})
    state["result"] = response["result"]
    state["data"] = response.get("data", {})
    state["next"] = "END"
    return state

def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("risk_agent", risk_node)
    workflow.add_node("planning_agent", planning_node)
    workflow.add_node("db_agent", db_node)
    workflow.add_node("rag_agent", rag_node)
    workflow.set_entry_point("supervisor")
    
    workflow.add_conditional_edges(
        "supervisor",
        lambda state: state["next"],
        {
            "risk_agent": "risk_agent",
            "planning_agent": "planning_agent",
            "db_agent": "db_agent",
            "rag_agent": "rag_agent"
        }
    )
    
    workflow.add_edge("risk_agent", END)
    workflow.add_edge("planning_agent", END)
    workflow.add_edge("db_agent", END)
    workflow.add_edge("rag_agent", END)
    
    return workflow.compile()

class Supervisor:
    def __init__(self):
        self.graph = build_graph()
    
    def run(self, query: str, context: dict = None):
        if context is None:
            context = {}
        initial_state = {
            "query": query,
            "context": context,
            "next": "",
            "result": "",
            "data": {}
        }
        final_state = self.graph.invoke(initial_state)
        return final_state["result"]