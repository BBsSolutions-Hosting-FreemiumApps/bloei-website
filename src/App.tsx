import { useEffect, useRef, useState, type CSSProperties } from "react";

const MARQUEE_ITEMS = [
  "Sneeuwklokje", "Krokus", "Wilg", "Paardebloem", "Fruitbomen", "Phacelia",
  "Kattenkruid", "Wilde peen", "Lavendel", "Klimop", "Herfstaster", "Sedum",
];

const ACTIONS = [
  {
    num: "01",
    title: "Plant bijvriendelijk",
    body: "Kies inheemse planten die nectar en stuifmeel geven. Vermijd dubbele bloesters — daar kunnen bijen niet bij. Eén bloeiende struik is meer waard dan tien sierplanten.",
    chips: ["Sneeuwklokje", "Krokus", "Wilg", "Paardebloem", "Phacelia", "Kattenkruid", "Klimop", "Herfstaster"],
  },
  {
    num: "02",
    title: "Maak een nestelplek",
    body: "Ongeveer 70% van de wilde bijen nestelt in kale, onbedekte grond. Een bijenhotel helpt een handje, maar open aarde helpt meer. Laat ook wat dood hout en holle stengels liggen.",
    chips: ["Kale grond", "Holle stengels", "Dood hout", "Bijenhotel", "Takkenril"],
  },
  {
    num: "03",
    title: "Zet een waterpunt neer",
    body: "Bijen drinken ook. Een ondiepe schaal met een paar steentjes — zodat ze niet verdrinken — staat binnen een week vol bezoekers.",
    chips: ["Ondiepe schaal", "Steentjes", "Vers water"],
  },
  {
    num: "04",
    title: "Onderhoud zonder gif",
    body: "Maai gefaseerd — altijd een stuk laten staan waar iets bloeit. Laat in de winter blad en stengels liggen: daar overwinteren bijen en vlinders in. En: geen gif, ook niet “even”.",
    chips: ["Gefaseerd maaien", "Blad laten liggen", "Geen gif", "Inheems zaad"],
  },
];

const SEASONS: Record<string, { label: string; months: string; text: string }> = {
  lente: {
    label: "Lente",
    months: "maart — mei",
    text: "Vroege bijen vliegen op wilg, krokus en sneeuwklokje. Plant nu longkruid, judaspenning en fruitbomen, zodat het voorjaar al gedekt is.",
  },
  zomer: {
    label: "Zomer",
    months: "juni — augustus",
    text: "Hoogseizoen: phacelia, kattenkruid, lavendel en wilde peen. Maai gefaseerd, zodat er altijd ergens iets bloeit.",
  },
  herfst: {
    label: "Herfst",
    months: "september — november",
    text: "Klimop is nu goud waard: de laatste grote nectarbron vóór de winter. Plant herfstasters en sedum voor de late bijen.",
  },
  winter: {
    label: "Winter",
    months: "december — februari",
    text: "Bijen slapen in holle stengels en tussen blad. Laat alles staan. Maak in oktober nestkasten schoon — nooit in het voorjaar.",
  },
};

const SEASON_ORDER = ["lente", "zomer", "herfst", "winter"];

const LINKS = [
  { title: "Nederland Zoemt", sub: "Nationale bijentelling, tips en plantenlijsten", href: "https://www.nederlandzoemt.nl" },
  { title: "IVN Natuureducatie", sub: "Cursussen, materiaal en lokale afdelingen", href: "https://www.ivn.nl" },
  { title: "Wilde bijen in Nederland", sub: "Soorten, herkenning en bescherming (Naturalis)", href: "https://www.wildebijen.nl" },
  { title: "Nederlandse Soortenbank", sub: "Flora en fauna van Nederland opzoeken", href: "https://www.nederlandsesoorten.nl" },
];

const STATS = [
  { count: 358, prefix: "", suffix: "", label: "wilde bijensoorten leven in Nederland" },
  { count: 50, prefix: "~", suffix: "%", label: "ervan staat op de Rode Lijst" },
  { count: 75, prefix: "", suffix: "%", label: "van onze voedselgewassen heeft bestuivers nodig" },
];

function currentSeason(): string {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "lente";
  if (m >= 6 && m <= 8) return "zomer";
  if (m >= 9 && m <= 11) return "herfst";
  return "winter";
}

const FLIGHT_INNER = `
  <g class="hexes" stroke="currentColor" stroke-width="1.5">
    <path class="hex h1" d="M500 120l34 20v40l-34 20-34-20v-40z"/>
    <path class="hex h2" d="M90 90l26 15v30l-26 15-26-15v-30z"/>
    <path class="hex h3" d="M520 470l30 17v34l-30 17-30-17v-34z"/>
    <path class="hex h4" d="M150 540l22 13v26l-22 13-22-13v-26z"/>
  </g>
  <path id="flightPath" class="flight-path" d="M40 580 C 150 520, 70 420, 190 370 S 380 300, 310 190 S 430 60, 556 96" stroke="var(--honey-deep)" stroke-width="2.5" stroke-dasharray="7 9" stroke-linecap="round"/>
  <g class="bee">
    <animateMotion dur="11s" repeatCount="indefinite" rotate="auto" calcMode="linear">
      <mpath href="#flightPath"/>
    </animateMotion>
    <ellipse cx="-4" cy="-9" rx="9" ry="5" fill="#fff" opacity=".9" transform="rotate(-28)"/>
    <ellipse cx="6" cy="-9" rx="9" ry="5" fill="#fff" opacity=".7" transform="rotate(28)"/>
    <ellipse cx="0" cy="0" rx="13" ry="9" fill="var(--ink)"/>
    <path d="M-6 -8c4 3 4 13 0 16 4-3 4-13 0-16Z" fill="var(--honey)" transform="translate(1 0)"/>
    <path d="M2 -9c4 3.5 4 14.5 0 18 4-3.5 4-14.5 0-18Z" fill="var(--honey)"/>
    <circle cx="13" cy="-1" r="5" fill="var(--ink)"/>
  </g>
`;

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openAcc, setOpenAcc] = useState<number | null>(null);
  const [season, setSeason] = useState<string>(() => currentSeason());
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [formMsg, setFormMsg] = useState<{ cls: string; text: string }>({ cls: "form-msg", text: "" });
  const headRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current;

  useEffect(() => {
    const head = headRef.current;
    const onScrollHead = () => {
      head?.classList.toggle("scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScrollHead, { passive: true });
    onScrollHead();

    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("in"));
    }

    const animateCount = (el: Element) => {
      const target = parseInt(el.getAttribute("data-count") || "0", 10);
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }
      const dur = 1400;
      let start: number | null = null;
      const frame = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const statNums = document.querySelectorAll(".stat-num");
    if ("IntersectionObserver" in window) {
      const statIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 },
      );
      statNums.forEach((el) => statIO.observe(el));
    } else {
      statNums.forEach(animateCount);
    }

    const flightPath = document.getElementById("flightPath");
    if (flightPath) {
      const flightSvg = flightPath.closest("svg");
      if (reduceMotion && flightSvg && (flightSvg as SVGSVGElement).pauseAnimations) {
        (flightSvg as SVGSVGElement).pauseAnimations();
      }
      const len = (flightPath as SVGPathElement).getTotalLength();
      const onScrollPath = () => {
        if (reduceMotion || !flightSvg) return;
        const rect = flightSvg.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        flightPath.style.strokeDashoffset = String(-progress * len);
      };
      window.addEventListener("scroll", onScrollPath, { passive: true });
      window.addEventListener("resize", onScrollPath);
      onScrollPath();
    }

    return () => {
      window.removeEventListener("scroll", onScrollHead);
    };
  }, [reduceMotion]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    if (!valid) {
      setEmailErr(true);
      setFormMsg({ cls: "form-msg err", text: "Vul een geldig e-mailadres in." });
      return;
    }
    setEmailErr(false);
    setFormMsg({ cls: "form-msg ok", text: "Gelukt! De seizoensgids is onderweg naar " + value + "." });
    setEmail("");
  };

  const d = (v: string) => ({ "--d": v } as CSSProperties);

  return (
    <>
      <a className="skip-link" href="#main">Direct naar inhoud</a>

      <header className="site-head" id="top" ref={headRef}>
        <div className="head-in">
          <a className="brand" href="#top" aria-label="Bloei — naar boven">
            <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 3 42 13.5v21L24 45 6 34.5v-21Z" fill="var(--honey)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <g fill="currentColor">
                <ellipse cx="24" cy="26" rx="7.5" ry="5.5" />
                <circle cx="32.5" cy="25" r="3.2" />
                <path d="M18.5 22.4c2 1.4 2 5.8 0 7.2-2-1.4-2-5.8 0-7.2Z" fill="var(--honey)" />
                <path d="M23.5 21.6c2.4 1.7 2.4 7.1 0 8.8-2.4-1.7-2.4-7.1 0-8.8Z" fill="var(--honey)" />
              </g>
              <ellipse cx="20" cy="18.5" rx="5" ry="3" fill="#fff" opacity=".85" transform="rotate(-24 20 18.5)" />
              <ellipse cx="28" cy="18.5" rx="5" ry="3" fill="#fff" opacity=".85" transform="rotate(24 28 18.5)" />
            </svg>
            <span className="brand-word">Bloei<sup>®</sup></span>
          </a>
          <nav className="main-nav" aria-label="Hoofdmenu">
            <a href="#waarom">Waarom</a>
            <a href="#burgers">Voor burgers</a>
            <a href="#bedrijven">Voor bedrijven</a>
            <a href="#bronnen">Bronnen</a>
          </nav>
          <div className="head-actions">
            <a className="btn btn-ink btn-sm" href="#doemee">Doe mee</a>
            <button
              className="menu-btn"
              aria-expanded={menuOpen}
              aria-controls="mobileMenu"
              aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" id="mobileMenu" hidden={!menuOpen}>
        <nav aria-label="Mobiel menu">
          <a href="#waarom" onClick={() => setMenuOpen(false)}><em>01</em>Waarom</a>
          <a href="#burgers" onClick={() => setMenuOpen(false)}><em>02</em>Voor burgers</a>
          <a href="#bedrijven" onClick={() => setMenuOpen(false)}><em>03</em>Voor bedrijven</a>
          <a href="#bronnen" onClick={() => setMenuOpen(false)}><em>04</em>Bronnen</a>
          <a href="#doemee" onClick={() => setMenuOpen(false)}><em>05</em>Doe mee</a>
        </nav>
      </div>

      <main id="main">
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow reveal"><span className="eyebrow-dot"></span>Platform voor bijvriendelijke plekken</p>
              <h1 className="reveal" style={d(".08s")}>
                Elke vierkante<br />meter{" "}
                <em className="squiggle">telt
                  <svg viewBox="0 0 220 24" aria-hidden="true" preserveAspectRatio="none">
                    <path d="M4 16 C 40 6, 70 22, 110 13 S 180 6, 216 14" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </em>.
              </h1>
              <p className="lead reveal" style={d(".16s")}>
                Bloei helpt burgers én bedrijven om van tuin, balkon, dak of terrein een thuis te maken voor wilde bijen — voedsel, nest en rust, het hele jaar door. Zonder gif, met planten die hier thuishoren.
              </p>
              <div className="hero-cta reveal" style={d(".24s")}>
                <a className="btn btn-honey" href="#burgers">Start met je tuin {ARROW_RIGHT}</a>
                <a className="text-link" href="#bedrijven">Ik ben een bedrijf</a>
              </div>
              <dl className="hero-stats reveal" style={d(".32s")}>
                {STATS.map((s) => (
                  <div className="stat" key={s.label}>
                    <dt><span className="stat-num" data-count={s.count} data-prefix={s.prefix} data-suffix={s.suffix}>0</span></dt>
                    <dd>{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="hero-visual reveal" style={d(".2s")} aria-hidden="true">
              <svg className="flight" viewBox="0 0 600 640" fill="none" dangerouslySetInnerHTML={{ __html: FLIGHT_INNER }} />
            </div>
          </div>
          <a className="scroll-cue" href="#waarom" aria-label="Scroll naar beneden">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m0 0 6-6m-6 6-6-6" /></svg>
          </a>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((n) => (
              <div className="marquee-group" key={n} aria-hidden={n === 1}>
                {MARQUEE_ITEMS.map((item) => (
                  <span key={item + n}>{item}</span>
                )).reduce((acc: React.ReactNode[], el, i) => {
                  acc.push(el);
                  if (i < MARQUEE_ITEMS.length - 1) acc.push(<i key={"i" + i + n} />);
                  return acc;
                }, [])}
              </div>
            ))}
          </div>
        </div>

        <section className="section" id="waarom">
          <div className="section-grid">
            <div className="section-label reveal"><span className="label-num">01</span><span className="label-text">Waarom bijen</span></div>
            <div className="section-body">
              <h2 className="reveal">Zonder bijen geen fruit, geen tomaten, <em>geen noten.</em></h2>
              <p className="big-copy reveal">
                In Nederland leven ruim 350 soorten wilde bijen. Zij bestuiven niet alleen wilde planten, maar ook het merendeel van wat we eten. Toch staat ongeveer de helft op de Rode Lijst. De grootste boosdoeners? Verstening, gif en eenvormige tuinen zonder bloei.
              </p>
              <div className="fact-rows reveal">
                <div className="fact-row"><span className="fact-key">Wilde bijen</span><p>Solitair en klein — en verantwoordelijk voor het grootste deel van de bestuiving in stad en land.</p></div>
                <div className="fact-row"><span className="fact-key">Gifvrij</span><p>Chemische bestrijdingsmiddelen zijn de grootste bedreiging. Ze vervangen kan gewoon.</p></div>
                <div className="fact-row"><span className="fact-key">Het hele jaar</span><p>Elk seizoen heeft zijn drachtplanten. Wie spreidt, voedt bijen van februari tot november.</p></div>
              </div>
              <blockquote className="pull-quote reveal">
                <p>“Een bijvriendelijke tuin is geen wildernis. Het is een menu dat het hele jaar open is.”</p>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="burgers">
          <div className="section-grid">
            <div className="section-label reveal"><span className="label-num">02</span><span className="label-text">Voor burgers</span></div>
            <div className="section-body">
              <h2 className="reveal">Begin waar je staat: <em>tuin, balkon of dak.</em></h2>
              <p className="big-copy reveal">
                Je hebt geen hectare nodig. Een paar vierkante meter bloeiende planten, een plek om te nestelen en een bakje water — daar begint het. Vier acties, van klein naar groot.
              </p>

              <div className="accordion reveal" id="actions">
                {ACTIONS.map((a, i) => (
                  <div className={"acc-item" + (openAcc === i ? " open" : "")} key={a.num}>
                    <h3>
                      <button
                        className="acc-head"
                        aria-expanded={openAcc === i}
                        onClick={() => setOpenAcc(openAcc === i ? null : i)}
                      >
                        <span className="acc-num">{a.num}</span>
                        <span className="acc-title">{a.title}</span>
                        <span className="acc-icon" aria-hidden="true"></span>
                      </button>
                    </h3>
                    <div className="acc-body">
                      <div className="acc-inner">
                        <p>{a.body}</p>
                        <div className="chips">{a.chips.map((c) => <span key={c}>{c}</span>)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="seasons reveal">
                <div className="seasons-head">
                  <h3>Wat bloeit wanneer</h3>
                  <div className="season-tabs" role="tablist" aria-label="Seizoenen">
                    {SEASON_ORDER.map((key) => (
                      <button
                        key={key}
                        role="tab"
                        id={"tab-" + key}
                        aria-controls={"panel-" + key}
                        aria-selected={season === key}
                        tabIndex={season === key ? 0 : -1}
                        data-season={key}
                        onClick={() => setSeason(key)}
                      >
                        {SEASONS[key].label}
                        {season === key && <span className="now"> · nu</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="season-panels">
                  {SEASON_ORDER.map((key) => (
                    <div
                      key={key}
                      role="tabpanel"
                      id={"panel-" + key}
                      aria-labelledby={"tab-" + key}
                      hidden={season !== key}
                    >
                      <p className="season-months">{SEASONS[key].months}</p>
                      <p>{SEASONS[key].text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-dark" id="bedrijven">
          <div className="section-grid">
            <div className="section-label reveal"><span className="label-num">03</span><span className="label-text">Voor bedrijven</span></div>
            <div className="section-body">
              <h2 className="reveal">Groen dat <em>meetelt</em> — op dak, gevel en terrein.</h2>
              <p className="big-copy reveal">
                Steeds meer bedrijven rapporteren over biodiversiteit. Een bijvriendelijk terrein is goedkoper in beheer, sterker in je imago en direct zichtbaar in je verslag. En het begint met hetzelfde als thuis: de juiste planten op de juiste plek.
              </p>
              <div className="fact-rows reveal">
                <div className="fact-row"><span className="fact-key">Minder maaien</span><p>Inheems grasland kost minder maaien dan gazon — en is levendiger.</p></div>
                <div className="fact-row"><span className="fact-key">CSRD &amp; natuur</span><p>Een meetbare bijdrage aan biodiversiteitsdoelen, rechtstreeks op je eigen terrein.</p></div>
                <div className="fact-row"><span className="fact-key">Zichtbaar</span><p>Voor klanten, medewerkers en elke passant: groen dat gonst.</p></div>
              </div>
              <ol className="steps reveal">
                <li><span className="step-num">1</span><div><strong>Scan</strong><p>We brengen je terrein in kaart: wat groeit er, waar is potentie?</p></div></li>
                <li><span className="step-num">2</span><div><strong>Plan</strong><p>Een beplantingsplan met inheemse soorten, afgestemd op bodem en gebruik.</p></div></li>
                <li><span className="step-num">3</span><div><strong>Beheer</strong><p>Gifvrij beheer met gefaseerd maaien — zo blijft het jaar rond bloeien.</p></div></li>
              </ol>
              <div className="reveal">
                <a className="btn btn-honey" href="#doemee">Plan een gratis scan {ARROW_RIGHT}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section cta-section" id="doemee">
          <div className="cta-in">
            <p className="eyebrow reveal"><span className="eyebrow-dot"></span>Doe mee</p>
            <h2 className="reveal" style={d(".08s")}>Klaar om te <em>bloeien?</em></h2>
            <p className="big-copy reveal" style={d(".14s")}>
              Schrijf je in en ontvang elk seizoen de gids: wat plant je nu, wat laat je staan, wat is nu te zien in de tuin.
            </p>
            <form className="cta-form reveal" id="gidsForm" style={d(".2s")} noValidate onSubmit={onSubmit}>
              <label className="visually-hidden" htmlFor="email">E-mailadres</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="jouw@email.nl"
                autoComplete="email"
                required
                value={email}
                className={emailErr ? "error" : ""}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailErr(false);
                  if (formMsg.cls.includes("err")) setFormMsg({ cls: "form-msg", text: "" });
                }}
              />
              <button className="btn btn-ink" type="submit">Stuur me de gids</button>
            </form>
            <p className={formMsg.cls} id="formMsg" role="status" aria-live="polite">{formMsg.text}</p>
            <p className="fine reveal" style={d(".26s")}>Geen spam, alleen seizoenen. Uitschrijven kan altijd.</p>
          </div>
        </section>

        <section className="section" id="bronnen">
          <div className="section-grid">
            <div className="section-label reveal"><span className="label-num">04</span><span className="label-text">Bronnen</span></div>
            <div className="section-body">
              <h2 className="reveal">Lees <em>verder</em></h2>
              <div className="link-rows reveal">
                {LINKS.map((l) => (
                  <a className="link-row" key={l.title} href={l.href} target="_blank" rel="noopener">
                    <span className="link-title">{l.title}</span>
                    <span className="link-sub">{l.sub}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="foot-word" aria-hidden="true">Bloei<span>®</span></div>
        <div className="foot-grid">
          <div className="foot-col">
            <p className="foot-head">Menu</p>
            <a href="#waarom">Waarom</a>
            <a href="#burgers">Voor burgers</a>
            <a href="#bedrijven">Voor bedrijven</a>
            <a href="#bronnen">Bronnen</a>
          </div>
          <div className="foot-col">
            <p className="foot-head">Contact</p>
            <a href="mailto:contact@bloei-website.nl">contact@bloei-website.nl</a>
            <p className="foot-note">Vragen over je tuin of terrein? Stuur een bericht — we denken graag mee.</p>
          </div>
          <div className="foot-col">
            <p className="foot-head">Over Bloei</p>
            <p className="foot-note">Een platform voor bijvriendelijke plekken: tuinen, balkons, daken en bedrijfsterreinen. Zonder gif, met inheemse planten.</p>
          </div>
        </div>
        <div className="foot-bar">
          <p>© {new Date().getFullYear()} Bloei — gemaakt met inheemse planten</p>
          <a href="#top" className="to-top">Terug naar boven
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m0 0-6 6m6-6 6 6" /></svg>
          </a>
        </div>
      </footer>
    </>
  );
}
