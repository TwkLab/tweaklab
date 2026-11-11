import { NextRequest, NextResponse } from "next/server";

// Simple in-memory / edge-compatible store for sync during active sessions
const syncStore = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, envelope } = body;

    if (!email || !envelope) {
      return NextResponse.json(
        { error: "Email e envelope são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    syncStore.set(cleanEmail, {
      envelope,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      digest: envelope.consent?.payloadDigest,
      message: "Evidência sincronizada com sucesso.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Falha ao processar sincronização: " + err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Parâmetro email é obrigatório." },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const entry = syncStore.get(cleanEmail);

  if (!entry) {
    return NextResponse.json(
      { found: false, message: "Nenhuma evidência recente enviada para este e-mail." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    found: true,
    ...entry,
  });
}
