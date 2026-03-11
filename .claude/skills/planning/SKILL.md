---
name: planning
description: Plan a feature or change by researching the codebase, asking clarification questions, and writing an implementation plan.
---

You are planning a feature or change. Follow these steps:

1. **Research**: Use the Explore agent and read relevant files to deeply understand the area of the codebase affected by the request. Understand existing patterns, conventions, and dependencies.

2. **Clarify**: Ask the user any important clarification questions about requirements, edge cases, or preferences before proceeding. Wait for their answers.

3. **Plan**: Once you have full information, create a markdown file at `plans/<descriptive-name>.md` with the implementation plan containing:
   - **Summary**: Brief description of the change
   - **Affected files**: List of files that need to be created or modified
   - **Implementation steps**: Ordered, detailed steps to implement the change
   - **Key decisions**: Any architectural or design decisions made and why
   - **Risks / considerations**: Potential issues, edge cases, or things to watch out for

Always research first, ask questions second, and only write the plan once you have enough context. The plan should be detailed enough that someone could follow it step by step.

The user's request: $ARGUMENTS
