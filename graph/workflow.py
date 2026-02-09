from langgraph.graph import StateGraph, END
from core.state import MARSState

from council.planner import PlannerAgent
from council.scout import StudentScoutAgent
from research.scout import ResearchScoutAgent
from council.analyst import AnalystAgent
from council.scribe import ScribeAgent
from council.critic import CriticAgent


def build_graph():
    """
    Build the LangGraph workflow for MARS
    """
    
    # Initialize agents
    planner = PlannerAgent()
    student_scout = StudentScoutAgent()
    research_scout = ResearchScoutAgent()
    analyst = AnalystAgent()
    scribe = ScribeAgent()
    critic = CriticAgent()
    
    # Create graph
    workflow = StateGraph(MARSState)
    
    # Add nodes
    workflow.add_node("planner", planner.run)
    workflow.add_node("student_scout", student_scout.run)
    workflow.add_node("research_scout", research_scout.run)
    workflow.add_node("analyst", analyst.run)
    workflow.add_node("scribe", scribe.run)
    workflow.add_node("critic", critic.run)
    
    # Set entry point
    workflow.set_entry_point("planner")
    
    # Define routing logic
    def route_after_planner(state: MARSState) -> str:
        """Route based on mode and intent"""
        # Simple intents skip retrieval
        if state.intent in ["greeting", "feedback"]:
            return "scribe"
        
        # Route based on mode
        if state.mode == "research":
            return "research_scout"
        else:
            return "student_scout"
    
    def route_after_scout(state: MARSState) -> str:
        """Always go to analyst after retrieval"""
        return "analyst"
    
    def route_after_analyst(state: MARSState) -> str:
        """Always go to scribe"""
        return "scribe"
    
    def route_after_scribe(state: MARSState) -> str:
        """Go to critic only in student mode"""
        if state.mode == "student" and state.intent == "new_query":
            return "critic"
        return END
    
    # Add edges
    workflow.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "student_scout": "student_scout",
            "research_scout": "research_scout",
            "scribe": "scribe"
        }
    )
    
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
    
    # Compile
    return workflow.compile()