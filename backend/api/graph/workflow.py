from langgraph.graph import StateGraph, END
from api.core.state import MARSState, MARSStateDict

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

    workflow = StateGraph(MARSStateDict)
    # Using lambda wrappers to handle conversions between TypedDict and Pydantic MARSState
    # This prevents InvalidUpdateError by ensuring nodes return plain dicts.
    workflow.add_node("planner", lambda state: planner.run(MARSState(**state)).model_dump())
    workflow.add_node("student_scout", lambda state: student_scout.run(MARSState(**state)).model_dump())
    workflow.add_node("research_scout", lambda state: research_scout.run(MARSState(**state)).model_dump())
    workflow.add_node("oracle", lambda state: oracle.run(MARSState(**state)).model_dump())
    workflow.add_node("analyst", lambda state: analyst.run(MARSState(**state)).model_dump())
    workflow.add_node("scribe", lambda state: scribe.run(MARSState(**state)).model_dump())
    workflow.add_node("critic", lambda state: critic.run(MARSState(**state)).model_dump())

    workflow.set_entry_point("planner")

    def route_after_planner(state: MARSStateDict) -> str:
        intent = state.get("intent")
        mode = state.get("mode")
        if intent in ["greeting", "feedback"]:
            return "scribe"
        if intent == "exam_prediction":
            return "oracle"
        if mode == "research":
            return "research_scout"
        else:
            return "student_scout"

    def route_after_scout(state: MARSStateDict) -> str:
        return "analyst"

    def route_after_oracle(state: MARSStateDict) -> str:
        return "scribe"

    def route_after_analyst(state: MARSStateDict) -> str:
        return "scribe"

    def route_after_scribe(state: MARSStateDict) -> str:
        intent = state.get("intent")
        mode = state.get("mode")
        if mode == "student" and intent == "new_query":
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
