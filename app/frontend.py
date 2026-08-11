import streamlit as st
import requests
import json
from datetime import datetime

# Page Config
st.set_page_config(
    page_title="AI Project Manager",
    page_icon="🚀",
    layout="wide"
)

# Title
st.title("🚀 Autonomous AI Project Manager")
st.markdown("*Your AI Co-Pilot for Engineering Management*")

# Sidebar
with st.sidebar:
    st.header("⚙️ Settings")
    api_url = st.text_input("API URL", value="http://127.0.0.1:8000")
    st.divider()
    st.caption("Built with FastAPI + LangGraph + Groq AI")

# Main Layout
col1, col2, col3 = st.columns(3)

# ======================== 1. DASHBOARD ========================
with col1:
    st.subheader("📊 Dashboard")
    if st.button("🔄 Refresh Dashboard"):
        try:
            response = requests.get(f"{api_url}/api/v1/dashboard/summary")
            if response.status_code == 200:
                data = response.json()
                
                st.metric("📁 Total Projects", data.get("total_projects", 0))
                st.metric("📋 Total Tasks", data.get("total_tasks", 0))
                st.metric("✅ Completion Rate", f"{data.get('overall_completion_rate', 0)}%")
                
                high_risk_projects = data.get("high_risk_projects", [])
                high_risk_count = len(high_risk_projects)
                
                if high_risk_count > 0:
                    st.warning(f"⚠️ High Risk Projects: {high_risk_count}")
                    for p in high_risk_projects:
                        st.write(f"   🚨 **ID: {p['id']}** - {p['name']} (Risk: {p['risk_percentage']}%)")
                    st.info("💡 Tip: AI Agent se poochain 'Check risk for these projects'")
                else:
                    st.success("✅ No high risk projects found! All projects are on track.")
            else:
                st.error("Failed to fetch dashboard data")
        except Exception as e:
            st.error(f"Error: {e}")

# ======================== 2. PROJECTS + USERS ========================
with col2:
    st.subheader("📁 Projects")
    
    # --- Create Project ---
    with st.expander("➕ Create New Project"):
        proj_name = st.text_input("Project Name", key="proj_name")
        proj_desc = st.text_area("Description", key="proj_desc")
        proj_end_date = st.date_input("End Date (Optional)", value=None, help="Select project deadline, leave empty if none", key="proj_end")
        
        if st.button("Create Project", key="create_proj_btn"):
            if proj_name:
                payload = {"name": proj_name, "description": proj_desc, "status": "active"}
                if proj_end_date:
                    payload["end_date"] = proj_end_date.isoformat()
                try:
                    response = requests.post(f"{api_url}/api/v1/projects/", json=payload)
                    if response.status_code == 201:
                        st.success(f"✅ Project '{proj_name}' created!")
                        st.rerun()
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {e}")
            else:
                st.warning("Please enter a project name")
    
    # --- List Projects ---
    st.write("**Existing Projects:**")
    try:
        response = requests.get(f"{api_url}/api/v1/projects/")
        if response.status_code == 200:
            projects = response.json()
            for p in projects[:5]:
                st.write(f"• **{p['name']}** (ID: {p['id']}) - {p.get('status', 'N/A')} | End: {p.get('end_date', 'N/A')}")
        else:
            st.warning("No projects found")
    except Exception as e:
        st.warning("API not connected.")
    
    st.divider()
    
    # --- MANAGE USERS ---
    st.subheader("👥 Manage Users")
    
    # Create User
    with st.expander("➕ Create New User"):
        user_name = st.text_input("User Name", key="user_name")
        user_email = st.text_input("User Email", key="user_email")
        user_role = st.selectbox("User Role", ["engineer", "manager", "devops", "designer"], key="user_role")
        
        if st.button("Create User", key="create_user_btn"):
            if user_name and user_email:
                payload = {
                    "name": user_name,
                    "email": user_email,
                    "role": user_role
                }
                try:
                    response = requests.post(f"{api_url}/api/v1/users/", json=payload)
                    if response.status_code == 201:
                        st.success(f"✅ User '{user_name}' created!")
                        st.rerun()
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {e}")
            else:
                st.warning("Please enter name and email")
    
    # List Users
    st.write("**Existing Users:**")
    try:
        response = requests.get(f"{api_url}/api/v1/users/")
        if response.status_code == 200:
            users = response.json()
            if users:
                for u in users:
                    st.write(f"• **{u['name']}** (ID: {u['id']}) - {u['role']} - {u['email']}")
            else:
                st.info("No users found. Create one above.")
        else:
            st.warning("Failed to fetch users")
    except Exception as e:
        st.warning("User service not available.")

# ======================== 3. AI AGENT ========================
with col3:
    st.subheader("🤖 AI Agent")
    st.write("Ask the AI Assistant about your projects (in natural language):")
    
    project_id = st.number_input("Project ID", min_value=1, value=1, step=1, key="ai_project_id")
    
    query_options = [
        "🔍 Check risk for this project (Root Cause)",
        "📅 Plan next sprint",
        "📊 Show daily summary",
        "🚫 What are the blocked tasks?",
        "📋 Show project details and tasks",
        "📊 How many tasks are there?",
        "📝 List all tasks for this project",
        "📁 Project name and status",
        "Custom query..."
    ]
    selected_query = st.selectbox("Quick Queries", query_options, key="quick_query")
    
    query_map = {
        "🔍 Check risk for this project (Root Cause)": "Check risk for this project",
        "📅 Plan next sprint": "Plan next sprint for this project",
        "📊 Show daily summary": "Show daily summary for this project",
        "🚫 What are the blocked tasks?": "What are the blocked tasks?",
        "📋 Show project details and tasks": "Show project details and list all tasks",
        "📊 How many tasks are there?": "How many tasks are in this project?",
        "📝 List all tasks for this project": "List all tasks for this project",
        "📁 Project name and status": "What is the project name and status?"
    }
    
    if selected_query == "Custom query...":
        user_query = st.text_area("Type your question:", height=80, key="custom_query")
    else:
        user_query = query_map.get(selected_query, selected_query)
    
    if st.button("🤖 Ask AI", type="primary", key="ask_ai_btn"):
        if user_query:
            with st.spinner("🤔 Thinking..."):
                try:
                    payload = {
                        "query": user_query,
                        "project_id": project_id,
                        "task_id": 0
                    }
                    response = requests.post(f"{api_url}/api/v1/agents/query", json=payload)
                    if response.status_code == 200:
                        result = response.json()
                        st.success("✅ AI Response:")
                        
                        with st.expander("🔍 View Full Response"):
                            st.info(result.get("result", "No response"))
                        
                        # Risk Detection (Structured Data)
                        risk_level = result.get("data", {}).get("risk", "").lower()
                        if risk_level == "high":
                            st.warning("🚨 High Risk Detected!")
                            if st.button("📋 Create Action Task", key="action_task_btn"):
                                try:
                                    action_payload = {
                                        "title": f"Fix Risk - Project {project_id}",
                                        "description": "AI recommended action: Unblock risky tasks",
                                        "project_id": project_id,
                                        "status": "todo",
                                        "priority": 5
                                    }
                                    task_response = requests.post(f"{api_url}/api/v1/tasks/", json=action_payload)
                                    if task_response.status_code == 201:
                                        st.success("✅ Action task created successfully!")
                                        st.rerun()
                                    else:
                                        st.error("Failed to create action task")
                                except Exception as e:
                                    st.error(f"Error: {e}")
                        elif risk_level == "low":
                            st.success("✅ Project is Low Risk. All tasks are on track.")
                        elif risk_level == "medium":
                            st.info("⚠️ Project is Medium Risk. Keep monitoring.")
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {e}")
        else:
            st.warning("Please enter a query")

# Divider
st.divider()

# ======================== 4. TASK MANAGEMENT ========================
st.subheader("📋 Tasks")

col_t1, col_t2 = st.columns(2)

with col_t1:
    with st.expander("➕ Create New Task"):
        task_title = st.text_input("Task Title", key="task_title")
        task_desc = st.text_area("Task Description", key="task_desc")
        task_project = st.number_input("Project ID for Task", min_value=1, value=1, step=1, key="task_project_id")
        task_status = st.selectbox("Status", ["todo", "in_progress", "review", "done", "blocked"], key="task_status")
        task_priority = st.slider("Priority", 1, 5, 2, key="task_priority")
        
        # 🆕 DEPENDS ON (Dependency Tracking)
        depends_on_options = {0: "None (No Dependency)"}
        try:
            # Fetch existing tasks for this project
            tasks_response = requests.get(f"{api_url}/api/v1/tasks/project/{task_project}")
            if tasks_response.status_code == 200:
                tasks_list = tasks_response.json()
                for t in tasks_list:
                    depends_on_options[t['id']] = f"{t['title']} (ID: {t['id']})"
        except:
            pass
        
        depends_on_id = st.selectbox(
            "🔗 Depends On (Select a task)",
            options=list(depends_on_options.keys()),
            format_func=lambda x: depends_on_options.get(x, "Unknown"),
            key="depends_on_select"
        )
        
        # ASSIGN TO DROPDOWN (Fetch Users from API)
        assignee_options = {0: "Unassigned"}
        try:
            users_response = requests.get(f"{api_url}/api/v1/users/")
            if users_response.status_code == 200:
                users_list = users_response.json()
                for u in users_list:
                    assignee_options[u['id']] = u['name']
            else:
                st.warning("⚠️ Could not fetch users. Check backend.")
        except Exception as e:
            st.warning(f"⚠️ User service not available: {e}")
        
        assignee_id = st.selectbox(
            "👤 Assign To",
            options=list(assignee_options.keys()),
            format_func=lambda x: assignee_options.get(x, "Unknown"),
            key="assignee_select"
        )
        
        if st.button("Create Task", key="create_task_btn"):
            if task_title and task_project:
                payload = {
                    "title": task_title,
                    "description": task_desc,
                    "project_id": task_project,
                    "status": task_status,
                    "priority": task_priority,
                    "assigned_to": assignee_id if assignee_id != 0 else None,
                    "depends_on": depends_on_id if depends_on_id != 0 else None
                }
                try:
                    response = requests.post(f"{api_url}/api/v1/tasks/", json=payload)
                    if response.status_code == 201:
                        st.success(f"✅ Task '{task_title}' created!")
                        st.rerun()
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {e}")
            else:
                st.warning("Please enter task title and project ID")

with col_t2:
    st.write("**View Tasks by Project:**")
    view_project_id = st.number_input("Enter Project ID to view tasks", min_value=1, value=1, step=1, key="view_project_id")
    
    if st.button("🔍 Show Tasks", key="show_tasks_btn"):
        try:
            # Fetch Tasks
            task_response = requests.get(f"{api_url}/api/v1/tasks/project/{view_project_id}")
            
            # Fetch Users for mapping assignee names
            users_map = {}
            try:
                users_resp = requests.get(f"{api_url}/api/v1/users/")
                if users_resp.status_code == 200:
                    for u in users_resp.json():
                        users_map[u['id']] = u['name']
            except:
                pass
            
            if task_response.status_code == 200:
                tasks = task_response.json()
                if tasks:
                    for t in tasks:
                        status_emoji = {
                            "todo": "📝",
                            "in_progress": "🔄",
                            "review": "👀",
                            "done": "✅",
                            "blocked": "🚫"
                        }
                        emoji = status_emoji.get(t.get("status", ""), "📋")
                        
                        assignee_name = users_map.get(t.get('assigned_to'), "Unassigned")
                        
                        # Show Dependency Info
                        depends_on_text = ""
                        if t.get('depends_on'):
                            try:
                                parent_resp = requests.get(f"{api_url}/api/v1/tasks/{t['depends_on']}")
                                if parent_resp.status_code == 200:
                                    parent = parent_resp.json()
                                    depends_on_text = f" | 🔗 Depends on: {parent['title']} (ID: {parent['id']})"
                            except:
                                depends_on_text = f" | 🔗 Depends on Task ID: {t['depends_on']}"
                        
                        st.write(f"{emoji} **{t['title']}** (ID: {t['id']}) - {t.get('status', 'N/A')} | 👤 {assignee_name}{depends_on_text}")
                else:
                    st.info("No tasks found for this project")
            else:
                st.error("Failed to fetch tasks")
        except Exception as e:
            st.error(f"Error: {e}")

# ======================== 5. RESOURCE & WORKLOAD ANALYTICS (UPDATED) ========================
st.divider()
st.subheader("📊 Resource & Workload Analytics")

col_a1, col_a2 = st.columns(2)

with col_a1:
    st.write("**⚖️ Workload Distribution**")
    if st.button("🔄 Refresh Workload", key="refresh_workload"):
        try:
            response = requests.get(f"{api_url}/api/v1/analytics/workload")
            if response.status_code == 200:
                data = response.json()
                if data.get("workload"):
                    for w in data["workload"]:
                        bar = "█" * int(w["percentage"] // 5)
                        st.write(f"👤 **{w['user_name']}** ({w['role']}): {w['task_count']} tasks ({w['percentage']}%) {bar}")
                        
                        # Status breakdown
                        if w["status_breakdown"]:
                            status_text = ", ".join([f"{k}: {v}" for k, v in w["status_breakdown"].items()])
                            st.write(f"   📊 {status_text}")
                        
                        # 🆕 TASK LIST WITH TITLE AND STATUS
                        # Since backend now returns tasks list, we display it
                        if "tasks" in w and w["tasks"]:
                            st.write(f"   📝 **Task List:**")
                            for task in w["tasks"]:
                                emoji = {
                                    "todo": "📝",
                                    "in_progress": "🔄",
                                    "review": "👀",
                                    "done": "✅",
                                    "blocked": "🚫"
                                }.get(task.get("status", ""), "📋")
                                st.write(f"      {emoji} {task['title']} - {task['status']}")
                else:
                    st.info("No users or tasks found.")
            else:
                st.error("Failed to fetch workload data")
        except Exception as e:
            st.error(f"Error: {e}")

with col_a2:
    st.write("**🔗 Dependency Check**")
    dep_project_id = st.number_input("Project ID for Dependency Check", min_value=1, value=1, step=1, key="dep_proj")
    if st.button("🔍 Check Dependencies", key="check_deps"):
        try:
            response = requests.get(f"{api_url}/api/v1/analytics/dependencies/{dep_project_id}")
            if response.status_code == 200:
                deps = response.json()
                if deps:
                    for d in deps:
                        if d["is_blocked_by_dependency"]:
                            st.error(f"🚫 **{d['task_title']}** is BLOCKED because it depends on '{d['depends_on_title']}' (Status: {d['parent_status']})")
                        else:
                            st.success(f"✅ **{d['task_title']}** depends on '{d['depends_on_title']}' (Status: {d['parent_status']}) - All Good!")
                else:
                    st.info("No dependencies found in this project.")
            else:
                st.error("Failed to fetch dependencies")
        except Exception as e:
            st.error(f"Error: {e}")

# Footer
st.divider()
st.caption("🔧 Autonomous AI Project Manager | Powered by FastAPI, LangGraph & Groq AI")