"use client";
import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import * as THREE from "three";
import { Search, User, Heart, ShoppingBag, X, ArrowLeft, ArrowRight, Menu } from "lucide-react";

/* ----------------------------------------------------------------
   GENVAULT — design tokens
   Palette: bone / ink / charcoal / washed grey / vault olive accent
   Display: condensed grotesk (Oswald-ish via system fallback stack
   simulated with letter-spacing + weight since no external font
   loading is guaranteed) — using "Archivo Narrow"/"Bebas"-style
   stack, body: Inter-style stack, mono utility: JetBrains-style stack
------------------------------------------------------------------- */

const TOKENS = {
  bone: "#EDEAE2",
  boneDim: "#E2DED3",
  ink: "#0B0B0A",
  charcoal: "#171615",
  ash: "#8B8A83",
  washed: "#B9B6AC",
  beige: "#C7BFAC",
  olive: "#4B4E36",
  oliveLight: "#6B6E4E",
  line: "rgba(11,11,10,0.12)",
  lineOnDark: "rgba(237,234,226,0.14)",
};

const CATS = ["All", "Tees", "Shirts", "Hoodies", "Jackets", "Pants", "Vintage", "Y2K", "New Drops"];
const INR_PER_USD = 95.21;
const CurrencyContext = React.createContext((amount) => `₹${amount}`);

const GRADIENTS = {
  rust: "linear-gradient(155deg,#6b5744 0%,#3f342a 55%,#8a7256 100%)",
  olive: "linear-gradient(155deg,#565a3d 0%,#2c2e1f 55%,#75774f 100%)",
  silver: "linear-gradient(155deg,#8d8d88 0%,#3a3a38 55%,#b9b8b0 100%)",
  bone: "linear-gradient(155deg,#d9d3c2 0%,#a89f8a 55%,#e8e3d6 100%)",
  metal: "linear-gradient(155deg,#9a9691 0%,#2a2a29 45%,#c9c6bd 75%,#57544e 100%)",
  denim: "linear-gradient(155deg,#5c6572 0%,#2c313a 55%,#7c8794 100%)",
  clay: "linear-gradient(155deg,#a99271 0%,#544732 55%,#c2ac86 100%)",
  smoke: "linear-gradient(155deg,#6f6d68 0%,#2a2927 55%,#9a978e 100%)",
};

const productMediaStyle = (product) => product.image
  ? { backgroundImage: `url("${product.image}")`, backgroundSize: "cover", backgroundPosition: "center" }
  : { background: product.grad };

const PRODUCTS = [
  { id: 1, name: "Oversized Flannel — 90s Wash", cat: "Shirts", tags: ["Vintage"], price: 1299, size: "M", condition: "Excellent", grad: GRADIENTS.rust, image: "/images/products/flannel-90s.jpeg", one: false, stock: 3, code: "GV-014" },
  { id: 2, name: "Vault Cargo Pants", cat: "Pants", tags: ["New Drops"], price: 1799, size: "32", condition: "Good", grad: GRADIENTS.olive, image: "/images/products/cargo-pants.jpeg", one: false, stock: 2, code: "GV-027" },
  { id: 3, name: "Y2K Zip Hoodie", cat: "Hoodies", tags: ["Y2K"], price: 1599, size: "L", condition: "Excellent", grad: GRADIENTS.silver, image: "/images/products/y2k-hoodie.jpeg", one: false, stock: 4, code: "GV-031" },
  { id: 4, name: "Archive Tee — Blank 90s", cat: "Tees", tags: ["Vintage"], price: 699, size: "M", condition: "Good", grad: GRADIENTS.bone, image: "https://i.pinimg.com/736x/59/19/e4/5919e42c81aecaaa59bd1a9a8398f28e.jpg", one: false, stock: 6, code: "GV-006" },
  { id: 5, name: "Silver Buckle Jacket", cat: "Jackets", tags: ["Rare"], price: 4999, size: "L", condition: "One of One", grad: GRADIENTS.metal, one: true, stock: 1, code: "GV-002" },
  { id: 6, name: "Faded Denim Trucker", cat: "Jackets", tags: ["Vintage"], price: 2199, size: "M", condition: "Excellent", grad: GRADIENTS.denim, one: false, stock: 2, code: "GV-019" },
  { id: 7, name: "Wide Leg Trousers", cat: "Pants", tags: ["New Drops"], price: 1349, size: "30", condition: "Good", grad: GRADIENTS.clay, one: false, stock: 3, code: "GV-041" },
  { id: 8, name: "Mesh Layer Longsleeve", cat: "Tees", tags: ["Y2K"], price: 899, size: "S", condition: "Excellent", grad: GRADIENTS.smoke, one: false, stock: 1, code: "GV-009" },
];

const COLLECTIONS = [
  { key: "summer", title: "Summer Archive", line: "Lightweight pieces, relaxed silhouettes.", grad: GRADIENTS.bone, image: "/images/products/archive-2.jpg" },
  { key: "y2k", title: "Y2K Vault", line: "Vintage-inspired, low-rise, chrome era.", grad: GRADIENTS.silver },
  { key: "dark", title: "After Dark", line: "Oversized fits, deep tonal layering.", grad: GRADIENTS.smoke },
  { key: "rare", title: "Rare Finds", line: "One-of-one pieces. Once gone, gone.", grad: GRADIENTS.metal },
];

const JOURNAL = [
  { title: "Why Thrifted Pieces Hit Different", cat: "Thrift", excerpt: "The case for clothes with a past — and how to find the ones worth keeping.", read: "4 min", grad: GRADIENTS.clay },
  { title: "5 Ways to Style Oversized Tees", cat: "Style", excerpt: "Proportion rules for making one tee do five different jobs.", read: "3 min", grad: GRADIENTS.olive },
  { title: "The Return of Y2K Streetwear", cat: "Trends", excerpt: "Low-rise is back. Here's what's worth buying and what to skip.", read: "5 min", grad: GRADIENTS.denim },
];

/* ---------------- Custom cursor (desktop only) ---------------- */
function CustomCursor() {
  const dotRef = useRef(null);
  const [big, setBig] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%) scale(${big ? 2.6 : 1})`;
      }
    };
    const enter = () => setBig(true);
    const leave = () => setBig(false);
    window.addEventListener("mousemove", move);
    document.querySelectorAll("[data-cursor-hover]").forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => window.removeEventListener("mousemove", move);
  }, [big]);
  return (
    <div
      ref={dotRef}
      className="gv-cursor"
      style={{ transform: `translate(-100px,-100px) scale(${big ? 2.6 : 1})` }}
    />
  );
}

/* ---------------- Reveal-on-scroll wrapper ---------------- */
function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "200px" }
    );
    if (ref.current) obs.observe(ref.current);
    const fallback = setTimeout(() => setShown(true), 1200);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0px)" : "translateY(28px)",
        transition: `opacity 0.9s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.9s cubic-bezier(.16,1,.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Animated headline (word-by-word) ---------------- */
function HeadlineReveal({ text, className }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.28em" }}>
          <span
            style={{
              display: "inline-block",
              animation: `gv-word-up 0.9s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.09}s both`,
            }}
          >
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ---------------- 3D floating Vault object (vanilla three.js) ---------------- */
function VaultObject() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Outer ring — the "vault door"
    const ringGeo = new THREE.TorusGeometry(1.9, 0.055, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xc9c6bd, metalness: 0.85, roughness: 0.28 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    const ring2Geo = new THREE.TorusGeometry(1.55, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x8f8c85, metalness: 0.9, roughness: 0.35 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2.4;
    group.add(ring2);

    // Inner faceted core
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 0);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x2c2b28, metalness: 0.6, roughness: 0.45, flatShading: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Spokes
    const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.4, 8);
    for (let i = 0; i < 6; i++) {
      const spoke = new THREE.Mesh(spokeGeo, ring2Mat);
      spoke.rotation.z = (Math.PI / 3) * i;
      group.add(spoke);
    }

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb9b6ac, 0.9);
    fill.position.set(-4, -2, 2);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0x404040, 1.1));

    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.22 + mouseX * 0.4;
      group.rotation.x = Math.sin(t * 0.3) * 0.12 + mouseY * 0.25;
      core.rotation.y = -t * 0.4;
      core.rotation.x = t * 0.25;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
      ringGeo.dispose(); ringMat.dispose();
      ring2Geo.dispose(); ring2Mat.dispose();
      coreGeo.dispose(); coreMat.dispose();
      spokeGeo.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

/* ---------------- Product Card ---------------- */
function ProductCard({ p, onOpen, onQuickAdd }) {
  const formatPrice = useContext(CurrencyContext);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [added, setAdded] = useState(false);
  const handleMove = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };
  return (
    <div
      className="gv-card"
      ref={cardRef}
      data-cursor-hover
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={() => onOpen(p)}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <div className="gv-card-img" style={productMediaStyle(p)}>
        {p.one && <span className="gv-badge gv-badge-solid">ONE OF ONE</span>}
        {!p.one && p.stock <= 2 && <span className="gv-badge">ONLY {p.stock} LEFT</span>}
        <div className="gv-card-overlay">
          <button
            className="gv-quickadd"
            disabled={p.stock <= 0}
            onClick={(event) => {
              event.stopPropagation();
              if (p.stock <= 0) return;
              onQuickAdd({ ...p, size: p.size });
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1400);
            }}
          >{p.stock <= 0 ? "Sold out" : added ? "Added ✓" : "Quick Add"}</button>
        </div>
      </div>
      <div className="gv-card-info">
        <div className="gv-card-top">
          <span className="gv-label">{p.code}</span>
          <span className="gv-label">{p.condition}</span>
        </div>
        <h3 className="gv-card-name">{p.name}</h3>
        <div className="gv-card-bottom">
          <span>{formatPrice(p.price)}</span>
          <span className="gv-ash">Size {p.size}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav({ view, setView, scrolled, cartCount, onCart, onSearch, onAccount, onFavorites, menuOpen, setMenuOpen }) {
  return (
    <>
      <header className={`gv-nav ${scrolled ? "gv-nav-scrolled" : ""}`}>
        <div className="gv-nav-inner">
          <button className="gv-nav-burger" data-cursor-hover onClick={() => setMenuOpen(true)}>
            <Menu size={18} strokeWidth={1.5} />
          </button>
          <button className="gv-wordmark" data-cursor-hover onClick={() => setView("home")}>GENVAULT</button>
          <nav className="gv-nav-links">
            <button data-cursor-hover className={view === "home" ? "gv-active" : ""} onClick={() => setView("home")}>Home</button>
            <button data-cursor-hover className={view === "shop" ? "gv-active" : ""} onClick={() => setView("shop")}>Shop</button>
            <button data-cursor-hover onClick={() => setView("journal")} className={view === "journal" ? "gv-active" : ""}>Journal</button>
            <button data-cursor-hover onClick={() => setView("about")} className={view === "about" ? "gv-active" : ""}>About</button>
          </nav>
          <div className="gv-nav-icons">
            <button data-cursor-hover aria-label="Search products" onClick={onSearch}><Search size={17} strokeWidth={1.5} /></button>
            <button data-cursor-hover aria-label="Account" onClick={onAccount}><User size={17} strokeWidth={1.5} /></button>
            <button data-cursor-hover aria-label="Favorites" onClick={onFavorites}><Heart size={17} strokeWidth={1.5} /></button>
            <button data-cursor-hover aria-label="Cart" onClick={onCart} className="gv-cart-btn">
              <ShoppingBag size={17} strokeWidth={1.5} />
              {cartCount > 0 && <span className="gv-cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
      <div className={`gv-mobile-menu ${menuOpen ? "gv-mobile-open" : ""}`}>
        <button className="gv-mobile-close" onClick={() => setMenuOpen(false)} data-cursor-hover><X size={20} /></button>
        {["home", "shop", "journal", "about"].map((v) => (
          <button key={v} className="gv-mobile-link" onClick={() => { setView(v); setMenuOpen(false); }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------- Cart Drawer ---------------- */
function CartDrawer({ open, onClose, items, onRemove, onCheckout }) {
  const formatPrice = useContext(CurrencyContext);
  const total = items.reduce((s, i) => s + i.price, 0);
  return (
    <>
      <div className={`gv-scrim ${open ? "gv-scrim-show" : ""}`} onClick={onClose} />
      <aside className={`gv-drawer ${open ? "gv-drawer-open" : ""}`}>
        <div className="gv-drawer-head">
          <span className="gv-label">YOUR VAULT ({items.length})</span>
          <button onClick={onClose} data-cursor-hover><X size={18} /></button>
        </div>
        <div className="gv-drawer-items">
          {items.length === 0 && <p className="gv-ash" style={{ padding: "40px 0", fontSize: 13 }}>Nothing in here yet — every piece is one of few.</p>}
          {items.map((it, idx) => (
            <div className="gv-drawer-item" key={idx}>
              <div className="gv-drawer-thumb" style={productMediaStyle(it)} />
              <div style={{ flex: 1 }}>
                <div className="gv-card-name" style={{ fontSize: 13 }}>{it.name}</div>
                <div className="gv-ash" style={{ fontSize: 12, marginTop: 4 }}>Size {it.size} · {formatPrice(it.price)}</div>
              </div>
              <button className="gv-drawer-remove" onClick={() => onRemove(idx)} data-cursor-hover>Remove</button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="gv-drawer-foot">
            <div className="gv-drawer-total"><span>Total</span><span>{formatPrice(total)}</span></div>
            <button className="gv-btn-solid" style={{ width: "100%" }} onClick={onCheckout}>Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------- Checkout ---------------- */
function CheckoutDrawer({ open, onClose, items, user, onOpenAccount, onComplete }) {
  const formatPrice = useContext(CurrencyContext);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    if (!user) { onClose(); onOpenAccount(); return; }
    setError(""); setBusy(true);
    const grouped = items.reduce((lines, item) => {
      const key = `${item.id}:${item.size}`;
      lines[key] ||= { product_id: String(item.id), size: item.size, quantity: 0 };
      lines[key].quantity += 1;
      return lines;
    }, {});
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: Object.values(grouped), contact_email: email, shipping_address: { name, address, city, pincode, country: "India" } }) });
      const responseText = await response.text();
      let body = null;
      try { body = responseText ? JSON.parse(responseText) : null; } catch { /* handled below */ }
      if (!response.ok) throw new Error(body?.error || "Checkout is unavailable. Please try again after the store backend is configured.");
      if (!body?.order) throw new Error("Checkout returned an invalid response. Please try again.");
      setComplete(true); onComplete();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className={`gv-scrim ${open ? "gv-scrim-show" : ""}`} onClick={onClose} />
      <aside className={`gv-drawer ${open ? "gv-drawer-open" : ""}`} aria-label="Checkout">
        <div className="gv-drawer-head"><span className="gv-label">CHECKOUT</span><button onClick={onClose} aria-label="Close checkout"><X size={18} /></button></div>
        {complete ? <div className="gv-account-content"><h2 className="gv-h2" style={{ fontSize: 30 }}>Order received.</h2><p className="gv-ash">Your order is pending payment. Add your UPI QR or payment provider next to accept payment securely.</p><button className="gv-btn-solid" onClick={onClose}>Continue shopping</button></div> : !user ? <div className="gv-account-content"><h2 className="gv-h2" style={{ fontSize: 30 }}>Sign in to checkout.</h2><p className="gv-ash">Your account keeps your order and delivery details secure.</p><button className="gv-btn-solid" onClick={() => { onClose(); onOpenAccount(); }}>Sign in or create account</button></div> : <form className="gv-account-content" onSubmit={submit}>
          <p className="gv-ash">Order total: <strong style={{ color: TOKENS.ink }}>{formatPrice(total)}</strong></p>
          <input className="gv-account-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" type="email" required />
          <input className="gv-account-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required />
          <input className="gv-account-input" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street address" required />
          <div className="gv-checkout-row"><input className="gv-account-input" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" required /><input className="gv-account-input" value={pincode} onChange={(event) => setPincode(event.target.value)} placeholder="PIN code" required /></div>
          {error && <p className="gv-account-error">{error}</p>}
          <button className="gv-btn-solid" type="submit" disabled={busy}>{busy ? "Creating order…" : "Place order"}</button>
          <p className="gv-checkout-note">Payment will be requested after you place the order.</p>
        </form>}
      </aside>
    </>
  );
}

/* ---------------- Favorites ---------------- */
function FavoritesDrawer({ open, onClose, items, onRemove, onOpen }) {
  const formatPrice = useContext(CurrencyContext);
  return (
    <>
      <div className={`gv-scrim ${open ? "gv-scrim-show" : ""}`} onClick={onClose} />
      <aside className={`gv-drawer ${open ? "gv-drawer-open" : ""}`} aria-label="Favorite products">
        <div className="gv-drawer-head"><span className="gv-label">FAVORITES ({items.length})</span><button onClick={onClose} aria-label="Close favorites"><X size={18} /></button></div>
        <div className="gv-drawer-items">
          {items.length === 0 && <p className="gv-ash" style={{ padding: "40px 0", fontSize: 13 }}>Save pieces you love here for later.</p>}
          {items.map((item) => (
            <div className="gv-drawer-item" key={item.id}>
              <button className="gv-drawer-thumb gv-thumb-button" style={productMediaStyle(item)} onClick={() => { onOpen(item); onClose(); }} aria-label={`View ${item.name}`} />
              <div style={{ flex: 1 }}><div className="gv-card-name" style={{ fontSize: 13 }}>{item.name}</div><div className="gv-ash" style={{ fontSize: 12, marginTop: 4 }}>{formatPrice(item.price)}</div></div>
              <button className="gv-drawer-remove" onClick={() => onRemove(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

/* ---------------- Account ---------------- */
function AccountDrawer({ open, onClose, user, setUser }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "login" ? { email, password } : { email, password, full_name: name }) });
      const responseText = await response.text();
      let body = null;
      try { body = responseText ? JSON.parse(responseText) : null; } catch { /* handled below */ }
      if (!response.ok) throw new Error(body?.error || "Account service is unavailable. Configure Supabase and try again.");
      if (!body?.user) throw new Error("Account service returned an invalid response. Please try again.");
      setUser(body.user); onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); onClose(); };

  return (
    <>
      <div className={`gv-scrim ${open ? "gv-scrim-show" : ""}`} onClick={onClose} />
      <aside className={`gv-drawer ${open ? "gv-drawer-open" : ""}`} aria-label="Account">
        <div className="gv-drawer-head"><span className="gv-label">YOUR ACCOUNT</span><button onClick={onClose} aria-label="Close account"><X size={18} /></button></div>
        {user ? <div className="gv-account-content"><p className="gv-ash">Signed in as</p><p className="gv-card-name">{user.email}</p><button className="gv-btn-outline" onClick={logout}>Sign out</button></div> : <form className="gv-account-content" onSubmit={submit}>
          <h2 className="gv-h2" style={{ fontSize: 30 }}>{mode === "login" ? "Welcome back." : "Create account."}</h2>
          {mode === "signup" && <input className="gv-account-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" autoComplete="name" />}
          <input className="gv-account-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" type="email" autoComplete="email" required />
          <input className="gv-account-input" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          {error && <p className="gv-account-error">{error}</p>}
          <button className="gv-btn-solid" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
          <button className="gv-account-switch" type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
        </form>}
      </aside>
    </>
  );
}

/* ---------------- Home ---------------- */
function Home({ setView, openProduct, products, addToCart }) {
  return (
    <>
      <section className="gv-hero">
        <div className="gv-hero-grain" />
        <div className="gv-hero-vault"><VaultObject /></div>
        <div className="gv-hero-content">
          <span className="gv-eyebrow" style={{ animation: "gv-fade-in 0.8s ease both" }}>DROP 001 — THE SUMMER ARCHIVE</span>
          <h1 className="gv-hero-title">
            <HeadlineReveal text="FIND YOUR" />
            <br />
            <HeadlineReveal text="RARE." />
          </h1>
          <p className="gv-hero-sub" style={{ animation: "gv-fade-in 1s ease 0.9s both" }}>
            Curated thrift. One-of-one pieces. Built for your generation.
          </p>
          <div className="gv-hero-ctas" style={{ animation: "gv-fade-in 1s ease 1.1s both" }}>
            <button className="gv-btn-solid" data-cursor-hover onClick={() => setView("shop")}>Shop the Drop</button>
            <button className="gv-btn-outline" data-cursor-hover onClick={() => setView("shop")}>Explore Collection</button>
          </div>
        </div>
        <div className="gv-scroll-cue">SCROLL</div>
      </section>

      <section className="gv-marquee">
        <div className="gv-marquee-track">
          {Array(2).fill(0).map((_, r) => (
            <div className="gv-marquee-set" key={r}>
              {["NOT MASS PRODUCED", "ONE-TIME FINDS", "RARE PIECES", "YOUR STORY"].map((t, i) => (
                <span key={i}>{t} <span className="gv-marquee-dot">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <Reveal>
          <div className="gv-section-head">
            <span className="gv-eyebrow">COLLECTIONS</span>
            <h2 className="gv-h2">Four archives.<br />No two pieces alike.</h2>
          </div>
        </Reveal>
        <div className="gv-collections">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.key} delay={i * 0.08}>
              <button className="gv-collection" data-cursor-hover onClick={() => setView("shop")}>
                <div className="gv-collection-bg" style={c.image ? { backgroundImage: `url("${c.image}")`, backgroundSize: "cover", backgroundPosition: "center" } : { background: c.grad }} />
                <div className="gv-collection-info">
                  <h3>{c.title}</h3>
                  <p>{c.line}</p>
                  <span className="gv-arrow-link">Explore <ArrowRight size={13} /></span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="gv-section gv-featured">
        <Reveal>
          <div className="gv-section-head gv-section-head-row">
            <div>
              <span className="gv-eyebrow">FEATURED</span>
              <h2 className="gv-h2">This week's finds</h2>
            </div>
            <button className="gv-btn-outline" data-cursor-hover onClick={() => setView("shop")}>View All</button>
          </div>
        </Reveal>
        <div className="gv-grid">
          {products.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.07}>
              <ProductCard p={p} onOpen={openProduct} onQuickAdd={addToCart} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="gv-editorial">
        <Reveal className="gv-editorial-grid">
          <div className="gv-editorial-panel" style={{ background: GRADIENTS.clay }} />
          <div className="gv-editorial-copy">
            <span className="gv-eyebrow" style={{ color: TOKENS.bone }}>THE PHILOSOPHY</span>
            <h2 className="gv-h2" style={{ color: TOKENS.bone }}>Every piece already<br />has a story. Yours<br />is next.</h2>
            <p className="gv-editorial-text">
              GenVault is a curated archive of clothing that deserves a second life — sourced,
              sorted, and styled for a generation that doesn't want what everyone else is wearing.
            </p>
            <button className="gv-btn-outline gv-btn-outline-dark" data-cursor-hover onClick={() => setView("about")}>Our Story</button>
          </div>
        </Reveal>
      </section>

      <section className="gv-section">
        <Reveal>
          <div className="gv-section-head">
            <span className="gv-eyebrow">JOURNAL</span>
            <h2 className="gv-h2">From the archive</h2>
          </div>
        </Reveal>
        <div className="gv-journal-grid">
          {JOURNAL.map((j, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="gv-journal-card" data-cursor-hover onClick={() => setView("journal")}>
                <div className="gv-journal-img" style={{ background: j.grad }} />
                <span className="gv-label">{j.cat} · {j.read} read</span>
                <h3>{j.title}</h3>
                <p>{j.excerpt}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------------- Shop ---------------- */
function Shop({ openProduct, products, searchQuery, setSearchQuery, searchFocusNonce, addToCart }) {
  const [active, setActive] = useState("All");
  const searchRef = useRef(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, [searchFocusNonce]);

  const filtered = useMemo(
    () => products.filter((p) => {
      const matchesCategory = active === "All" || p.cat === active || p.tags.includes(active);
      const searchable = `${p.name} ${p.code} ${p.cat} ${p.tags.join(" ")}`.toLowerCase();
      return matchesCategory && searchable.includes(searchQuery.trim().toLowerCase());
    }),
    [active, products, searchQuery]
  );
  return (
    <section className="gv-shop">
      <div className="gv-shop-head">
        <span className="gv-eyebrow">SHOP</span>
        <h1 className="gv-h1">The Full Archive</h1>
      </div>
      <div className="gv-search-wrap">
        <Search size={17} strokeWidth={1.5} aria-hidden="true" />
        <input
          ref={searchRef}
          className="gv-search-input"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search pieces, collections, or codes"
          aria-label="Search products"
        />
        {searchQuery && <button className="gv-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search"><X size={15} /></button>}
      </div>
      <div className="gv-pills">
        {CATS.map((c) => (
          <button key={c} data-cursor-hover className={`gv-pill ${active === c ? "gv-pill-active" : ""}`} onClick={() => setActive(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="gv-grid">
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 0.06}>
            <ProductCard p={p} onOpen={openProduct} onQuickAdd={addToCart} />
          </Reveal>
        ))}
      </div>
      {filtered.length === 0 && <p className="gv-ash">No pieces in this category right now — check back for the next drop.</p>}
    </section>
  );
}

/* ---------------- Product Detail ---------------- */
function ProductDetail({ product, setView, addToCart, isFavorite, onToggleFavorite }) {
  const formatPrice = useContext(CurrencyContext);
  const [size, setSize] = useState(product.size);
  const [added, setAdded] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL"];
  return (
    <section className="gv-pdp">
      <button className="gv-back" data-cursor-hover onClick={() => setView("shop")}><ArrowLeft size={14} /> Back to Shop</button>
      <div className="gv-pdp-grid">
        <div className="gv-pdp-gallery">
          <div className="gv-pdp-main" style={productMediaStyle(product)}>
            {product.one && <span className="gv-badge gv-badge-solid">ONE OF ONE</span>}
          </div>
          <div className="gv-pdp-thumbs">
            {[0, 1, 2].map((i) => (
              <div key={i} className="gv-pdp-thumb" style={{ ...productMediaStyle(product), opacity: 0.55 + i * 0.15 }} />
            ))}
          </div>
        </div>
        <div className="gv-pdp-info">
          <span className="gv-label">{product.code} · {product.cat}</span>
          <h1 className="gv-h1" style={{ marginTop: 10 }}>{product.name}</h1>
          <div className="gv-pdp-price">{formatPrice(product.price)}</div>
          <p className="gv-ash" style={{ fontSize: 13, marginTop: -8 }}>
            {product.one ? "Only one exists — once it's gone, it's gone." : `${product.stock} left in this size.`}
          </p>

          <div className="gv-pdp-sizes">
            <span className="gv-label">SIZE</span>
            <div className="gv-size-row">
              {sizes.map((s) => (
                <button key={s} data-cursor-hover className={`gv-size-btn ${size === s ? "gv-size-active" : ""}`} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="gv-pdp-actions">
            <button
              className="gv-btn-solid"
              data-cursor-hover
              onClick={() => { addToCart({ ...product, size }); setAdded(true); setTimeout(() => setAdded(false), 1600); }}
              style={{ flex: 1 }}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <button className="gv-btn-outline" data-cursor-hover style={{ flex: 1 }}>Buy Now</button>
            <button className={`gv-icon-btn ${isFavorite ? "gv-favorite-active" : ""}`} data-cursor-hover aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} onClick={() => onToggleFavorite(product.id)}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} /></button>
          </div>

          <div className="gv-pdp-piece">
            <h3 className="gv-eyebrow">THE PIECE</h3>
            <ul>
              <li><b>Condition</b> — {product.condition}, inspected by hand.</li>
              <li><b>Era / Style</b> — Sourced for {product.tags.join(", ")} character.</li>
              <li><b>Measurements</b> — Pit-to-pit 24in · Length 29in (fits true to size {product.size}).</li>
              <li><b>Material</b> — Cotton-blend, pre-loved and pre-washed.</li>
              <li><b>Notes</b> — Light fading consistent with age; no structural flaws.</li>
            </ul>
          </div>

          <div className="gv-pdp-ship">
            <span className="gv-label">SHIPPING</span>
            <p>Ships in 2–4 business days. Every GenVault piece is one physical item — what you see is exactly what ships.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Journal page ---------------- */
function JournalPage() {
  const all = [...JOURNAL, { title: "How to Build a Summer Wardrobe Without Looking Basic", cat: "Fashion Guides", excerpt: "A short, opinionated list of pieces worth owning this season.", read: "6 min", grad: GRADIENTS.denim }];
  return (
    <section className="gv-section">
      <div className="gv-section-head">
        <span className="gv-eyebrow">JOURNAL</span>
        <h1 className="gv-h1">Notes from the Vault</h1>
      </div>
      <div className="gv-journal-grid">
        {all.map((j, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <div className="gv-journal-card" data-cursor-hover>
              <div className="gv-journal-img" style={{ background: j.grad }} />
              <span className="gv-label">{j.cat} · {j.read} read</span>
              <h3>{j.title}</h3>
              <p>{j.excerpt}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- About page ---------------- */
function AboutPage() {
  return (
    <section className="gv-about">
      <Reveal>
        <span className="gv-eyebrow">ABOUT</span>
        <h1 className="gv-h1" style={{ maxWidth: 700 }}>GenVault is a curated archive of pieces that deserve a second life.</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="gv-about-grid">
          <div className="gv-about-panel" style={{ background: GRADIENTS.olive }} />
          <div className="gv-about-copy">
            <p>We go looking for clothing with character — pieces that were made well, worn in, and forgotten in the wrong closet. Every item is inspected, measured, and photographed by hand before it goes up.</p>
            <p>Nothing here is reprinted. Nothing here is restocked. When a size sells out, it's gone — that's the trade-off of shopping something rare instead of something mass produced.</p>
            <p>It's slower than buying new. We think that's the point.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ setView }) {
  return (
    <footer className="gv-footer">
      <div className="gv-footer-top">
        <div>
          <span className="gv-wordmark" style={{ color: TOKENS.bone, fontSize: 22 }}>GENVAULT</span>
          <p className="gv-footer-tag">Rare pieces. Your story.</p>
        </div>
        <div className="gv-newsletter">
          <span className="gv-eyebrow" style={{ color: TOKENS.bone }}>GET INSIDE THE VAULT</span>
          <div className="gv-newsletter-row">
            <input placeholder="Email address" />
            <button data-cursor-hover>Subscribe</button>
          </div>
        </div>
      </div>
      <div className="gv-footer-cols">
        <div>
          <span className="gv-label">SHOP</span>
          <button onClick={() => setView("shop")}>All Products</button>
          <button onClick={() => setView("shop")}>New Drops</button>
          <button onClick={() => setView("shop")}>Collections</button>
        </div>
        <div>
          <span className="gv-label">COMPANY</span>
          <button onClick={() => setView("about")}>About</button>
          <button onClick={() => setView("journal")}>Journal</button>
          <button>Contact</button>
        </div>
        <div>
          <span className="gv-label">SUPPORT</span>
          <button>FAQ</button>
          <button>Shipping</button>
          <button>Returns</button>
        </div>
        <div>
          <span className="gv-label">SOCIAL</span>
          <button>Instagram</button>
          <button>TikTok</button>
          <button>Pinterest</button>
        </div>
      </div>
      <div className="gv-footer-bottom">
        <span>© {new Date().getFullYear()} GenVault. All rights reserved.</span>
        <span>Demo storefront — placeholder content.</span>
      </div>
    </footer>
  );
}

/* ---------------- Loading screen ---------------- */
function Loader({ done }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPct((p) => (p < 96 ? p + Math.random() * 14 : p)), 110);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`gv-loader ${done ? "gv-loader-out" : ""}`}>
      <span className="gv-loader-word">GENVAULT</span>
      <div className="gv-loader-bar"><div className="gv-loader-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
      <span className="gv-loader-pct">{Math.min(Math.round(pct), 99)}%</span>
    </div>
  );
}

/* ---------------- Live backend wiring ----------------
   On mount, try the real API (/api/products). If Supabase isn't
   configured yet (or the request fails), fall back to the local
   PRODUCTS demo array below so the site still runs standalone. */
const GRADIENT_KEYS = Object.keys(GRADIENTS);
function mapApiProduct(p, i) {
  return {
    id: p.id,
    name: p.name,
    cat: p.category?.name || "Tees",
    tags: p.tags || [],
    price: Math.round((p.price_paise || 0) / 100),
    size: p.size || "M",
    condition: p.condition || "Good",
    grad: GRADIENTS[GRADIENT_KEYS[i % GRADIENT_KEYS.length]],
    one: p.is_one_of_one,
    stock: p.stock ?? 1,
    code: (p.slug || p.id || "GV").toString().slice(0, 8).toUpperCase(),
  };
}

function useProducts() {
  const [products, setProducts] = useState(PRODUCTS);
  const [source, setSource] = useState("demo"); // 'demo' | 'live'
  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.products?.length) {
          setProducts(data.products.map(mapApiProduct));
          setSource("live");
        }
      })
      .catch(() => {
        /* Supabase not configured / offline — keep demo data */
      });
    return () => { cancelled = true; };
  }, []);
  return { products, source };
}

/* ---------------- App ---------------- */
export default function App() {
  const [view, setViewRaw] = useState("home");
  const [product, setProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocusNonce, setSearchFocusNonce] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const mainRef = useRef(null);
  const { products } = useProducts();

  useEffect(() => {
    try { setFavoriteIds(JSON.parse(window.localStorage.getItem("gv-favorites") || "[]")); } catch { setFavoriteIds([]); }
  }, []);

  useEffect(() => { window.localStorage.setItem("gv-favorites", JSON.stringify(favoriteIds)); }, [favoriteIds]);

  useEffect(() => {
    const fallbackCurrency = Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata" || navigator.language?.toLowerCase() === "en-in" ? "INR" : "USD";
    fetch("/api/currency").then((response) => response.ok ? response.json() : null).then((data) => setCurrency(data?.currency || fallbackCurrency)).catch(() => setCurrency(fallbackCurrency));
  }, []);

  const formatPrice = useMemo(() => (inrAmount) => new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency", currency, minimumFractionDigits: currency === "INR" ? 0 : 2, maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(currency === "INR" ? inrAmount : inrAmount / INR_PER_USD), [currency]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled((mainRef.current?.scrollTop || 0) > 40);
    const el = mainRef.current;
    el && el.addEventListener("scroll", onScroll);
    return () => el && el.removeEventListener("scroll", onScroll);
  }, []);

  const setView = (v) => {
    setViewRaw(v);
    mainRef.current && mainRef.current.scrollTo({ top: 0 });
  };

  const openSearch = () => {
    setView("shop");
    setSearchFocusNonce((value) => value + 1);
  };

  const openProduct = (p) => { setProduct(p); setView("product"); };
  const addToCart = (item) => setCart((c) => [...c, item]);
  const removeFromCart = (idx) => setCart((c) => c.filter((_, i) => i !== idx));
  const toggleFavorite = (id) => setFavoriteIds((ids) => ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id]);
  const favoriteProducts = products.filter((item) => favoriteIds.includes(item.id));

  return (
    <CurrencyContext.Provider value={formatPrice}><div className="gv-root">
      <style>{CSS}</style>
      {loading && <Loader done={!loading} />}
      <CustomCursor />
      <Nav view={view} setView={setView} scrolled={scrolled} cartCount={cart.length} onCart={() => setCartOpen(true)} onSearch={openSearch} onAccount={() => setAccountOpen(true)} onFavorites={() => setFavoritesOpen(true)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)} items={cart} user={user} onOpenAccount={() => setAccountOpen(true)} onComplete={() => setCart([])} />
      <FavoritesDrawer open={favoritesOpen} onClose={() => setFavoritesOpen(false)} items={favoriteProducts} onRemove={toggleFavorite} onOpen={openProduct} />
      <AccountDrawer open={accountOpen} onClose={() => setAccountOpen(false)} user={user} setUser={setUser} />
      <main className="gv-main" ref={mainRef}>
        {view === "home" && <Home setView={setView} openProduct={openProduct} products={products} addToCart={addToCart} />}
        {view === "shop" && <Shop openProduct={openProduct} products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchFocusNonce={searchFocusNonce} addToCart={addToCart} />}
        {view === "product" && product && <ProductDetail product={product} setView={setView} addToCart={addToCart} isFavorite={favoriteIds.includes(product.id)} onToggleFavorite={toggleFavorite} />}
        {view === "journal" && <JournalPage />}
        {view === "about" && <AboutPage />}
        <Footer setView={setView} />
      </main>
    </div></CurrencyContext.Provider>
  );
}

/* ---------------- CSS ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }
.gv-root {
  --bone: ${TOKENS.bone}; --ink: ${TOKENS.ink}; --charcoal: ${TOKENS.charcoal};
  --ash: ${TOKENS.ash}; --washed: ${TOKENS.washed}; --olive: ${TOKENS.olive};
  --line: ${TOKENS.line};
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bone);
  color: var(--ink);
  position: relative;
  height: 100vh;
  overflow: hidden;
  isolation: isolate;
}
.gv-main { height: 100%; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; }
.gv-ash { color: var(--ash); }
.gv-eyebrow { display:block; font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:0.18em; text-transform:uppercase; color: var(--olive); margin-bottom:14px; font-weight:500; }
.gv-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color: var(--ash); }
.gv-h1 { font-family:'Archivo Narrow',sans-serif; font-weight:700; font-size:38px; letter-spacing:-0.01em; line-height:1.02; text-transform:uppercase; margin:0; }
.gv-h2 { font-family:'Archivo Narrow',sans-serif; font-weight:700; font-size:30px; letter-spacing:-0.01em; line-height:1.08; text-transform:uppercase; margin:0 0 0; }

/* cursor */
.gv-cursor { position:fixed; top:0; left:0; width:10px; height:10px; border-radius:50%; background:var(--ink); pointer-events:none; z-index:999; mix-blend-mode:difference; background:var(--bone); transition: transform 0.12s ease-out; }
@media (pointer:coarse){ .gv-cursor{ display:none; } }

/* loader */
.gv-loader { position:absolute; inset:0; z-index:500; background:var(--ink); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; transition: opacity 0.6s ease, visibility 0.6s ease; }
.gv-loader-out { opacity:0; visibility:hidden; }
.gv-loader-word { font-family:'Archivo Narrow',sans-serif; font-weight:700; font-size:26px; letter-spacing:0.25em; color:var(--bone); }
.gv-loader-bar { width:180px; height:1px; background:rgba(237,234,226,0.2); }
.gv-loader-fill { height:100%; background:var(--bone); transition: width 0.15s linear; }
.gv-loader-pct { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--ash); letter-spacing:0.1em; }

/* nav */
.gv-nav { position:sticky; top:0; z-index:80; padding:18px 32px; transition: all 0.4s cubic-bezier(.16,1,.3,1); background:transparent; }
.gv-nav-scrolled { background:rgba(237,234,226,0.82); backdrop-filter:blur(14px); border-bottom:1px solid var(--line); padding:12px 32px; }
.gv-nav-inner { display:flex; align-items:center; justify-content:space-between; max-width:1280px; margin:0 auto; }
.gv-wordmark { font-family:'Archivo Narrow',sans-serif; font-weight:700; font-size:19px; letter-spacing:0.08em; background:none; border:none; cursor:pointer; color:var(--ink); }
.gv-nav-links { display:flex; gap:30px; }
.gv-nav-links button { background:none; border:none; cursor:pointer; font-size:12.5px; letter-spacing:0.04em; color:var(--ink); opacity:0.65; padding:4px 0; position:relative; transition:opacity 0.2s; }
.gv-nav-links button:hover, .gv-nav-links .gv-active { opacity:1; }
.gv-nav-links .gv-active::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:1px; background:var(--olive); }
.gv-nav-icons { display:flex; gap:16px; align-items:center; }
.gv-nav-icons button { background:none; border:none; cursor:pointer; color:var(--ink); opacity:0.8; display:flex; }
.gv-cart-btn { position:relative; }
.gv-cart-count { position:absolute; top:-7px; right:-8px; background:var(--olive); color:var(--bone); font-size:9px; width:15px; height:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; }
.gv-nav-burger { display:none; background:none; border:none; cursor:pointer; }

.gv-mobile-menu { position:fixed; inset:0; background:var(--ink); z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; transform:translateY(-100%); transition: transform 0.5s cubic-bezier(.16,1,.3,1); }
.gv-mobile-open { transform:translateY(0); }
.gv-mobile-link { background:none; border:none; color:var(--bone); font-family:'Archivo Narrow',sans-serif; font-size:26px; text-transform:uppercase; cursor:pointer; }
.gv-mobile-close { position:absolute; top:20px; right:24px; background:none; border:none; color:var(--bone); cursor:pointer; }

/* hero */
.gv-hero { position:relative; min-height:640px; display:flex; align-items:center; justify-content:center; overflow:hidden; background: radial-gradient(circle at 50% 30%, #f2efe8 0%, #e2ded3 60%, #d5d0c2 100%); }
.gv-hero-grain { position:absolute; inset:0; opacity:0.05; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events:none; }
.gv-hero-vault { position:absolute; inset:0; opacity:0.9; }
.gv-hero-content { position:relative; text-align:center; z-index:2; padding:0 20px; }
.gv-hero-title { font-family:'Archivo Narrow',sans-serif; font-weight:700; font-size:64px; line-height:0.95; letter-spacing:-0.01em; text-transform:uppercase; margin:14px 0 18px; }
.gv-hero-sub { font-size:14px; color:var(--ash); max-width:360px; margin:0 auto 26px; }
.gv-hero-ctas { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.gv-scroll-cue { position:absolute; bottom:22px; left:50%; transform:translateX(-50%); font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.2em; color:var(--ash); animation: gv-bob 2s ease-in-out infinite; }

.gv-btn-solid { background:var(--ink); color:var(--bone); border:1px solid var(--ink); padding:13px 26px; font-size:12px; letter-spacing:0.05em; text-transform:uppercase; cursor:pointer; transition: all 0.25s ease; font-family:'Inter',sans-serif; font-weight:500; }
.gv-btn-solid:hover { background:var(--olive); border-color:var(--olive); }
.gv-btn-outline { background:transparent; color:var(--ink); border:1px solid var(--ink); padding:13px 26px; font-size:12px; letter-spacing:0.05em; text-transform:uppercase; cursor:pointer; transition: all 0.25s ease; font-family:'Inter',sans-serif; font-weight:500; }
.gv-btn-outline:hover { background:var(--ink); color:var(--bone); }
.gv-btn-outline-dark { border-color:var(--bone); color:var(--bone); }
.gv-btn-outline-dark:hover { background:var(--bone); color:var(--ink); }
.gv-icon-btn { border:1px solid var(--line); background:none; padding:12px 14px; cursor:pointer; }
.gv-favorite-active { color:var(--olive); border-color:var(--olive); }

/* marquee */
.gv-marquee { border-top:1px solid var(--line); border-bottom:1px solid var(--line); overflow:hidden; padding:14px 0; background:var(--charcoal); }
.gv-marquee-track { display:flex; width:max-content; animation: gv-marquee 22s linear infinite; }
.gv-marquee-set { display:flex; gap:36px; padding-right:36px; white-space:nowrap; }
.gv-marquee-set span { font-family:'Archivo Narrow',sans-serif; font-size:14px; letter-spacing:0.08em; color:var(--bone); text-transform:uppercase; display:flex; align-items:center; gap:10px; }
.gv-marquee-dot { color:var(--olive); font-size:10px; }

/* sections */
.gv-section { max-width:1280px; margin:0 auto; padding:90px 32px; }
.gv-section-head { margin-bottom:40px; }
.gv-section-head-row { display:flex; justify-content:space-between; align-items:flex-end; }

/* collections */
.gv-collections { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.gv-collection { position:relative; border:none; padding:0; height:340px; overflow:hidden; cursor:pointer; text-align:left; }
.gv-collection-bg { position:absolute; inset:0; transition: transform 0.6s cubic-bezier(.16,1,.3,1); }
.gv-collection:hover .gv-collection-bg { transform:scale(1.08); }
.gv-collection::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.72), transparent 55%); }
.gv-collection-info { position:absolute; left:18px; right:18px; bottom:18px; z-index:2; color:var(--bone); }
.gv-collection-info h3 { font-family:'Archivo Narrow',sans-serif; font-size:18px; text-transform:uppercase; margin:0 0 6px; }
.gv-collection-info p { font-size:12px; opacity:0.8; margin:0 0 10px; }
.gv-arrow-link { display:inline-flex; align-items:center; gap:6px; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }

/* grid / cards */
.gv-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
.gv-card { cursor:pointer; transition: transform 0.15s ease-out; }
.gv-card-img { position:relative; aspect-ratio: 3/4; overflow:hidden; }
.gv-badge { position:absolute; top:10px; left:10px; background:var(--bone); color:var(--ink); font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:0.08em; padding:5px 8px; z-index:2; }
.gv-badge-solid { background:var(--olive); color:var(--bone); }
.gv-card-overlay { position:absolute; inset:0; display:flex; align-items:flex-end; justify-content:center; padding-bottom:16px; opacity:0; transition:opacity 0.25s ease; background:linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%); }
.gv-card:hover .gv-card-overlay { opacity:1; }
.gv-quickadd { background:var(--bone); border:none; padding:9px 18px; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; cursor:pointer; }
.gv-card-info { padding:12px 2px; }
.gv-card-top { display:flex; justify-content:space-between; margin-bottom:6px; }
.gv-card-name { font-family:'Inter',sans-serif; font-size:13.5px; font-weight:500; margin:0 0 6px; line-height:1.3; }
.gv-card-bottom { display:flex; justify-content:space-between; font-size:13px; }

/* editorial */
.gv-editorial { background:var(--ink); color:var(--bone); }
.gv-editorial-grid { display:grid; grid-template-columns:1fr 1fr; max-width:1280px; margin:0 auto; }
.gv-editorial-panel { min-height:460px; }
.gv-editorial-copy { padding:70px 60px; display:flex; flex-direction:column; justify-content:center; }
.gv-editorial-text { font-size:13.5px; color:var(--washed); line-height:1.7; max-width:400px; margin:20px 0 28px; }

/* journal */
.gv-journal-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
.gv-journal-card { cursor:pointer; }
.gv-journal-img { aspect-ratio:4/3; margin-bottom:14px; transition: transform 0.4s ease; }
.gv-journal-card:hover .gv-journal-img { transform: scale(1.015); }
.gv-journal-card h3 { font-family:'Archivo Narrow',sans-serif; font-size:16px; margin:8px 0 6px; text-transform:none; }
.gv-journal-card p { font-size:12.5px; color:var(--ash); line-height:1.5; margin:0; }

/* shop */
.gv-shop { max-width:1280px; margin:0 auto; padding:60px 32px 90px; }
.gv-shop-head { margin-bottom:26px; }
.gv-search-wrap { width:min(100%, 460px); display:flex; align-items:center; gap:10px; border:1px solid var(--line); padding:0 13px; margin-bottom:20px; color:var(--ash); background:rgba(255,255,255,0.22); }
.gv-search-wrap:focus-within { border-color:var(--ink); color:var(--ink); }
.gv-search-input { flex:1; min-width:0; border:none; outline:none; background:transparent; color:var(--ink); padding:13px 0; font:inherit; font-size:13px; }
.gv-search-input::placeholder { color:var(--ash); }
.gv-search-clear { display:flex; padding:3px; border:none; background:none; color:var(--ash); cursor:pointer; }
.gv-pills { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:36px; border-bottom:1px solid var(--line); padding-bottom:26px; }
.gv-pill { border:1px solid var(--line); background:transparent; padding:8px 16px; font-size:11.5px; text-transform:uppercase; letter-spacing:0.03em; cursor:pointer; transition: all 0.2s ease; }
.gv-pill:hover { border-color:var(--ink); }
.gv-pill-active { background:var(--ink); color:var(--bone); border-color:var(--ink); }

/* PDP */
.gv-pdp { max-width:1280px; margin:0 auto; padding:30px 32px 90px; }
.gv-back { display:inline-flex; align-items:center; gap:8px; background:none; border:none; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; cursor:pointer; margin-bottom:30px; color:var(--ink); }
.gv-pdp-grid { display:grid; grid-template-columns:1.1fr 1fr; gap:56px; }
.gv-pdp-main { aspect-ratio:3/4; position:relative; }
.gv-pdp-thumbs { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:8px; }
.gv-pdp-thumb { aspect-ratio:1; }
.gv-pdp-price { font-family:'Archivo Narrow',sans-serif; font-size:24px; margin:6px 0 10px; }
.gv-pdp-sizes { margin:26px 0 20px; }
.gv-size-row { display:flex; gap:8px; margin-top:10px; }
.gv-size-btn { width:42px; height:42px; border:1px solid var(--line); background:none; cursor:pointer; font-size:12px; }
.gv-size-active { border-color:var(--ink); background:var(--ink); color:var(--bone); }
.gv-pdp-actions { display:flex; gap:10px; margin-bottom:36px; }
.gv-pdp-piece { border-top:1px solid var(--line); padding-top:22px; margin-bottom:26px; }
.gv-pdp-piece ul { list-style:none; padding:0; margin:14px 0 0; display:flex; flex-direction:column; gap:9px; }
.gv-pdp-piece li { font-size:12.5px; color:var(--ash); line-height:1.5; }
.gv-pdp-piece li b { color:var(--ink); font-weight:600; }
.gv-pdp-ship { border-top:1px solid var(--line); padding-top:18px; }
.gv-pdp-ship p { font-size:12.5px; color:var(--ash); line-height:1.6; margin:8px 0 0; }

/* about */
.gv-about { max-width:1280px; margin:0 auto; padding:80px 32px 100px; }
.gv-about-grid { display:grid; grid-template-columns:1fr 1fr; gap:50px; margin-top:50px; align-items:center; }
.gv-about-panel { aspect-ratio:4/3; }
.gv-about-copy p { font-size:14px; color:var(--ash); line-height:1.75; margin:0 0 16px; }

/* cart drawer */
.gv-scrim { position:fixed; inset:0; background:rgba(11,11,10,0.4); opacity:0; visibility:hidden; transition:all 0.3s ease; z-index:150; }
.gv-scrim-show { opacity:1; visibility:visible; }
.gv-drawer { position:fixed; top:0; right:0; bottom:0; width:380px; max-width:88vw; background:var(--bone); z-index:160; transform:translateX(100%); transition: transform 0.45s cubic-bezier(.16,1,.3,1); display:flex; flex-direction:column; padding:22px; }
.gv-drawer-open { transform:translateX(0); }
.gv-drawer-head { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:16px; margin-bottom:10px; }
.gv-drawer-head button { background:none; border:none; cursor:pointer; }
.gv-drawer-items { flex:1; overflow-y:auto; }
.gv-drawer-item { display:flex; gap:12px; padding:14px 0; border-bottom:1px solid var(--line); align-items:center; }
.gv-drawer-thumb { width:56px; height:70px; flex-shrink:0; }
.gv-thumb-button { border:none; cursor:pointer; padding:0; }
.gv-drawer-remove { background:none; border:none; font-size:10.5px; text-transform:uppercase; color:var(--ash); cursor:pointer; letter-spacing:0.04em; }
.gv-drawer-foot { border-top:1px solid var(--line); padding-top:16px; }
.gv-drawer-total { display:flex; justify-content:space-between; font-family:'Archivo Narrow',sans-serif; font-size:16px; margin-bottom:14px; }
.gv-account-content { display:flex; flex-direction:column; gap:12px; padding-top:26px; }
.gv-account-input { width:100%; border:1px solid var(--line); background:transparent; padding:13px; outline:none; font:inherit; font-size:13px; }
.gv-account-input:focus { border-color:var(--ink); }
.gv-account-error { color:#9b3024; font-size:12px; margin:0; }
.gv-account-switch { border:none; background:none; padding:6px 0; text-align:left; color:var(--olive); cursor:pointer; font-size:12px; }
.gv-checkout-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.gv-checkout-note { color:var(--ash); font-size:11px; line-height:1.5; margin:0; }

/* footer */
.gv-footer { background:var(--ink); color:var(--bone); padding:60px 32px 24px; }
.gv-footer-top { max-width:1280px; margin:0 auto; display:flex; justify-content:space-between; gap:40px; flex-wrap:wrap; padding-bottom:40px; border-bottom:1px solid var(--lineOnDark, rgba(237,234,226,0.14)); }
.gv-footer-tag { font-size:12px; color:var(--washed); margin-top:8px; }
.gv-newsletter-row { display:flex; gap:0; margin-top:10px; }
.gv-newsletter-row input { background:transparent; border:1px solid rgba(237,234,226,0.3); border-right:none; padding:10px 14px; color:var(--bone); font-size:12px; width:200px; }
.gv-newsletter-row input::placeholder { color:var(--washed); }
.gv-newsletter-row button { background:var(--bone); color:var(--ink); border:none; padding:10px 16px; font-size:11px; text-transform:uppercase; cursor:pointer; }
.gv-footer-cols { max-width:1280px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; padding:40px 0; }
.gv-footer-cols > div { display:flex; flex-direction:column; gap:10px; }
.gv-footer-cols button { background:none; border:none; color:var(--washed); font-size:12.5px; text-align:left; cursor:pointer; padding:0; }
.gv-footer-cols button:hover { color:var(--bone); }
.gv-footer-bottom { max-width:1280px; margin:0 auto; display:flex; justify-content:space-between; font-size:11px; color:var(--washed); padding-top:20px; border-top:1px solid rgba(237,234,226,0.1); }

/* keyframes */
@keyframes gv-word-up { from { transform:translateY(100%); } to { transform:translateY(0); } }
@keyframes gv-fade-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes gv-bob { 0%,100% { transform:translate(-50%,0); } 50% { transform:translate(-50%,6px); } }
@keyframes gv-marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

@media (max-width: 860px) {
  .gv-nav-links { display:none; }
  .gv-nav-burger { display:block; }
  .gv-hero-title { font-size:44px; }
  .gv-collections { grid-template-columns:1fr 1fr; }
  .gv-grid { grid-template-columns:1fr 1fr; }
  .gv-editorial-grid { grid-template-columns:1fr; }
  .gv-editorial-panel { min-height:220px; }
  .gv-journal-grid { grid-template-columns:1fr; }
  .gv-pdp-grid { grid-template-columns:1fr; gap:28px; }
  .gv-footer-cols { grid-template-columns:1fr 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;
