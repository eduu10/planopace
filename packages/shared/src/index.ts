export const PLAN_TIERS = {
  STARTER: { name: 'Starter', price: 19.90, features: ['Planilha mensal IA', 'Sync Strava', 'Dashboard básico'] },
  PRO: { name: 'Pro', price: 34.90, features: ['Tudo do Starter', 'Ajustes semanais', 'Métricas avançadas', 'Preparação provas'] },
  ELITE: { name: 'Elite', price: 49.90, features: ['Tudo do Pro', 'Detecção overtraining', 'Previsão pace', 'Periodização', 'Suporte chat'] },
} as const;

export const RUN_TYPE_LABELS: Record<string, string> = {
  EASY: 'Corrida Leve',
  INTERVALS: 'Intervalado',
  TEMPO: 'Tempo Run',
  LONG_RUN: 'Longão',
  REST: 'Descanso',
  RACE: 'Prova',
  TEST: 'Teste',
};

export const RUN_TYPE_COLORS: Record<string, string> = {
  EASY: '#22C55E',
  INTERVALS: '#EF4444',
  TEMPO: '#F97316',
  LONG_RUN: '#A855F7',
  REST: '#6B7280',
  RACE: '#EAB308',
  TEST: '#3B82F6',
};

export function formatPace(paceDecimal: number): string {
  const minutes = Math.floor(paceDecimal);
  const seconds = Math.round((paceDecimal - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}min`;
  return `${m}min${s > 0 ? s.toString().padStart(2, '0') + 's' : ''}`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)}km`;
}
