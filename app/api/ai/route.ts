import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const INTERVIEW_SYSTEM = `You are Claude, an intelligent career guidance AI for the eSpark Learning Platform — a platform focused on Power Engineering, Networking, and Software Development.

Your mission: help students, graduates, and curious learners discover which engineering field is right for them.

Conduct a warm, conversational interview asking ONE question at a time. Be encouraging and insightful. After 5 questions, reply with ONLY the text: ANALYSIS_READY

Question flow (adapt based on answers):
1. Ask about their educational background or current studies
2. Ask what excites them most technically or professionally
3. Ask about their career vision — what kind of work they imagine themselves doing
4. Ask about technologies, tools, or subjects they've already explored or are curious about
5. Ask about their learning style and how much time per week they can commit

Keep questions short, friendly, and conversational — one question per message. Never number them.`;

const ANALYSIS_SYSTEM = `You are an expert engineering career guidance AI. Analyze the interview conversation and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "profile": {
    "summary": "2-3 sentence profile of the learner",
    "recommendedField": "Primary field (e.g. Power Engineering, Network Engineering, Software Development)",
    "reasoning": "Why this field fits them specifically"
  },
  "todaysFocus": {
    "title": "Specific topic to start with today",
    "description": "Why this is the perfect entry point for them",
    "duration": "2-3 hours",
    "difficulty": "beginner",
    "resources": ["First concrete resource or action", "Second resource or action"]
  },
  "priorities": [
    { "topic": "Topic Name", "score": 85, "reason": "Brief why" },
    { "topic": "Topic Name", "score": 72, "reason": "Brief why" },
    { "topic": "Topic Name", "score": 60, "reason": "Brief why" },
    { "topic": "Topic Name", "score": 45, "reason": "Brief why" },
    { "topic": "Topic Name", "score": 30, "reason": "Brief why" }
  ],
  "timeAllocation": [
    { "subject": "Subject Name", "percentage": 40 },
    { "subject": "Subject Name", "percentage": 28 },
    { "subject": "Subject Name", "percentage": 20 },
    { "subject": "Subject Name", "percentage": 12 }
  ],
  "connections": [
    { "from": "Mathematics", "to": "Power Systems", "bridge": "Circuit analysis relies on calculus and linear algebra" },
    { "from": "Programming", "to": "Network Automation", "bridge": "Python scripts automate repetitive network tasks" },
    { "from": "Electronics", "to": "Embedded Systems", "bridge": "Component knowledge enables hardware programming" }
  ]
}

Use real, specific topics relevant to engineering. Percentages in timeAllocation must sum to 100.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json() as {
      messages: Anthropic.MessageParam[];
      mode: "interview" | "analyze";
    };

    const systemPrompt = mode === "analyze" ? ANALYSIS_SYSTEM : INTERVIEW_SYSTEM;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: mode === "analyze" ? 4096 : 512,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (mode === "analyze") {
      try {
        // Strip any accidental markdown code fences
        const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
        const plan = JSON.parse(cleaned);
        return NextResponse.json({ plan });
      } catch {
        return NextResponse.json({ error: "Failed to parse plan" }, { status: 500 });
      }
    }

    return NextResponse.json({ text, done: text.trim() === "ANALYSIS_READY" });
  } catch (err) {
    console.error("[AI route error]", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
