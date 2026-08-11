import streamlit as st
import requests
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime

# =========================================
# 1. PAGE CONFIG & CUSTOM CSS (PRO THEME)
# =========================================
st.set_page_config(
    page_title="AI Project Manager",
    page_icon="🚀",
    layout="wide"
)

# 🎨 MAGIC CSS: Is se Streamlit Dash jaisa lagne lagega
st.markdown("""
<style>
    /* Main background */
    .stApp {
        background-color: #0e1117;
    }
    /* Cards style */
    .css-1r6slb0, .stMetric, div[data-testid="stMetric"] {
        background-color: #1e1e2f !important;
        border-radius: 12px !important;
        padding: 15px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
        border: 1px solid #333 !important;
    }
    /* Headers */
    h1, h2, h3, .stMarkdown h1, .stMarkdown h2 {
        color: #00d2ff !important;
        font-weight: 600 !important;
    }
    /* Metric Text */
    div[data-testid="stMetricValue"] {
        color: #ffffff !important;
        font-size: 2.2rem !important;
        font-weight: bold !important;
    }
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #00d2ff, #3a7bd5) !important;
        color: white !important;
        border: none !important;
        border-radius: 25px !important;
        padding: 0.5rem 2rem !important;
        font-weight: bold !important;
        box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3) !important;
        transition: 0.3s !important;
    }
    .stButton > button:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(0, 210, 255, 0.5) !important;
    }
    /* Hide default Streamlit footer/menu */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    /* Sidebar */
    .css-1d391kg, .css-12oz5g7 {
        background-color: #1a1a2e !important;
    }
    /* Expander */
    .streamlit-expanderHeader {
        background-color: #262730 !important;
        border-radius: 10px !important;
    }
    /* Warning/Success Boxes */
    .stAlert {
        border-radius: 12px !important;
        border-left: 5px solid #00d2ff !important;
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("🚀 Autonomous AI Project Manager")
st.markdown("*Your AI Co-Pilot for Engineering Management*")

# Sidebar
with st.sidebar:
    st.header("⚙️ Settings")
    api_url = st.text_input("API URL", value="http://127.0.0.1:8000")
    st.divider()
    st.caption("Built with FastAPI + LangGraph + Groq AI")

# =========================================
# 2. DASHBOARD METRICS (ROW 1)
# =========================================
st.subheader("📊 Dashboard")

col1, col2, col3, col4 = st.columns(4)
dashboard_data = {}

# Fetch Data for Dashboard
try:
    response = requests.get(f"{api_url}/api/v1/dashboard/summary")
    if response.status_code == 200:
        dashboard_data = response.json()
except:
    pass

with col1:
    st.metric("📁 Total Projects", dashboard_data.get("total_projects", 0))
with col2:
    st.metric("📋 Total Tasks", dashboard_data.get("total_tasks", 0))
with col3:
    st.metric("✅ Completion Rate", f"{dashboard_data.get('overall_completion_rate', 0)}%")
with col4:
    st.metric("⚠️ High Risk", dashboard_data.get("high_risk_count", 0))

# High Risk Projects List
high_risk = dashboard_data.get("high_risk_projects", [])
if high_risk:
    st.warning(f"⚠️ High Risk Projects: {len(high_risk)}")
    for p in high_risk:
        st.write(f"   🚨 **ID: {p['id']}** - {p['name']} (Risk: {p['risk_percentage']}%)")
else:
    st.success("✅ No high risk projects found! All projects are on track.")

st.divider()

# =========================================
# 3. CHARTS (ROW 2) - DASH STYLE
# =========================================
col_ch1, col_ch2 = st.columns(2)

with col_ch1:
    st.subheader("📊 Workload Distribution")
    try:
        resp = requests.get(f"{api_url}/api/v1/analytics/workload")
        if resp.status_code == 200:
            data = resp.json()
            workload = data.get("workload", [])
            if workload:
                names = [w["user_name"] for w in workload]
                counts = [w["task_count"] for w in workload]
                
                fig = go.Figure(data=[go.Bar(
                    x=names,
                    y=counts,
                    text=[f"{w['percentage']}%" for w in workload],
                    textposition='auto',
                    marker_color=['#00d2ff', '#ff6b6b', '#ffd93d', '#6bcb77'],
                    hovertemplate='%{x}: %{y} tasks (%{text})<extra></extra>'
                )])
                fig.update_layout(
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font_color='#ffffff',
                    height=300,
                    margin=dict(l=40, r=40, t=40, b=40)
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No workload data available.")
    except Exception as e:
        st.warning(f"Workload data not available: {e}")

with col_ch2:
    st.subheader("📈 Task Status Breakdown")
    try:
        # Fetch tasks to calculate status
        # For demo, we'll try to get status counts from tasks/project/1
        # If not, we show dummy
        proj_resp = requests.get(f"{api_url}/api/v1/tasks/project/1")
        if proj_resp.status_code == 200:
            tasks = proj_resp.json()
            status_counts = {"todo": 0, "in_progress": 0, "review": 0, "done": 0, "blocked": 0}
            for t in tasks:
                if t['status'] in status_counts:
                    status_counts[t['status']] += 1
            labels = [k for k, v in status_counts.items() if v > 0]
            values = [v for k, v in status_counts.items() if v > 0]
            
            if labels:
                fig = go.Figure(data=[go.Pie(
                    labels=labels,
                    values=values,
                    marker=dict(colors=['#ffd93d', '#00d2ff', '#6bcb77', '#ff6b6b', '#ff9ff3']),
                    hole=0.4,
                    textinfo='label+percent'
                )])
                fig.update_layout(
                    template='plotly_dark',
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font_color='#ffffff',
                    height=300,
                    margin=dict(l=40, r=40, t=40, b=40)
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No tasks found for status breakdown.")
        else:
            st.info("Connect to backend to see status chart.")
    except Exception as e:
        st.warning(f"Status chart unavailable: {e}")

st.divider()

# =========================================
# 4. EXISTING FEATURES (Projects, Users, Tasks, AI)
# =========================================
col_left, col_mid, col_right = st.columns(3)

# ---------- LEFT: Projects ----------
with col_left:
    st.subheader("📁 Projects")
    with st.expander("➕ Create New Project"):
        proj_name = st.text_input("Project Name", key="p_name")
        proj_desc = st.text_area("Description", key="p_desc")
        proj_end = st.date_input("End Date (Optional)", value=None, key="p_end")
        if st.button("Create Project", key="p_btn"):
            if proj_name:
                payload = {"name": proj_name, "description": proj_desc, "status": "active"}
                if proj_end:
                    payload["end_date"] = proj_end.isoformat()
                r = requests.post(f"{api_url}/api/v1/projects/", json=payload)
                if r.status_code == 201:
                    st.success(f"✅ {proj_name} created!")
                    st.rerun()
    
    # List Projects
    try:
        r = requests.get(f"{api_url}/api/v1/projects/")
        if r.status_code == 200:
            for p in r.json()[:5]:
                st.write(f"• **{p['name']}** (ID: {p['id']})")
    except:
        st.warning("API not connected.")

# ---------- MID: Users ----------
with col_mid:
    st.subheader("👥 Users")
    with st.expander("➕ Create New User"):
        u_name = st.text_input("User Name", key="u_name")
        u_email = st.text_input("Email", key="u_email")
        u_role = st.selectbox("Role", ["engineer", "manager", "devops"], key="u_role")
        if st.button("Create User", key="u_btn"):
            if u_name and u_email:
                r = requests.post(f"{api_url}/api/v1/users/", json={"name": u_name, "email": u_email, "role": u_role})
                if r.status_code == 201:
                    st.success(f"✅ {u_name} created!")
                    st.rerun()
    
    try:
        r = requests.get(f"{api_url}/api/v1/users/")
        if r.status_code == 200:
            for u in r.json():
                st.write(f"• **{u['name']}** ({u['role']})")
    except:
        pass

# ---------- RIGHT: AI Agent ----------
with col_right:
    st.subheader("🤖 AI Agent")
    proj_id = st.number_input("Project ID", min_value=1, value=1, step=1, key="ai_id")
    query = st.text_area("Ask anything:", "Check risk for this project", key="ai_q")
    
    if st.button("Ask AI", type="primary", key="ai_btn"):
        try:
            payload = {"query": query, "project_id": proj_id, "task_id": 0}
            r = requests.post(f"{api_url}/api/v1/agents/query", json=payload)
            if r.status_code == 200:
                st.success("✅ AI Response:")
                st.info(r.json().get("result", "No response"))
            else:
                st.error(f"Error: {r.text}")
        except Exception as e:
            st.error(f"Error: {e}")

st.divider()

# =========================================
# 5. TASK MANAGEMENT
# =========================================
st.subheader("📋 Tasks")
col_t1, col_t2 = st.columns(2)

with col_t1:
    with st.expander("➕ Create New Task"):
        title = st.text_input("Task Title", key="t_title")
        desc = st.text_area("Description", key="t_desc")
        proj = st.number_input("Project ID", min_value=1, value=1, step=1, key="t_proj")
        status = st.selectbox("Status", ["todo", "in_progress", "review", "done", "blocked"], key="t_stat")
        priority = st.slider("Priority", 1, 5, 2, key="t_pri")
        
        # Fetch users for dropdown
        users_map = {0: "Unassigned"}
        try:
            ur = requests.get(f"{api_url}/api/v1/users/")
            if ur.status_code == 200:
                for u in ur.json():
                    users_map[u['id']] = u['name']
        except:
            pass
        assignee = st.selectbox("Assign To", options=list(users_map.keys()), format_func=lambda x: users_map.get(x, "Unknown"), key="t_assign")
        
        if st.button("Create Task", key="t_btn"):
            if title and proj:
                payload = {
                    "title": title, "description": desc, "project_id": proj,
                    "status": status, "priority": priority,
                    "assigned_to": assignee if assignee != 0 else None
                }
                r = requests.post(f"{api_url}/api/v1/tasks/", json=payload)
                if r.status_code == 201:
                    st.success(f"✅ {title} created!")
                    st.rerun()

with col_t2:
    view_proj = st.number_input("View Tasks for Project ID", min_value=1, value=1, step=1, key="v_proj")
    if st.button("🔍 Show Tasks", key="v_btn"):
        try:
            r = requests.get(f"{api_url}/api/v1/tasks/project/{view_proj}")
            if r.status_code == 200:
                tasks = r.json()
                if tasks:
                    for t in tasks:
                        st.write(f"📌 **{t['title']}** (ID: {t['id']}) - {t.get('status', 'N/A')}")
                else:
                    st.info("No tasks found.")
        except:
            st.error("Failed to fetch tasks")

# Footer
st.divider()
st.caption("🔧 Autonomous AI Project Manager | Powered by FastAPI, LangGraph & Groq AI")