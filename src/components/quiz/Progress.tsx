interface ProgressProps {
  total: number;
  answered: number;
}

export function Progress({ total, answered }: ProgressProps) {
  const share = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-[700] uppercase tracking-wider text-text-muted">
        <span>Progresso</span>
        <span>
          {answered} de {total} respondidas
        </span>
      </div>
      <div className="w-full rounded-full border border-border bg-surface-muted h-4">
        <div
          className="h-full rounded-full bg-brand-yellow transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(share, 100)}%` }}
        />
      </div>
      <p className="text-[11px] text-text-secondary">
        Respondendo ao seu ritmo. Uma pergunta por tela — você pode voltar a
        qualquer momento.
      </p>
    </div>
  );
}
