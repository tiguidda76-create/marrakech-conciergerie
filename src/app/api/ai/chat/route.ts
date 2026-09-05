import { NextResponse } from 'next/server';
import { LEGAL_ENTITY } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { messages, agentId, agentName, context } = await request.json();

    const systemPrompt = `
Tu es l'agent IA "${agentName || 'Manager Radar'}" au sein de la plateforme "Marrakech Conciergerie Privée & Hospitalité" gérée par Hassan Tiguidda.

Coordonnées officielles & Identité :
- Fondateur & Gérant : Hassan Tiguidda
- Entité légale : ${LEGAL_ENTITY.name}
- ICE : ${LEGAL_ENTITY.ice}
- Téléphone / WhatsApp : ${LEGAL_ENTITY.phone} (${LEGAL_ENTITY.rawPhone})
- Email : ${LEGAL_ENTITY.email}
- Commission : 25% sur les revenus bruts générés (Exonéré de TVA selon Art. 91 du CGI marocain).
- Taxe de séjour : 11 MAD par personne et par nuitée (Délégation du Tourisme de Marrakech).

Rôle spécifique de l'agent :
${agentId === 'prospect-hunter' ? 'Agent commercial expert en prospection immobilière à Marrakech (Médina, Palmeraie, Guéliz, Hivernage, Targa). Tu détectes les riads et villas sous-optimisés, estimes les gains annuels en MAD et rédiges des messages d\'approche percutants.' :
agentId === 'revenue-manager' ? 'Expert en Yield Management et Pricing dynamique à Marrakech. Tu analyses l\'offre, la demande, la saisonnalité et recommandes les meilleurs tarifs nuitée (ADR et RevPAR).' :
agentId === 'legal-shield' ? 'Conseiller juridique et fiscal au Maroc. Tu veilles au respect de l\'Art. 91 CGI, des déclarations de police et des contrats de gestion.' :
agentId === 'reply-rescue' ? 'Concierge digital de luxe trilingue (Français, Darija, Anglais). Tu réponds chaleureusement aux voyageurs et prépares leur séjour.' :
'Superviseur opérationnel 24/7. Tu orchestres l\'activité, les rotations ménage de 3h, les encaissements et la satisfaction client.'}

Règles impératives :
1. Réponds de façon précise, professionnelle, élégante et concrète.
2. Utilise le Dirham marocain (MAD) pour tous les montants financiers.
3. Sois direct et proactif. Tu n'es pas dépendant d'outils externes complexes (pas besoin de n8n, tout est natif et autonome).
4. Reste parfaitement aligné avec la vision d'excellence de Hassan Tiguidda à Marrakech.
`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || m.content
      }))
    ];

    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              success: true,
              reply,
              model: 'groq/llama-3.3-70b-versatile',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (groqErr) {
        console.error('Groq fetch error:', groqErr);
      }
    }

    // Fallback intelligent
    return NextResponse.json({
      success: true,
      reply: `Bonjour Si Hassan. En tant que ${agentName || 'Manager Radar'}, je veille sur vos opérations à Marrakech. Toutes les métriques de la conciergerie sont prêtes pour accueillir vos nouveaux mandats et voyageurs.`,
      model: 'local-copilot',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
