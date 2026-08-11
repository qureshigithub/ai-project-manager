class BaseAgent:
    def run(self, state: dict) -> dict:
        raise NotImplementedError("Agent must implement run method")