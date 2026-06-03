import { useState, useEffect, useRef } from "react";
import "./App.css";
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── RIPPLE BUTTON ───────────────────────────────────────────────────────────
function RippleBtn({ children, className = "", onClick, style = {} }) {
  const btn = useRef(null);
  const handleClick = (e) => {
    const el = btn.current;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
    onClick?.();
  };
  return (
    <button ref={btn} className={`btn ${className}`} style={style} onClick={handleClick}>
      {children}
    </button>
  );
}

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
function Toggle({ label, desc, defaultOn = false, color = tokens.colors.violet }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="toggle-wrap" onClick={() => setOn(!on)}>
      <div className={`toggle ${on ? "on" : ""}`} style={on ? { background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderColor: color } : {}}>
        <div className="toggle-thumb" />
      </div>
      <div>
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ label, value, color }) {
  const [width, setWidth] = useState(0);
  const ref = useScrollReveal();
  useEffect(() => { setTimeout(() => setWidth(value), 400); }, [value]);
  return (
    <div className="progress-wrap scroll-reveal" ref={ref}>
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-val" style={{ color }}>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ num, suffix = "", label, delta, deltaUp, color }) {
  const ref = useScrollReveal();
  const [started, setStarted] = useState(false);
  const counted = useCounter(num, 1800, started);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="stat-card scroll-reveal" ref={ref}>
      <div className="stat-num counter-num" style={{ color }}>
        {counted.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
      {delta && <div className={`stat-delta ${deltaUp ? "up" : "down"}`}>{deltaUp ? "▲" : "▼"} {delta}</div>}
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ initials, size = "md", bg, online = false }) {
  return (
    <div className={`avatar avatar-${size} ${online ? "avatar-online" : ""}`} style={{ background: bg }}>
      <span style={{ color: "#fff", letterSpacing: "0.02em" }}>{initials}</span>
    </div>
  );
}

// ─── FEATURE CARD ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accentColor, delay = 0 }) {
  const ref = useScrollReveal();
  useEffect(() => {
    if (ref.current) ref.current.style.transitionDelay = `${delay}ms`;
  }, [delay]);
  return (
    <div className="card scroll-reveal" ref={ref}>
      <div className="card-icon" style={{ background: `${accentColor}22` }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>
    </div>
  );
}

// ─── PRICING CARD ────────────────────────────────────────────────────────────
function PricingCard({ name, price, period, features, featured, color, delay = 0 }) {
  const ref = useScrollReveal();
  useEffect(() => { if (ref.current) ref.current.style.transitionDelay = `${delay}ms`; }, [delay]);
  return (
    <div className={`pricing-card scroll-reveal ${featured ? "featured" : ""}`} ref={ref}>
      {featured && <div className="featured-tag">Most Popular</div>}
      <div className="pricing-name">{name}</div>
      <div className="pricing-price" style={{ color }}>${price}</div>
      <div className="pricing-period">per {period}</div>
      <div style={{ marginBottom: 28, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 20 }}>
        {features.map((f, i) => (
          <div key={i} className="pricing-feature">
            <span className={f.included ? "pricing-check" : "pricing-x"}>{f.included ? "✓" : "✗"}</span>
            <span style={!f.included ? { opacity: 0.4 } : {}}>{f.label}</span>
          </div>
        ))}
      </div>
      <RippleBtn className={`btn-${featured ? "primary" : "outline"}`} style={{ width: "100%", justifyContent: "center" }}>
        Get Started
      </RippleBtn>
    </div>
  );
}

// ─── TABS DEMO ────────────────────────────────────────────────────────────────
function TabsDemo() {
  const [active, setActive] = useState(0);
  const tabs = ["Overview", "Analytics", "Settings", "Team"];
  const content = [
    "Your workspace at a glance. Track performance metrics, recent activity, and key milestones across all projects in real time.",
    "Deep dive into your data. Conversion funnels, retention curves, cohort analysis — every chart you need to make smarter decisions.",
    "Fine-tune your experience. Manage notifications, integrations, API keys, and advanced preferences from one central hub.",
    "Collaborate at scale. Invite members, assign roles, review activity logs, and keep everyone aligned across every initiative.",
  ];
  return (
    <div>
      <div className="tabs">
        {tabs.map((t, i) => (
          <button key={t} className={`tab-btn ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>{t}</button>
        ))}
      </div>
      <div className="tab-content" key={active}>{content[active]}</div>
    </div>
  );
}

// ─── DROPDOWN DEMO ────────────────────────────────────────────────────────────
function DropdownDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Account");
  const items = [
    { icon: "👤", label: "Profile" },
    { icon: "⚙️", label: "Settings" },
    { icon: "🔔", label: "Notifications" },
    null,
    { icon: "🚪", label: "Sign Out", danger: true },
  ];
  return (
    <div className="dropdown-wrap">
      <RippleBtn className="btn-outline" onClick={() => setOpen(!open)} style={{ gap: 8 }}>
        {selected} <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
      </RippleBtn>
      <div className={`dropdown-menu ${open ? "open" : ""}`}>
        {items.map((item, i) =>
          item === null ? <div key={i} className="dropdown-divider" /> : (
            <div key={i} className="dropdown-item"
              style={item.danger ? { color: tokens.colors.rose } : {}}
              onClick={() => { setSelected(item.label); setOpen(false); }}>
              <span>{item.icon}</span>{item.label}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── CHIP GROUP ───────────────────────────────────────────────────────────────
function ChipGroup() {
  const tags = ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL", "Docker", "AWS", "Figma"];
  const [active, setActive] = useState(new Set(["React", "TypeScript"]));
  const toggle = (t) => {
    const next = new Set(active);
    next.has(t) ? next.delete(t) : next.add(t);
    setActive(next);
  };
  return (
    <div className="chip-group">
      {tags.map(t => (
        <div key={t} className={`chip ${active.has(t) ? "active" : ""}`} onClick={() => toggle(t)}>{t}</div>
      ))}
    </div>
  );
}

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ height: 14, width: "60%" }} />
        <div className="skeleton" style={{ height: 12, width: "90%" }} />
        <div className="skeleton" style={{ height: 12, width: "75%" }} />
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotifCard({ dot, title, msg, time, delay }) {
  return (
    <div className="notif-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="notif-dot" style={{ background: dot }} />
      <div>
        <div className="notif-title">{title}</div>
        <div className="notif-msg">{msg}</div>
        <div className="notif-time">{time}</div>
      </div>
    </div>
  );
}

// ─── SECTIONS ────────────────────────────────────────────────────────────────
const SECTIONS = ["buttons", "cards", "forms", "stats", "pricing", "avatars", "notifications", "misc"];

export default function App() {
  const [activeSection, setActiveSection] = useState("buttons");
  const [inputVal, setInputVal] = useState("");

  const sectionRef = useRef(null);
  const scrollTo = (id) => {
    setActiveSection(id);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{css}</style>
      <div className="app-root">
        {/* Ambient blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="content">
          {/* Hero */}
          <div className="hero">
            <div className="hero-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.colors.mint, animation: "pulseDot 1.5s infinite" }} />
              React Component Library
            </div>
            <h1 className="hero-title">
              Build <span className="grad">Beautiful</span><br />Interfaces
            </h1>
            <p className="hero-sub">
              A living component library exploring React props, state, animations, and transitions.
            </p>
          </div>

          {/* Nav */}
          <div className="section-nav">
            {SECTIONS.map(s => (
              <button key={s} className={`nav-pill ${activeSection === s ? "active" : ""}`} onClick={() => scrollTo(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div ref={sectionRef} />

          {/* ── BUTTONS ── */}
          {activeSection === "buttons" && (
            <div className="section">
              <div className="section-title">Component 01</div>
              <h2 className="section-heading">Buttons & Actions</h2>
              <div className="glass" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                <RippleBtn className="btn-primary">Primary Action</RippleBtn>
                <RippleBtn className="btn-outline">Outlined</RippleBtn>
                <RippleBtn className="btn-ghost">Ghost Button</RippleBtn>
                <RippleBtn className="btn-glow">✦ Glow Effect</RippleBtn>
                <RippleBtn className="btn-danger">Delete</RippleBtn>
                <RippleBtn className="btn-primary btn-sm">Small</RippleBtn>
                <RippleBtn className="btn-primary btn-lg">Large</RippleBtn>
              </div>
              <div style={{ height: 20 }} />
              <div className="glass">
                <p style={{ fontSize: 13, color: tokens.colors.muted, marginBottom: 16 }}>With Icons & Tooltips</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                  <div className="tooltip-wrap">
                    <RippleBtn className="btn-primary">🚀 Launch</RippleBtn>
                    <div className="tooltip-box">Deploys to production</div>
                  </div>
                  <div className="tooltip-wrap">
                    <RippleBtn className="btn-outline">💾 Save Draft</RippleBtn>
                    <div className="tooltip-box">Ctrl + S</div>
                  </div>
                  <div className="tooltip-wrap">
                    <RippleBtn className="btn-ghost">📤 Export</RippleBtn>
                    <div className="tooltip-box">Download as .csv</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CARDS ── */}
          {activeSection === "cards" && (
            <div className="section">
              <div className="section-title">Component 02</div>
              <h2 className="section-heading">Feature Cards</h2>
              <div className="demo-grid demo-grid-3">
                <FeatureCard icon="⚡" title="Blazing Fast" desc="Optimised rendering with React's virtual DOM. Components update only what changed, keeping your UI snappy." accentColor={tokens.colors.amber} delay={0} />
                <FeatureCard icon="🎨" title="Fully Styled" desc="Every component ships with a cohesive dark theme, smooth transitions, and thoughtful micro-interactions." accentColor={tokens.colors.violet} delay={100} />
                <FeatureCard icon="🔒" title="Type Safe" desc="Built with TypeScript at its core. Props are strictly typed so you catch bugs at compile time, not runtime." accentColor={tokens.colors.cyan} delay={200} />
                <FeatureCard icon="♿" title="Accessible" desc="WCAG 2.1 AA compliant. Keyboard navigation, ARIA labels, and focus management built in by default." accentColor={tokens.colors.mint} delay={300} />
                <FeatureCard icon="📱" title="Responsive" desc="Fluid grids and container queries ensure your layouts look perfect from 320px to 4K widescreen." accentColor={tokens.colors.rose} delay={400} />
                <FeatureCard icon="🧩" title="Composable" desc="Small, focused primitives that compose together. Build complex UIs from simple, predictable pieces." accentColor={tokens.colors.indigo} delay={500} />
              </div>
            </div>
          )}

          {/* ── FORMS ── */}
          {activeSection === "forms" && (
            <div className="section">
              <div className="section-title">Component 03</div>
              <h2 className="section-heading">Forms & Controls</h2>
              <div className="demo-grid demo-grid-2">
                <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Create Account</p>
                  <div className="input-wrap">
                    <label className="input-label">Full Name</label>
                    <input className="input" placeholder="Alex Johnson" />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Email</label>
                    <input className="input" type="email" placeholder="alex@example.com" value={inputVal} onChange={e => setInputVal(e.target.value)} />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Password</label>
                    <input className="input" type="password" placeholder="••••••••••" />
                  </div>
                  <RippleBtn className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Create Account</RippleBtn>
                </div>
                <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Preferences</p>
                  <Toggle label="Email Notifications" desc="Get updates on activity" defaultOn={true} color={tokens.colors.violet} />
                  <Toggle label="Two-Factor Auth" desc="Extra security for your account" defaultOn={false} color={tokens.colors.cyan} />
                  <Toggle label="Dark Mode" desc="Easy on the eyes" defaultOn={true} color={tokens.colors.rose} />
                  <Toggle label="Public Profile" desc="Let others discover you" defaultOn={false} color={tokens.colors.mint} />
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 16 }}>
                    <p style={{ fontSize: 13, color: tokens.colors.muted, marginBottom: 12 }}>Filter by stack</p>
                    <ChipGroup />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          {activeSection === "stats" && (
            <div className="section">
              <div className="section-title">Component 04</div>
              <h2 className="section-heading">Metrics & Progress</h2>
              <div className="demo-grid demo-grid-4" style={{ marginBottom: 24 }}>
                <StatCard num={48291} label="Total Users" delta="12.4%" deltaUp color={tokens.colors.violet} />
                <StatCard num={9841} label="Active Today" delta="3.1%" deltaUp color={tokens.colors.cyan} />
                <StatCard num={124} suffix="K" label="API Calls" delta="0.5%" color={tokens.colors.amber} />
                <StatCard num={99} suffix="%" label="Uptime" delta="0.01%" deltaUp color={tokens.colors.mint} />
              </div>
              <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Stack Proficiency</p>
                <ProgressBar label="React / Next.js" value={92} color={tokens.colors.cyan} />
                <ProgressBar label="TypeScript" value={85} color={tokens.colors.violet} />
                <ProgressBar label="Node.js / Express" value={78} color={tokens.colors.mint} />
                <ProgressBar label="GraphQL" value={65} color={tokens.colors.rose} />
                <ProgressBar label="AWS / Cloud" value={54} color={tokens.colors.amber} />
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {activeSection === "pricing" && (
            <div className="section">
              <div className="section-title">Component 05</div>
              <h2 className="section-heading">Pricing Cards</h2>
              <div className="demo-grid demo-grid-3">
                <PricingCard name="Starter" price="0" period="month" color={tokens.colors.muted} delay={0}
                  features={[
                    { label: "5 Projects", included: true },
                    { label: "2GB Storage", included: true },
                    { label: "Community Support", included: true },
                    { label: "Custom Domain", included: false },
                    { label: "Team Collaboration", included: false },
                  ]} />
                <PricingCard name="Pro" price="29" period="month" color={tokens.colors.violet} featured delay={100}
                  features={[
                    { label: "Unlimited Projects", included: true },
                    { label: "50GB Storage", included: true },
                    { label: "Priority Support", included: true },
                    { label: "Custom Domain", included: true },
                    { label: "Team Collaboration", included: false },
                  ]} />
                <PricingCard name="Enterprise" price="99" period="month" color={tokens.colors.cyan} delay={200}
                  features={[
                    { label: "Unlimited Projects", included: true },
                    { label: "500GB Storage", included: true },
                    { label: "Dedicated Support", included: true },
                    { label: "Custom Domain", included: true },
                    { label: "Team Collaboration", included: true },
                  ]} />
              </div>
            </div>
          )}

          {/* ── AVATARS ── */}
          {activeSection === "avatars" && (
            <div className="section">
              <div className="section-title">Component 06</div>
              <h2 className="section-heading">Avatars & Badges</h2>
              <div className="demo-grid demo-grid-2">
                <div className="glass">
                  <p style={{ fontSize: 13, color: tokens.colors.muted, marginBottom: 20 }}>Avatar Sizes</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                    <Avatar initials="AJ" size="sm" bg="linear-gradient(135deg, #7C5CFC, #4F8AFF)" />
                    <Avatar initials="AJ" size="md" bg="linear-gradient(135deg, #FF4D8D, #FFB800)" />
                    <Avatar initials="AJ" size="lg" bg="linear-gradient(135deg, #00E5FF, #00FFB2)" />
                    <Avatar initials="AJ" size="xl" bg="linear-gradient(135deg, #7C5CFC, #FF4D8D)" online />
                  </div>
                </div>
                <div className="glass">
                  <p style={{ fontSize: 13, color: tokens.colors.muted, marginBottom: 20 }}>Avatar Stack</p>
                  <div className="avatar-stack" style={{ marginBottom: 20 }}>
                    {[["MR","#7C5CFC"],["TK","#FF4D8D"],["AS","#00E5FF"],["JL","#FFB800"],["ZP","#00FFB2"]].map(([i,c]) => (
                      <Avatar key={i} initials={i} size="md" bg={c} />
                    ))}
                    <div className="avatar avatar-md" style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(124,92,252,0.4)", marginLeft: -12, fontSize: 12, color: tokens.colors.muted }}>+12</div>
                  </div>
                </div>
                <div className="glass">
                  <p style={{ fontSize: 13, color: tokens.colors.muted, marginBottom: 16 }}>Status Badges</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <span className="badge badge-violet badge-pulse">Active</span>
                    <span className="badge badge-cyan">Beta</span>
                    <span className="badge badge-rose badge-pulse">Live</span>
                    <span className="badge badge-mint">Verified</span>
                    <span className="badge badge-amber">Pending</span>
                  </div>
                </div>
                <div className="glass">
                  <p style={{ fontSize: 13, color: tokens.colors.muted, marginBottom: 16 }}>Tabs & Dropdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <TabsDemo />
                    <DropdownDemo />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className="section">
              <div className="section-title">Component 07</div>
              <h2 className="section-heading">Notifications</h2>
              <div className="demo-grid demo-grid-2">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <NotifCard dot={tokens.colors.violet} title="New Comment" msg="Priya left a comment on your pull request #412" time="2 min ago" delay={0} />
                  <NotifCard dot={tokens.colors.cyan} title="Deploy Successful" msg="production-v2.4.1 deployed to all regions" time="15 min ago" delay={100} />
                  <NotifCard dot={tokens.colors.rose} title="Payment Failed" msg="Card ending in 4242 was declined. Please update." time="1 hr ago" delay={200} />
                  <NotifCard dot={tokens.colors.mint} title="Goal Achieved 🎉" msg="Your app just crossed 10,000 active users!" time="3 hrs ago" delay={300} />
                  <NotifCard dot={tokens.colors.amber} title="Storage Warning" msg="You've used 85% of your 50GB plan" time="Yesterday" delay={400} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Loading Skeletons</p>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            </div>
          )}

          {/* ── MISC ── */}
          {activeSection === "misc" && (
            <div className="section">
              <div className="section-title">Component 08</div>
              <h2 className="section-heading">Miscellaneous</h2>
              <div className="demo-grid demo-grid-2">
                <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Tag Cloud</p>
                  <ChipGroup />
                </div>
                <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Gradient Text Cards</p>
                  {[
                    ["Innovate", `linear-gradient(135deg, ${tokens.colors.violet}, ${tokens.colors.cyan})`],
                    ["Create", `linear-gradient(135deg, ${tokens.colors.rose}, ${tokens.colors.amber})`],
                    ["Ship", `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.indigo})`],
                  ].map(([word, grad]) => (
                    <div key={word} style={{
                      fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800,
                      background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      backgroundClip: "text", lineHeight: 1.2
                    }}>{word}</div>
                  ))}
                </div>
                <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Animated Border Card</p>
                  {["violet","cyan","rose"].map(name => {
                    const c = tokens.colors[name];
                    return (
                      <div key={name} style={{
                        padding: "14px 18px", borderRadius: 12,
                        border: `1px solid ${c}55`,
                        background: `${c}0d`,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        transition: "all 0.25s ease",
                      }}>
                        <span style={{ fontSize: 14 }}>{name.charAt(0).toUpperCase() + name.slice(1)} accent</span>
                        <span className="badge" style={{ background: `${c}22`, color: c, border: `1px solid ${c}55`, padding: "3px 10px", borderRadius: 100, fontSize: 11 }}>active</span>
                      </div>
                    );
                  })}
                </div>
                <div className="glass" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>All Tooltips</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {[["✦ Deploy","Push to prod"],["⚙ Config","Open settings"],["📋 Copy","Copy to clipboard"],["↗ Share","Share link"]].map(([l,t]) => (
                      <div key={l} className="tooltip-wrap">
                        <RippleBtn className="btn-ghost btn-sm">{l}</RippleBtn>
                        <div className="tooltip-box">{t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="demo-footer">
            React Component Library — Props · State · Animations · Transitions
          </div>
        </div>
      </div>
    </>
  );
}
