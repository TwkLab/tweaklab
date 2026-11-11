export type TicketStatus =
  | "novo"
  | "triagem"
  | "aguardando_cliente"
  | "agendado"
  | "em_atendimento"
  | "aguardando_validacao"
  | "concluido"
  | "cancelado";

export type TicketPriority = "baixa" | "media" | "alta" | "critica";

export type TicketCategory =
  | "diagnostico_falhas"
  | "otimizacao_jogos"
  | "consultoria_hardware"
  | "outro";

export interface DeviceSpecs {
  cpu: string;
  gpu: string;
  ram: string;
  os: string;
  storage?: string;
  motherboard?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  discord?: string;
  device?: DeviceSpecs;
  createdAt: string;
}

export interface ServiceAction {
  id: string;
  ticketId: string;
  category: "diagnostico" | "sistema" | "driver" | "bios" | "jogo" | "reversao";
  description: string;
  reason: string;
  beforeValue?: string;
  afterValue?: string;
  reversible: boolean;
  performedBy: string;
  performedAt: string;
}

export interface BenchmarkMetric {
  id: string;
  ticketId: string;
  game: string;
  resolution: string;
  preset: string;
  driverVersion: string;
  before: {
    avgFps: number;
    low1Percent: number;
    frametimeAvgMs: number;
  };
  after: {
    avgFps: number;
    low1Percent: number;
    frametimeAvgMs: number;
  };
  notes?: string;
  measuredAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderName: string;
  senderRole: "cliente" | "tecnico" | "admin";
  content: string;
  sentAt: string;
}

export interface ConsentRecord {
  id: string;
  ticketId: string;
  purpose: string;
  scope: string;
  acceptedAt: string;
  status: "ativo" | "revogado";
}

export interface Ticket {
  id: string;
  code: string; // Ex: TWK-2026-084
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  customerName: string;
  customerEmail: string;
  device: DeviceSpecs;
  actions: ServiceAction[];
  benchmarks: BenchmarkMetric[];
  messages: TicketMessage[];
  consents: ConsentRecord[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  technicianNotes?: string;
}
