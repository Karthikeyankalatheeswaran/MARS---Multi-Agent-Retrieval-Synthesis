from langgraph.graph import StateGraph, END
from api.core.state import MARSState

from api.council.planner import PlannerAgent
from api.council.scout import StudentScoutAgent
from api.research.scout import ResearchScoutAgent
from api.council.analyst import AnalystAgent
from api.council.scribe import ScribeAgent
from api.council.critic import CriticAgent


from api.research.oracle import OracleAgent

def build_graph():
    """
    Build the LangGraph workflow for MARS
    """

    planner = PlannerAgent()
    student_scout = StudentScoutAgent()
    research_scout = ResearchScoutAgent()
    oracle = OracleAgent()
    analyst = AnalystAgent()
    scribe = ScribeAgent()
    critic = CriticAgent()

    workflow = StateGraph(MARSState)

    workflow.add_node("planner", planner.run)
    workflow.add_node("student_scout", student_scout.run)
    workflow.add_node("research_scout", research_scout.run)
    workflow.add_node("oracle", oracle.run)
    workflow.add_node("analyst", analyst.run)
    workflow.add_node("scribe", scribe.run)
    workflow.add_node("critic", critic.run)

    workflow.set_entry_point("planner")

    def route_after_planner(state: MARSState) -> str:
        if state.intent in ["greeting", "feedback"]:
            return "scribe"
        if state.intent == "exam_prediction":
            return "oracle"
        if state.mode == "research":
            return "research_scout"
        else:
            return "student_scout"

    def route_after_scout(state: MARSState) -> str:
        return "analyst"

    def route_after_oracle(state: MARSState) -> str:
        # Oracle produces a draft_answer directly, so we might skip Analyst or use Analyst to refine.
        # OracleAgent.run produces draft_answer.
        # Scribe expects draft_answer to finalize.
        # Analyst expects retrieved_sources.
        # Using Scribe directly is safest.
        return "scribe"

    def route_after_analyst(state: MARSState) -> str:
        return "scribe"

    def route_after_scribe(state: MARSState) -> str:
        if state.mode == "student" and state.intent == "new_query":
            return "critic"
        return END

    workflow.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "student_scout": "student_scout",
            "research_scout": "research_scout",
            "oracle": "oracle",
            "scribe": "scribe"
        }
    )

    workflow.add_edge("oracle", "scribe")

    workflow.add_conditional_edges(
        "student_scout",
        route_after_scout,
        {"analyst": "analyst"}
    )

    workflow.add_conditional_edges(
        "research_scout",
        route_after_scout,
        {"analyst": "analyst"}
    )

    workflow.add_conditional_edges(
        "analyst",
        route_after_analyst,
        {"scribe": "scribe"}
    )

    workflow.add_conditional_edges(
        "scribe",
        route_after_scribe,
        {
            "critic": "critic",
            END: END
        }
    )

    workflow.add_edge("critic", END)

    return workflow.compile()
