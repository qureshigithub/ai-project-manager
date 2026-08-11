import dash
from dash import dcc, html, Input, Output, State
import dash_bootstrap_components as dbc
import requests
import plotly.graph_objs as go

# =====================================================
# Dash App Initialize
# =====================================================
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.DARKLY],  # Professional dark theme
    title="AI Project Manager"
)

# Backend API URL
API_URL = "http://127.0.0.1:8000"

# =====================================================
# Layout
# =====================================================
app.layout = dbc.Container([
    # Header
    dbc.Row([
        dbc.Col(html.H1("🚀 AI Project Manager", className="text-center text-primary my-4"), width=12)
    ]),
    
    dbc.Row([
        dbc.Col(html.H5("Your AI Co-Pilot for Engineering Management", className="text-center text-muted mb-4"), width=12)
    ]),

    # ===============================
    # Row 1: Dashboard Cards
    # ===============================
    dbc.Row([
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H4("📁 Total Projects", className="card-title"),
                html.H2(id="total-projects", children="0", className="text-primary")
            ])
        ], color="dark", inverse=True), width=3),
        
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H4("📋 Total Tasks", className="card-title"),
                html.H2(id="total-tasks", children="0", className="text-info")
            ])
        ], color="dark", inverse=True), width=3),
        
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H4("✅ Completion Rate", className="card-title"),
                html.H2(id="completion-rate", children="0%", className="text-success")
            ])
        ], color="dark", inverse=True), width=3),
        
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H4("⚠️ High Risk Projects", className="card-title"),
                html.H2(id="high-risk-count", children="0", className="text-danger")
            ])
        ], color="dark", inverse=True), width=3),
    ], className="mb-4"),

    # ===============================
    # Row 2: High Risk Projects List
    # ===============================
    dbc.Row([
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H5("🚨 High Risk Projects", className="text-danger"),
                html.Div(id="high-risk-list")
            ])
        ], color="dark", inverse=True), width=12)
    ], className="mb-4"),

    # ===============================
    # Row 3: Charts (Workload Distribution)
    # ===============================
    dbc.Row([
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H5("📊 Workload Distribution", className="text-info"),
                dcc.Graph(id="workload-chart")
            ])
        ], color="dark", inverse=True), width=6),
        
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H5("📈 Tasks by Status", className="text-warning"),
                dcc.Graph(id="status-chart")
            ])
        ], color="dark", inverse=True), width=6),
    ], className="mb-4"),

    # ===============================
    # Row 4: AI Agent Query
    # ===============================
    dbc.Row([
        dbc.Col(dbc.Card([
            dbc.CardBody([
                html.H5("🤖 AI Assistant", className="text-primary"),
                dbc.InputGroup([
                    dbc.Input(id="ai-query-input", placeholder="Ask about your projects...", type="text"),
                    dbc.Button("Ask AI", id="ask-ai-btn", color="primary", n_clicks=0)
                ], className="mb-2"),
                html.Div(id="ai-response", className="text-light bg-secondary p-2 rounded", style={"min-height": "60px"})
            ])
        ], color="dark", inverse=True), width=12)
    ], className="mb-4"),

    # ===============================
    # Row 5: Footer
    # ===============================
    dbc.Row([
        dbc.Col(html.P("🔧 Built with FastAPI + Dash + Groq AI", className="text-center text-muted mt-3"), width=12)
    ])

], fluid=True, className="bg-dark p-4", style={"min-height": "100vh"})


# =====================================================
# Callbacks (Functions to update the UI)
# =====================================================

# ---------- 1. Dashboard Update ----------
@app.callback(
    [
        Output("total-projects", "children"),
        Output("total-tasks", "children"),
        Output("completion-rate", "children"),
        Output("high-risk-count", "children"),
        Output("high-risk-list", "children")
    ],
    Input("total-projects", "id")  # Auto-load on page load
)
def update_dashboard(_):
    try:
        resp = requests.get(f"{API_URL}/api/v1/dashboard/summary")
        if resp.status_code == 200:
            data = resp.json()
            total_projects = data.get("total_projects", 0)
            total_tasks = data.get("total_tasks", 0)
            completion = f"{data.get('overall_completion_rate', 0)}%"
            high_risk_count = data.get("high_risk_count", 0)
            
            # High risk projects list
            high_risk_projects = data.get("high_risk_projects", [])
            if high_risk_projects:
                risk_list = html.Ul([
                    html.Li(f"🚨 ID: {p['id']} - {p['name']} (Risk: {p['risk_percentage']}%)", className="text-danger")
                    for p in high_risk_projects
                ])
            else:
                risk_list = html.P("✅ No high risk projects found!", className="text-success")
            
            return total_projects, total_tasks, completion, high_risk_count, risk_list
        else:
            return "Error", "Error", "Error", "Error", html.P("Failed to load data")
    except Exception as e:
        return "0", "0", "0%", "0", html.P(f"Error: {e}", className="text-danger")


# ---------- 2. Workload Chart ----------
@app.callback(
    Output("workload-chart", "figure"),
    Input("workload-chart", "id")
)
def update_workload_chart(_):
    try:
        resp = requests.get(f"{API_URL}/api/v1/analytics/workload")
        if resp.status_code == 200:
            data = resp.json()
            workload = data.get("workload", [])
            
            names = [w["user_name"] for w in workload]
            counts = [w["task_count"] for w in workload]
            percentages = [w["percentage"] for w in workload]
            
            fig = go.Figure(data=[
                go.Bar(
                    x=names,
                    y=counts,
                    text=percentages,
                    textposition='auto',
                    marker_color=['#00d2ff', '#ff6b6b', '#ffd93d', '#6bcb77'],
                    hovertemplate='%{x}: %{y} tasks (%{text}%)<extra></extra>'
                )
            ])
            fig.update_layout(
                template='plotly_dark',
                title='Tasks per User',
                xaxis_title='Team Members',
                yaxis_title='Task Count',
                hovermode='x unified'
            )
            return fig
        else:
            return go.Figure()
    except:
        return go.Figure()


# ---------- 3. Status Breakdown Chart ----------
@app.callback(
    Output("status-chart", "figure"),
    Input("status-chart", "id")
)
def update_status_chart(_):
    try:
        resp = requests.get(f"{API_URL}/api/v1/dashboard/summary")
        if resp.status_code == 200:
            data = resp.json()
            # We need task status breakdown - for demo we'll use dummy or actual
            # For now, showing a placeholder pie chart
            fig = go.Figure(data=[
                go.Pie(
                    labels=['Todo', 'In Progress', 'Done', 'Blocked'],
                    values=[2, 1, 1, 1],
                    marker=dict(colors=['#ffd93d', '#00d2ff', '#6bcb77', '#ff6b6b']),
                    hole=0.4
                )
            ])
            fig.update_layout(
                template='plotly_dark',
                title='Task Status Distribution'
            )
            return fig
        else:
            return go.Figure()
    except:
        return go.Figure()


# ---------- 4. AI Agent Query ----------
@app.callback(
    Output("ai-response", "children"),
    Input("ask-ai-btn", "n_clicks"),
    State("ai-query-input", "value")
)
def ask_ai(n_clicks, query):
    if n_clicks > 0 and query:
        try:
            payload = {
                "query": query,
                "project_id": 1,
                "task_id": 0
            }
            resp = requests.post(f"{API_URL}/api/v1/agents/query", json=payload)
            if resp.status_code == 200:
                result = resp.json()
                return html.Div([
                    html.Strong("🧠 AI Response: "),
                    html.Span(result.get("result", "No response"))
                ], className="text-success")
            else:
                return html.Div(f"Error: {resp.text}", className="text-danger")
        except Exception as e:
            return html.Div(f"Error: {e}", className="text-danger")
    return html.Div("Ask me anything about your projects...", className="text-muted")


# =====================================================
# Run the App
# =====================================================
if __name__ == "__main__":
    app.run(debug=True, port=8050)