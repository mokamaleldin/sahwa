import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Pillar {
  title: string;
  description: string;
  /** Petal of the Sahwa symbol that points toward this pillar (0 = top, clockwise). */
  petalIndex: number;
}

// Order defines the focus sequence: القرآن → الصحبة → الأمة → الأثر
const PILLARS: Pillar[] = [
  {
    title: 'القرآن مرجعنا',
    description:
      'نرجع إلى القرآن في الهداية وبناء نظرتنا لأنفسنا وأسرنا ومجتمعنا والحياة من حولنا؛ نتدبره، ونعمل به، ويكون حاضرًا في قراراتنا وطريقنا.',
    petalIndex: 1, // upper-right
  },
  {
    title: 'الصحبة الصالحة بيئتنا',
    description:
      'صحبة تحمل الإنسان وتعينه على الثبات والنمو، يجد فيها من يمشي معه، يقوّيه ويذكّره ويشاركه الطريق.',
    petalIndex: 5, // upper-left
  },
  {
    title: 'الأمة الواحدة تجمعنا',
    description:
      'نلتقي رغم اختلاف بلادنا وألسنتنا وجنسياتنا على أخوة وهوية مشتركة ومسؤولية واحدة.',
    petalIndex: 2, // lower-right
  },
  {
    title: 'النفع والأثر غايتنا',
    description:
      'نتعلم ونتطور، ونقوى في علومنا وتخصصاتنا؛ لنكون أنفع حيثما كنا، ونترك أثرًا حقيقيًا.',
    petalIndex: 4, // lower-left
  },
];

// Desktop columns (RTL: the first grid column renders on the right).
const RIGHT_COLUMN = [0, 2];
const LEFT_COLUMN = [1, 3];

const FOCUS_INTERVAL_MS = 4200;
const FOCUS_TRANSITION = '1200ms ease-in-out';
const DIMMED_OPACITY = 0.6;
const EASE_OUT = 'cubic-bezier(.22,.61,.36,1)';

// Single petal of the Sahwa symbol (pointed-arch geometry), drawn pointing up.
const PETAL_PATH =
  'M -37,-139 L 37,-139 L 37,-85 C 37,-68 16,-56 0,-50 C -16,-56 -37,-68 -37,-85 Z';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

interface SymbolProps {
  assembled: boolean;
  entered: boolean;
  reduced: boolean;
  highlightedPetal: number | null;
}

const SahwaSymbol: React.FC<SymbolProps> = ({ assembled, entered, reduced, highlightedPetal }) => (
  <svg
    className="relative w-full h-full overflow-visible drop-shadow-[0_4px_16px_rgba(214,173,99,0.25)]"
    viewBox="-170 -170 340 340"
    aria-hidden="true"
  >
    {[0, 1, 2, 3, 4, 5].map((index) => {
      const angle = index * 60;
      const rad = (angle * Math.PI) / 180;
      const lit = highlightedPetal === index;
      // Petals glide in from outside, then the petal facing the focused pillar
      // drifts outward by a few units only.
      const offset = assembled ? (lit && !reduced ? 5 : 0) : 36;
      const dx = Math.sin(rad) * offset;
      const dy = -Math.cos(rad) * offset;
      return (
        <path
          key={index}
          d={PETAL_PATH}
          fill="#D6AD63"
          style={{
            transformOrigin: '0px 0px',
            transform: `translate(${dx}px, ${dy}px) rotate(${angle}deg)`,
            opacity: assembled ? (highlightedPetal === null || lit ? 1 : 0.86) : 0,
            transition: `transform 1100ms ${EASE_OUT}, opacity ${FOCUS_TRANSITION}`,
            transitionDelay: entered || reduced ? '0ms' : `${index * 80}ms`,
          }}
        />
      );
    })}
  </svg>
);

interface Geometry {
  width: number;
  height: number;
  paths: string[];
}

const PillarsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const reduced = usePrefersReducedMotion();
  const [assembled, setAssembled] = useState(false);
  const [entered, setEntered] = useState(false);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  const isAssembled = assembled || reduced;
  // With reduced motion there is no automatic focus: every pillar stays fully visible.
  const focused = hovered ?? (reduced ? null : active);

  // Assemble the symbol once the section is visible; track visibility to pause the cycle off-screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setAssembled(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // After the entrance sequence, drop the stagger delays so focus changes respond immediately.
  useEffect(() => {
    if (!isAssembled || entered) return;
    const timer = window.setTimeout(() => setEntered(true), 2200);
    return () => window.clearTimeout(timer);
  }, [isAssembled, entered]);

  // Calm automatic focus cycle; pauses on hover, off-screen, or with reduced motion.
  const cycling = !reduced && inView && hovered === null;
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % PILLARS.length),
      FOCUS_INTERVAL_MS
    );
    return () => window.clearTimeout(timer);
  }, [cycling, active]);

  // Measure connector lines between the symbol and each pillar node (desktop only).
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const symbol = symbolRef.current;
    if (!stage || !symbol || stage.offsetParent === null) return; // hidden on mobile
    const s = stage.getBoundingClientRect();
    const sym = symbol.getBoundingClientRect();
    const cx = sym.left + sym.width / 2 - s.left;
    const cy = sym.top + sym.height / 2 - s.top;
    const radius = (sym.width / 2) * 0.92;
    const paths = PILLARS.map((_, index) => {
      const node = nodeRefs.current[index];
      if (!node) return '';
      const n = node.getBoundingClientRect();
      const nx = n.left + n.width / 2 - s.left;
      const ny = n.top + n.height / 2 - s.top;
      const angle = Math.atan2(ny - cy, nx - cx);
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy + Math.sin(angle) * radius;
      const qx = sx + (nx - sx) * 0.55;
      return `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${qx.toFixed(1)} ${ny.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    });
    setGeometry({ width: s.width, height: s.height, paths });
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    measure();
    const observer = new ResizeObserver(() => measure());
    if (stageRef.current) observer.observe(stageRef.current);
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [measure]);

  // Very subtle parallax for the background rings (no React re-renders on scroll).
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const rings = ringsRef.current;
      if (!section || !rings) return;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewport) return;
      const progress = (viewport - rect.top) / (viewport + rect.height);
      rings.style.transform = `translate3d(0, ${((progress - 0.5) * 40).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const entranceDelay = (order: number) => (entered || reduced ? 0 : 900 + order * 200);
  const highlightedPetal = focused === null ? null : PILLARS[focused].petalIndex;

  const nodeStyle = (index: number): React.CSSProperties => {
    const isFocused = focused === index;
    return {
      opacity: isAssembled ? (isFocused || focused === null ? 1 : 0.55) : 0,
      boxShadow: isFocused
        ? '0 0 0 4px rgba(214,173,99,0.15), 0 0 12px rgba(214,173,99,0.55)'
        : '0 0 0 0 rgba(214,173,99,0)',
      transition: `opacity ${FOCUS_TRANSITION}, box-shadow ${FOCUS_TRANSITION}`,
      transitionDelay: `${entranceDelay(index)}ms`,
    };
  };

  const contentStyle = (index: number): React.CSSProperties => {
    const dimmed = focused !== null && focused !== index;
    return {
      opacity: isAssembled ? (dimmed ? DIMMED_OPACITY : 1) : 0,
      transform: isAssembled ? 'none' : 'translateY(10px)',
      transition: `opacity ${FOCUS_TRANSITION}, transform 1200ms ${EASE_OUT}`,
      transitionDelay: `${entranceDelay(index)}ms`,
    };
  };

  const renderDesktopPillar = (index: number, side: 'right' | 'left') => {
    const pillar = PILLARS[index];
    const isFocused = focused === index;
    return (
      <article
        key={pillar.title}
        onMouseEnter={() => {
          setHovered(index);
          setActive(index);
        }}
        onMouseLeave={() => setHovered(null)}
        className={`relative text-right ${side === 'left' ? 'pr-7' : ''}`}
      >
        {/* Connector node, on the edge facing the symbol and aligned with the title row */}
        <span
          ref={(el) => {
            nodeRefs.current[index] = el;
          }}
          aria-hidden="true"
          className={`absolute top-5 w-2.5 h-2.5 -translate-y-1/2 rounded-full bg-[#D6AD63] ${
            side === 'right' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
          }`}
          style={nodeStyle(index)}
        />
        <div style={contentStyle(index)}>
          <div className="flex h-10 items-center gap-4">
            <h3 className="font-heading font-bold text-2xl xl:text-3xl text-[#752026] whitespace-nowrap">
              {pillar.title}
            </h3>
            {side === 'right' && (
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-l from-[#D6AD63]/0 to-[#D6AD63]/70"
                style={{ opacity: isFocused ? 1 : 0.45, transition: `opacity ${FOCUS_TRANSITION}` }}
              />
            )}
          </div>
          <p className="mt-3 font-sans text-base text-[#350E15]/90 leading-[2]">{pillar.description}</p>
        </div>
      </article>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="pillars"
      aria-label="الركائز الأربع"
      className="relative overflow-hidden bg-transparent py-16 sm:py-20 lg:py-28"
    >
      {/* ===================== Desktop: symbol at the centre, four pillars around it ===================== */}
      <div className="hidden lg:block">
        <div ref={stageRef} className="relative mx-auto max-w-6xl px-8">
          {/* Faint geometric rings with subtle parallax */}
          <div
            ref={ringsRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform"
          >
            <div className="absolute w-[420px] h-[420px] rounded-full border border-[#D6AD63]/20" />
            <div className="absolute w-[640px] h-[640px] rounded-full border border-[#D6AD63]/10" />
            <div className="absolute w-[880px] h-[880px] rounded-full border border-[#752026]/5" />
          </div>

          {/* Golden connectors and light trail */}
          {geometry && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-visible"
              width={geometry.width}
              height={geometry.height}
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            >
              <defs>
                <filter id="sahwaPillarGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {geometry.paths.map((d, index) => {
                if (!d) return null;
                const isFocused = focused === index;
                return (
                  <g key={index}>
                    {/* Base hairline, drawn outward once the symbol assembles */}
                    <path
                      d={d}
                      fill="none"
                      stroke="#D6AD63"
                      strokeWidth={1}
                      pathLength={1}
                      style={{
                        strokeDasharray: 1,
                        strokeDashoffset: isAssembled ? 0 : 1,
                        strokeOpacity: 0.32,
                        transition: `stroke-dashoffset 1400ms ${EASE_OUT}`,
                        transitionDelay: `${reduced ? 0 : 600 + index * 180}ms`,
                      }}
                    />
                    {/* Lit line toward the focused pillar */}
                    <path
                      d={d}
                      fill="none"
                      stroke="#D6AD63"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      filter="url(#sahwaPillarGlow)"
                      style={{ strokeOpacity: isFocused ? 0.85 : 0, transition: `stroke-opacity ${FOCUS_TRANSITION}` }}
                    />
                    {/* Soft light travelling from the symbol to the focused pillar */}
                    {isFocused && !reduced && (
                      <path
                        d={d}
                        fill="none"
                        stroke="#D6AD63"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="8 192"
                        filter="url(#sahwaPillarGlow)"
                      >
                        <animate attributeName="stroke-dashoffset" values="8;-100" dur="2.6s" repeatCount="indefinite" />
                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          keyTimes="0;0.15;0.85;1"
                          dur="2.6s"
                          repeatCount="indefinite"
                        />
                      </path>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          <div className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-20">
            <div className="flex flex-col gap-24">{RIGHT_COLUMN.map((i) => renderDesktopPillar(i, 'right'))}</div>

            <div ref={symbolRef} role="img" aria-label="رمز صحوة" className="relative w-56 h-56">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#D6AD63]/15 blur-2xl"
                style={{ opacity: isAssembled ? 0.8 : 0, transition: 'opacity 1400ms ease' }}
              />
              <SahwaSymbol
                assembled={isAssembled}
                entered={entered}
                reduced={reduced}
                highlightedPetal={highlightedPetal}
              />
            </div>

            <div className="flex flex-col gap-24">{LEFT_COLUMN.map((i) => renderDesktopPillar(i, 'left'))}</div>
          </div>
        </div>
      </div>

      {/* ===================== Mobile / tablet: symbol on top, pillars linked by a golden thread ===================== */}
      <div className="lg:hidden page-container max-w-xl">
        <div role="img" aria-label="رمز صحوة" className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#D6AD63]/15 blur-xl"
            style={{ opacity: isAssembled ? 0.8 : 0, transition: 'opacity 1400ms ease' }}
          />
          <SahwaSymbol
            assembled={isAssembled}
            entered={entered}
            reduced={reduced}
            highlightedPetal={highlightedPetal}
          />
        </div>

        <ol className="flex flex-col items-center">
          {PILLARS.map((pillar, index) => {
            const isFocused = focused === index;
            return (
              <li key={pillar.title} className="flex flex-col items-center text-center">
                {/* Thread segment leading into this pillar */}
                <svg aria-hidden="true" width="12" height="44" viewBox="0 0 12 44" className="overflow-visible">
                  <line x1="6" y1="2" x2="6" y2="44" stroke="#D6AD63" strokeWidth="1" strokeOpacity="0.3" />
                  <line
                    x1="6"
                    y1="2"
                    x2="6"
                    y2="44"
                    stroke="#D6AD63"
                    strokeWidth="1.5"
                    style={{ strokeOpacity: isFocused ? 0.85 : 0, transition: `stroke-opacity ${FOCUS_TRANSITION}` }}
                  />
                  {isFocused && !reduced && (
                    <circle cx="6" r="2" fill="#D6AD63">
                      <animate attributeName="cy" values="2;44" dur="2.4s" repeatCount="indefinite" />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;0.2;0.8;1"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </svg>
                <span aria-hidden="true" className="block w-2.5 h-2.5 rounded-full bg-[#D6AD63]" style={nodeStyle(index)} />
                <div className="mt-3 max-w-sm" style={contentStyle(index)}>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#752026] mb-2">{pillar.title}</h3>
                  <p className="font-sans text-sm sm:text-base text-[#350E15]/90 leading-[2]">{pillar.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default PillarsSection;
