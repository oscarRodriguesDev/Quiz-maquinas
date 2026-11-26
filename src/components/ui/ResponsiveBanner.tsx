/**
 * Banner com direção de arte: versões horizontais são usadas apenas a partir
 * de 768px. No mobile, o navegador baixa exclusivamente a arte vertical.
 *
 * O container precisa receber a proporção via `className` (ex.: aspect-[4/5]).
 */
interface ResponsiveBannerProps {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function ResponsiveBanner({
  desktopSrc,
  mobileSrc,
  alt,
  className = "",
  imageClassName = "",
  priority = false,
}: ResponsiveBannerProps) {
  return (
    <div
      className={`relative overflow-hidden bg-brand-yellow ${className}`.trim()}
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileSrc} />
        <img
          src={desktopSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`.trim()}
        />
      </picture>
    </div>
  );
}
