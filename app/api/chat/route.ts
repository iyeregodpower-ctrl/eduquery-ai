import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Missing GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { messages }: { messages: UIMessage[] } = await req.json();
    const modelId = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const result = streamText({
      model: google(modelId),
      system:
        'You are EduQuery AI, a friendly study assistant. Explain things clearly and simply.',
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[/api/chat] error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
