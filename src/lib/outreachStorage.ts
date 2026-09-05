export interface OutreachLogEntry {
  executionId: string;
  timestamp: string;
  eventType: 'EMAIL_PITCH' | 'WHATSAPP_PITCH';
  recipient: {
    leadId?: string;
    title?: string;
    zone?: string;
    email?: string;
    phone?: string;
  };
  subject?: string;
  status: 'DELIVERED_REAL' | 'FAILED' | 'PREPARED';
  delivery: {
    status: 'SENT' | 'FAILED';
    messageId?: string;
    provider: 'GMAIL_SMTP' | 'WHATSAPP_DIRECT';
    error?: string;
  };
}

const STORAGE_KEY = 'marrakech_concierge_outreach_logs_v1';

export function getOutreachLogs(): OutreachLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read outreach logs from localStorage:', e);
  }
  return [];
}

export function recordOutreachLog(entry: OutreachLogEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOutreachLogs();
    const updated = [entry, ...current].slice(0, 300);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write outreach log:', e);
  }
}

export function purgeOutreachLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to purge outreach logs:', e);
  }
}

export function getOutreachStats() {
  const logs = getOutreachLogs();
  const total = logs.length;
  const delivered = logs.filter(l => l.status === 'DELIVERED_REAL' || l.delivery?.status === 'SENT').length;
  const bounced = logs.filter(l => l.status === 'FAILED' || l.delivery?.status === 'FAILED').length;
  const whatsappCount = logs.filter(l => l.eventType === 'WHATSAPP_PITCH').length;
  const emailCount = logs.filter(l => l.eventType === 'EMAIL_PITCH').length;

  return {
    totalSent: total,
    delivered,
    bounced,
    whatsappCount,
    emailCount,
    deliveryRate: total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 100,
  };
}
