import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json().catch(() => ({}));
    if (!image) {
      return NextResponse.json({ error: 'missing image' }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ result: 'OpenAI not configured' });
    }

    // image: așteptăm un data URL sau raw base64; construim image_url pentru Vision
    const imageUrl = image.startsWith('data:')
      ? image
      : `data:image/jpeg;base64,${image}`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that identifies pills and provides concise info (name, dosage form, common dosage, cautions).',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this pill and give short, safe guidance.' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    const text = data?.choices?.[0]?.message?.content ?? 'unknown';
    return NextResponse.json({ result: text }, { status: resp.status });
  } catch (err) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
