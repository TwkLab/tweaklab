import { NextRequest, NextResponse } from "next/server";

export interface ChatMessagePayload {
  id?: string;
  ticketId?: string;
  email?: string;
  senderName: string;
  senderRole: "cliente" | "tecnico" | "admin" | "sistema";
  content: string;
  sentAt?: string;
}

// In-memory chat store keyed by ticketId or email
const chatStore = new Map<string, ChatMessagePayload[]>();

function getStorageKey(ticketId?: string | null, email?: string | null): string {
  if (ticketId && ticketId.trim()) {
    return ticketId.trim().toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().toLowerCase();
  }
  return "GERAL";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");
    const email = searchParams.get("email");

    const key = getStorageKey(ticketId, email);
    const messages = chatStore.get(key) || [];

    return NextResponse.json({
      success: true,
      ticketId: key,
      count: messages.length,
      messages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao buscar mensagens do chat: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatMessagePayload = await req.json();
    const { ticketId, email, senderName, senderRole, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Conteúdo da mensagem é obrigatório." },
        { status: 400 }
      );
    }

    const key = getStorageKey(ticketId, email);
    const currentList = chatStore.get(key) || [];

    const newMsg: ChatMessagePayload = {
      id: body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticketId: key,
      email: email ? email.trim().toLowerCase() : undefined,
      senderName: (senderName || "Técnico TWK").trim(),
      senderRole: senderRole || "tecnico",
      content: content.trim(),
      sentAt: body.sentAt || new Date().toISOString(),
    };

    currentList.push(newMsg);
    chatStore.set(key, currentList);

    return NextResponse.json({
      success: true,
      ticketId: key,
      message: newMsg,
      count: currentList.length,
      messages: currentList,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao enviar mensagem no chat: " + err.message },
      { status: 500 }
    );
  }
}
