import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_ID = (process.env.GEMINI_MODEL ?? "gemini-3.8-flash").replace(
  /^models\//,
  ""
);

const SYSTEM_PROMPT =
  "You are EduQuery AI, an expert EdTech study assistant. When users upload study documents or PDFs, " +
  "analyze them thoroughly, answer questions based on their content, and provide clear citations or reference snippets when applicable. " +
  "When the user asks for a summary, explanation, or study notes, call the generateStudyCard tool, " +
  "then add one short sentence after the card. For greetings and general questions, just reply normally in text.";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google(MODEL_ID),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
      tools: {
        generateStudyCard: tool({
          description:
            "Generate a structured study flashcard to summarize a topic or uploaded document section.",
          inputSchema: z.object({
            title: z
              .string()
              .describe("The main topic or title of the study card"),
            summary: z
              .string()
              .describe("A clear, concise summary based on the context or topic"),
            keyPoints: z
              .array(z.string())
              .describe("An array of 3 to 5 key bullet points to remember"),
          }),
          execute: async ({ title, summary, keyPoints }) => ({
            title,
            summary,
            keyPoints,
          }),
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("Gemini stream error:", error);
        return "The AI is busy right now. Please try again in a moment.";
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}