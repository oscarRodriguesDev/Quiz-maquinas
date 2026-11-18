export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="py-10 md:py-16 flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Coluna 1: logo + redes sociais + diferenciais */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://images.tcdn.com.br/img/img_prod/1276888/1772465396_logodikmaqcenter.png"
                alt="Kärcher Center Dikmaq"
                width="110"
                height="37"
                className="h-8 w-auto object-contain"
                loading="lazy"
              />
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/karchercenterdikmaq/"
                className="text-text-muted hover:text-brand-ink transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Kärcher Center Dikmaq"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/karchercenterdikmaq/"
                className="text-text-muted hover:text-brand-ink transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Kärcher Center Dikmaq"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="17.5" x2="17.51" y2="17.5" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@karchercenterdikmaq"
                className="text-text-muted hover:text-brand-ink transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Kärcher Center Dikmaq"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A2.78 2.78 0 0 0 2 12c0 2.27 1.24 4.27 2.94 5.58a2.78 2.78 0 0 0 1.94 0C10.76 19.73 12 17.73 12 17.73s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 2.78 2.78 0 0 0 0-5.58z" />
                  <polygon points="10 15 15 12 10 9 10 15" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@karchercenterdikmaq"
                className="text-text-muted hover:text-brand-ink transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Kärcher Center Dikmaq"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v2l4-2z" />
                  <path d="M9.5 9.5c0 1.1 1.35 2 3 2s3-.9 3-2-1.35-2-3-2-3 .9-3 2z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/karchercenterdikmaq/"
                className="text-text-muted hover:text-brand-ink transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Kärcher Center Dikmaq"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span>💰 Desconto 5% OFF no Pix</span>
              <span>💳 Parcelamento até 10x sem juros</span>
              <span>🏪 Loja Oficial Kärcher</span>
              <span>🚚 Entrega em todo o Brasil</span>
            </div>
          </div>

          {/* Coluna 2: Institucional */}
          <div>
            <h4 className="mb-3 font-[700] text-brand-ink uppercase tracking-tight text-xs">
              Institucional
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/sobre-a-empresa-karcher-dikmaq" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Sobre a empresa
                </a>
              </li>
              <li>
                <a href="/seguranca" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Segurança
                </a>
              </li>
              <li>
                <a href="/meios-de-pagamento-e-frete" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Meios de pagamento e frete
                </a>
              </li>
              <li>
                <a href="/garantia-karcher" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Garantia Kärcher
                </a>
              </li>
              <li>
                <a href="/noticias" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Notícias
                </a>
              </li>
              <li>
                <a href="/politica-de-privacidade" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="/trocas-e-devolucoes" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Devoluções
                </a>
              </li>
              <li>
                <a href="/locacao-e-manutencao-karcher" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Locação e Manutenção
                </a>
              </li>
              <li>
                <a href="/contato" className="text-sm text-text-secondary hover:text-brand-ink transition-colors">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento */}
          <div>
            <h4 className="mb-3 font-[700] text-brand-ink uppercase tracking-tight text-xs">
              Atendimento
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-text-secondary flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                (27) 3066-7638
              </li>
              <li className="text-sm text-text-secondary flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                (31) 3565-5099
              </li>
              <li className="text-sm text-text-secondary flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                WhatsApp: (27) 3066-7638
              </li>
              <li className="text-sm text-text-secondary flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                ecommerce@karcherdikmaq.com.br
              </li>
            </ul>
          </div>

          {/* Coluna 4: Formas de pagamento */}
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="mb-3 font-[700] text-brand-ink uppercase tracking-tight text-xs">
                Formas de pagamento
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Visa", "MasterCard", "Diners", "Amex", "Elo", "Boleto", "Pix"].map(
                  (bandeira) => (
                    <span
                      key={bandeira}
                      className="inline-flex items-center justify-center w-6 h-6 rounded border border-border text-[10px] font-[700] text-text-secondary uppercase"
                    >
                      {bandeira}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="border-t border-border-soft pt-3">
              <h4 className="mb-3 font-[700] text-brand-ink uppercase tracking-tight text-xs">
                Selos de segurança
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <a
                  href="https://transparencyreport.google.com/safe-browsing/search?url=https://www.karcher-center-dikmaq.com.br"
                  className="text-text-secondary hover:text-brand-ink transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Safe Browsing
                </a>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted">Loja Protegida</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="mt-10 md:mt-12 border-t border-border pt-8 w-full text-[11px] text-text-secondary uppercase tracking-wider">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px]">
              Tecnologia{" "}
              <a
                href="http://www.tray.com.br/?utm_source=rodape&utm_medium=lojas&utm_campaign=1276888&utm_term=Varejo"
                className="text-brand-ink hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tray
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
