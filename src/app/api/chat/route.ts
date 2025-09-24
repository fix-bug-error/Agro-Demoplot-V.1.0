import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { checkEnvironmentVariables } from '@/lib/env-check';

export async function POST(req: Request) {
  // Check if OpenAI is configured
  const envStatus = checkEnvironmentVariables();
  console.log('Environment status:', envStatus); // Debug log
  console.log('OpenAI key exists:', !!process.env.OPENAI_API_KEY); // Debug log
  
  if (!envStatus.ai) {
    return new Response('OpenAI API key not configured', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { messages, system } = body;
    console.log('Received messages:', messages); // Debug log
    console.log('System instructions:', system); // Debug log

    const result = await streamText({
      model: openai('gpt-4o-mini'), // Use gpt-4o-mini model
      messages,
      system: system || "Anda adalah seorang ahli agronomi profesional. Berikan jawaban yang akurat, ilmiah, dan praktis tentang topik agronomi, pertanian berkelanjutan, manajemen tanaman, kesehatan tanaman, nutrisi tanaman, teknologi pertanian, dan praktik pertanian terbaik. Gunakan istilah teknis yang sesuai tetapi tetap jelas untuk dipahami."
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}