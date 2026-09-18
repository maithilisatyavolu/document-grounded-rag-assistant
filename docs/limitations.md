# Limitations and Production Considerations

## Retrieval Quality

RAG depends on retrieving the correct source material.

If the relevant section is not retrieved, the language model may be unable to
produce the correct response even though the information exists in the source
document.

## Chunking

Relevant information may span several sections of a document.

Poor chunk boundaries can separate related concepts and reduce retrieval
quality.

## Multi-Section Reasoning

Questions requiring synthesis across multiple provisions introduce more risk
than direct factual retrieval.

## Strict Grounding Tradeoff

Strict grounding improves precision and reduces hallucination, but it may
cause the system to avoid potentially helpful interpretations.

## Higher-Risk Queries

A production application could use additional safeguards including:

- Confidence thresholds
- Human escalation
- Logging
- Evaluation monitoring
- Expanded source validation
