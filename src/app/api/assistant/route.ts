import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = process.env.OPENAI_API_KEY;
    
    if (!key) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const userMessage = body?.message || body?.prompt || 'Hello';

    // System prompt pentru PillMate Assistant în română
    const systemPrompt = `Ești PillMate Assistant, un asistent virtual specializat în managementul medicației. Răspunzi întotdeauna în română și ești prietenos, util și empatic.

Sarcinile tale principale:
- Ajuți utilizatorii cu întrebări despre medicația lor
- Oferi informații generale despre medicație și administrare
- Reamintești despre importanța respectării prescripțiilor medicale
- Oferi sfaturi pentru organizarea medicației
- Ajuți cu întrebări despre efecte secundare (fără a înlocui consultarea medicului)

IMPORTANT: 
- Nu oferi diagnostic medical și nu înlocuiești consultația cu doctorul
- Pentru probleme serioase, recomandă consultarea unui medic
- Fii mereu empatic și înțelegător
- Răspunde concis și clar
- Folosește un ton prietenos și profesionist

Dacă utilizatorul întreabă despre medicația sa specifică, poți oferi informații generale dar subliniază importanța consultării medicului pentru sfaturi personalizate.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${key}` 
      },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        messages, 
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!resp.ok) {
      console.error('OpenAI API error:', resp.status, resp.statusText);
      return NextResponse.json({ 
        response: 'Îmi pare rău, am întâmpinat o problemă tehnică. Te rog încearcă din nou.' 
      }, { status: 200 });
    }

    const data = await resp.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return NextResponse.json({ 
        response: data.choices[0].message.content 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        response: 'Îmi pare rău, nu am putut genera un răspuns. Te rog încearcă din nou.' 
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json({ 
      response: 'Îmi pare rău, am întâmpinat o problemă tehnică. Te rog încearcă din nou.' 
    }, { status: 200 });
  }
}
