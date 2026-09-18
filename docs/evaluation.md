# Evaluation Strategy

The assistant was evaluated using questions designed to test different RAG
behaviors.

## Test Categories

### 1. Direct Retrieval

Tests whether the assistant can locate and explain information explicitly
contained in the source document.

### 2. Multi-Section Synthesis

Tests whether the assistant can retrieve multiple related provisions and
combine them into one coherent answer.

### 3. Out-of-Scope Detection

Tests whether the assistant refuses to generate answers that are not supported
by the source document.

### 4. Interpretation

Tests questions where the answer requires connecting information across
multiple parts of the document.

## Example Evaluation Cases

| Test | Example | Expected Behavior |
|---|---|---|
| Direct retrieval | Who are members of the association? | Retrieve and cite membership provisions |
| Synthesis | What happens if assessments are unpaid? | Combine relevant enforcement provisions |
| Out of scope | Can HOA fees be deducted on taxes? | State that the information is not in the bylaws |
| Interpretation | Can tenants be held responsible for rules violations? | Retrieve multiple relevant clauses and clearly identify the basis |

## Key Finding

RAG performed especially well for questions where the source contained
explicit rules.

More interpretive questions required combining multiple clauses and therefore
introduced more reasoning risk.
