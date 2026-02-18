import time
from api.core.state import MARSState, AgentLog
from api.core.llms import FAST_LLM
from langchain_community.tools.tavily_search import TavilySearchResults

class OracleAgent:
    def run(self, state: MARSState) -> MARSState:
        """Predicts Exam Questions based on Subject Code with Year/Regulation Metadata"""
        start = time.time()
        
        subject_code = state.user_query
        
        # 1. Faster Search
        search = TavilySearchResults(max_results=5)
        
        try:
            # Enhanced Queries for Last 5 Years (2020-2025)
            query_1 = f"Anna University {subject_code} question papers 2020 2021 2022 2023 2024 regulation R2021 R2017"
            results_1 = search.invoke(query_1)
            
            query_2 = f"Engtree {subject_code} important questions last 5 years frequency regulation"
            results_2 = search.invoke(query_2)
            
            combined_results = str(results_1) + "\n" + str(results_2)
            
            # 2. Synthesize Prediction with Metadata
            prompt = f"""
You are an Exam Pattern Oracle for Anna University students.
Subject: {subject_code}
Time Range: Last 5 Years (2020-2025)

Search Results:
{combined_results}

Instructions:
- Analyze results to identify recurring questions from the **last 5 years only**.
- Provide exactly **10 questions** for Part A and **10 questions** for Part B/C.
- For EVERY question, you MUST include:
  - **Year(s)**: All years it was asked (e.g., Asked: Nov 2021, May 2023).
  - **Frequency**: How many times it appeared (e.g., Asked 3 times).
  - **Regulation**: (e.g., R2021).
- Format strictly in Markdown.

Output Format:
# Exam Predictor: {subject_code} (5-Year Analysis)

## Part A (2-Marks) - Top 10
1. **[Question]**
   - Years: [Years] | Frequency: [N] times | Regulation: [Reg]

## Part B & C (13/15-Marks) - Top 10
1. **[Question]**
   - Years: [Years] | Frequency: [N] times | Regulation: [Reg]

## Disclaimer
Predictions based on last 5 years historical data.
"""
            response = FAST_LLM.invoke(prompt)
            state.draft_answer = response.content
            
            state.agent_logs.append(AgentLog(
                agent="Oracle", icon="tips_and_updates", status="completed",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Predicted exam pattern for {subject_code} using {len(results_1)+len(results_2)} search results",
                output_preview=state.draft_answer[:100]
            ))

        except Exception as e:
            print(f"[Oracle Error] {e}")
            state.draft_answer = f"Could not retrieve exam data for {subject_code}. Verification failed."
            state.agent_logs.append(AgentLog(
                agent="Oracle", icon="tips_and_updates", status="error",
                duration_ms=int((time.time() - start) * 1000),
                thinking=f"Search failed: {e}",
                details={"error": str(e)}
            ))

        return state
