import unittest
from unittest.mock import patch

from app.agents.planning_agent import PlanningAgent
from app.agents.risk_agent import RiskAgent


class DummyDB:
    def close(self):
        return None


class AgentFallbackTests(unittest.TestCase):
    @patch("app.agents.planning_agent.settings")
    @patch("app.agents.planning_agent.report_service.generate_daily_summary")
    @patch("app.agents.planning_agent.SessionLocal")
    def test_planning_agent_uses_fallback_without_groq_key(
        self, session_local_mock, generate_daily_summary_mock, settings_mock
    ):
        settings_mock.GROQ_API_KEY = ""
        generate_daily_summary_mock.return_value = {
            "project_name": "Demo Project",
            "completed": 2,
            "total_tasks": 5,
            "blocked": 1,
        }
        session_local_mock.return_value = DummyDB()

        agent = PlanningAgent()
        result = agent.run({"context": {"project_id": 1}})

        self.assertIn("Sprint Goal", result["result"])
        self.assertEqual(result["data"]["project_name"], "Demo Project")

    @patch("app.agents.risk_agent.settings")
    @patch("app.agents.risk_agent.report_service.predict_risk")
    @patch("app.agents.risk_agent.SessionLocal")
    def test_risk_agent_uses_fallback_without_groq_key(
        self, session_local_mock, predict_risk_mock, settings_mock
    ):
        settings_mock.GROQ_API_KEY = ""
        predict_risk_mock.return_value = {
            "risk": "Medium",
            "risky_tasks": 2,
            "total_tasks": 5,
        }
        session_local_mock.return_value = DummyDB()

        agent = RiskAgent()
        result = agent.run({"context": {"project_id": 1}})

        self.assertIn("Risk", result["result"])
        self.assertEqual(result["data"]["risk"], "Medium")


if __name__ == "__main__":
    unittest.main()
