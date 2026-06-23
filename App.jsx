import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────
const SUPABASE_URL = "https://khgoxlcfearihdactoxd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ294bGNmZWFyaWhkYWN0b3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMjcyNDAsImV4cCI6MjA5NTYwMzI0MH0.7PSdrvhOCmfO4DDJ6tA7Z_7ztSYp6kn5YB2XjT-zrHE";
const HEADERS = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" };

// ─── SUPABASE HELPERS ─────────────────────────────────────────
const sb = {
  async get(table, params = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: HEADERS });
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
    return r.json();
  },
  async patch(table, match, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, { method: "PATCH", headers: { ...HEADERS, "Prefer": "return=representation" }, body: JSON.stringify(body) });
    return r.json();
  },
  async delete(table, match) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, { method: "DELETE", headers: HEADERS });
  },
};

// ─── DESIGN TOKENS ────────────────────────────────────────────
const T = {
  bg: "#0d0d0d", surface: "#161616", border: "#2a2a2a",
  accent: "#00ff88", accentDim: "#00ff8822", accentText: "#00cc6a",
  red: "#ff4444", yellow: "#f5c518", white: "#f0f0f0", muted: "#666",
  font: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Mono', monospace",
};

const DEFAULT_BRAND_COSTS = {
  "Denim Tears": 63, "Corteiz": 63, "ASSC": 25, "Stussy": 30,
  "Travis": 12, "Nike": 10, "Metalwood": 45, "Quiet Golf": 50,
};

const currency = (n) => `$${Number(n).toFixed(2)}`;
const pct = (profit, rev) => rev === 0 ? "—" : `${((profit / rev) * 100).toFixed(1)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ─── SHARED UI ────────────────────────────────────────────────
const Badge = ({ children, color = "#00ff88" }) => (
  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, padding: "2px 7px", borderRadius: 3, background: color + "22", color, letterSpacing: 1, textTransform: "uppercase" }}>{children}</span>
);

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 20, border: `1px solid ${active ? T.accent : T.border}`, background: active ? T.accentDim : "transparent", color: active ? T.accent : T.muted, cursor: "pointer", transition: "all .15s" }}>{children}</button>
);

const FInput = ({ label, inputRef, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, letterSpacing: 1 }}>{label}</label>}
    <input ref={inputRef} {...props} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 12px", color: T.white, fontFamily: T.mono, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", ...(props.style || {}) }} />
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant, style: s, disabled }) => {
  const v = variant || "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{ fontFamily: T.font, fontWeight: 700, fontSize: 13, padding: "9px 18px", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, border: v === "primary" ? "none" : `1px solid ${v === "danger" ? T.red : T.border}`, background: v === "primary" ? T.accent : "transparent", color: v === "primary" ? "#000" : v === "danger" ? T.red : T.muted, ...(s || {}) }}>{children}</button>
  );
};

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const SoldFlash = ({ item, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: T.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "flashIn .12s ease-out" }}>
      <style>{`@keyframes flashIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ fontFamily: T.mono, fontSize: 96, fontWeight: 900, color: "#000", lineHeight: 1 }}>SOLD</div>
      <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 700, color: "#000", marginTop: 12 }}>{item.name} — {item.size}</div>
      <div style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 800, color: "#000", marginTop: 8 }}>{currency(item.sold_price)}</div>
      <div style={{ fontFamily: T.mono, fontSize: 16, color: "#00000088", marginTop: 4 }}>+{currency(item.sold_price - item.cost)} profit</div>
    </div>
  );
};

// ─── INTAKE TAB ───────────────────────────────────────────────
const IntakeTab = ({ inventory, reloadInventory }) => {
  const scanRef = useRef();
  const [sessionName, setSessionName] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [brandCosts, setBrandCosts] = useState({ ...DEFAULT_BRAND_COSTS });
  const [newBrand, setNewBrand] = useState("");
  const [newBrandCost, setNewBrandCost] = useState("");
  const [queue, setQueue] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ brand: "", name: "", size: "", cost: "", qty: "1" });
  const [committed, setCommitted] = useState(0);
  const [saving, setSaving] = useState(false);

  const startSession = () => {
    if (!sessionName.trim()) return;
    setSessionActive(true);
    setQueue([]);
    setCommitted(0);
    setTimeout(() => scanRef.current && scanRef.current.focus(), 100);
  };

  const handleScan = (e) => {
    if (e.key !== "Enter") return;
    const raw = scanInput.trim();
    setScanInput("");
    if (!raw) return;
    const parts = raw.split("|");
    const brand = parts[1] || "";
    const name = parts[2] || raw;
    const size = parts[3] || "?";
    setQueue(prev => [...prev, { id: uid(), barcode: raw, brand, name, size, cost: brandCosts[brand] || 0, qty: 1 }]);
    setTimeout(() => scanRef.current && scanRef.current.focus(), 50);
  };

  const updateQ = (id, field, val) => setQueue(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  const removeQ = (id) => setQueue(prev => prev.filter(i => i.id !== id));

  const addManual = () => {
    const { brand, name, size, cost, qty } = manualForm;
    if (!brand || !name || !size || !cost) return;
    setQueue(prev => [...prev, { id: uid(), barcode: "manual", brand, name, size, cost: parseFloat(cost), qty: parseInt(qty) || 1 }]);
    setManualForm({ brand: "", name: "", size: "", cost: "", qty: "1" });
    setShowManual(false);
    setTimeout(() => scanRef.current && scanRef.current.focus(), 50);
  };

  const commitAll = async () => {
    if (queue.length === 0) return;
    setSaving(true);
    try {
      for (const q of queue) {
        const qty = parseInt(q.qty) || 1;
        const existing = inventory.find(i => i.brand === q.brand && i.name === q.name && i.size === q.size);
        if (existing) {
          await sb.patch("inventory", `id=eq.${existing.id}`, { qty: existing.qty + qty });
        } else {
          await sb.post("inventory", { id: uid(), brand: q.brand, name: q.name, size: q.size, cost: parseFloat(q.cost) || 0, qty });
        }
      }
      setCommitted(c => c + queue.reduce((a, q) => a + (parseInt(q.qty) || 1), 0));
      setQueue([]);
      await reloadInventory();
    } finally {
      setSaving(false);
      setTimeout(() => scanRef.current && scanRef.current.focus(), 50);
    }
  };

  const addBrand = () => {
    if (!newBrand || !newBrandCost) return;
    setBrandCosts(prev => ({ ...prev, [newBrand]: parseFloat(newBrandCost) || 0 }));
    setNewBrand(""); setNewBrandCost("");
  };

  const totalQUnits = queue.reduce((a, q) => a + (parseInt(q.qty) || 1), 0);
  const totalQCost = queue.reduce((a, q) => a + (parseFloat(q.cost) || 0) * (parseInt(q.qty) || 1), 0);

  if (!sessionActive) return (
    <Card style={{ textAlign: "center", padding: 48 }}>
      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.accent, letterSpacing: 2, marginBottom: 8 }}>INTAKE SESSION</div>
      <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 10 }}>Start a new shipment intake</div>
      <div style={{ fontFamily: T.font, fontSize: 14, color: T.muted, marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>
        Name this batch, set brand costs once, then scan or enter items. Commit when done — everything saves to Supabase instantly.
      </div>
      <div style={{ display: "flex", gap: 10, maxWidth: 400, margin: "0 auto" }}>
        <FInput placeholder="Shipment name (e.g. Denim Tears June Drop)" value={sessionName}
          onChange={e => setSessionName(e.target.value)} onKeyDown={e => e.key === "Enter" && startSession()} />
        <Btn onClick={startSession} style={{ whiteSpace: "nowrap" }}>Begin Intake</Btn>
      </div>
    </Card>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#00ff8811", border: `1px solid ${T.accent}`, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, letterSpacing: 2 }}>ACTIVE INTAKE</div>
          <div style={{ fontFamily: T.font, fontWeight: 700, color: T.white, fontSize: 15 }}>{sessionName}</div>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.white }}><span style={{ color: T.muted }}>Queue: </span>{totalQUnits} units</div>
        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.white }}><span style={{ color: T.muted }}>Cost: </span>{currency(totalQCost)}</div>
        {committed > 0 && <Badge color={T.accent}>{committed} committed</Badge>}
        <Btn variant="danger" onClick={() => { setSessionActive(false); setQueue([]); setSessionName(""); }}>End Session</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 10 }}>SCAN ITEM</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={handleScan} autoFocus
                placeholder="Scanner input here — or type BRAND|NAME|SIZE and press Enter"
                style={{ flex: 1, background: "#0d0d0d", border: `1px solid ${T.accent}`, borderRadius: 6, padding: "10px 14px", color: T.accent, fontFamily: T.mono, fontSize: 13, outline: "none" }} />
              <Btn variant="outline" onClick={() => setShowManual(v => !v)}>+ Manual</Btn>
            </div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 8 }}>Cost auto-fills from brand table · Edit any field before committing</div>
          </Card>

          {showManual && (
            <Card>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 12 }}>MANUAL ENTRY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FInput label="BRAND" placeholder="Denim Tears" value={manualForm.brand}
                  onChange={e => { const b = e.target.value; setManualForm(f => ({ ...f, brand: b, cost: brandCosts[b] != null ? String(brandCosts[b]) : f.cost })); }} />
                <FInput label="ITEM NAME" placeholder="Cotton Wreath Tee" value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} />
                <FInput label="SIZE" placeholder="L" value={manualForm.size} onChange={e => setManualForm(f => ({ ...f, size: e.target.value }))} />
                <FInput label="COST ($)" type="number" placeholder="63" value={manualForm.cost} onChange={e => setManualForm(f => ({ ...f, cost: e.target.value }))} />
                <FInput label="QTY" type="number" placeholder="1" value={manualForm.qty} onChange={e => setManualForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Btn onClick={addManual}>Add to Queue</Btn>
                <Btn variant="outline" onClick={() => setShowManual(false)}>Cancel</Btn>
              </div>
            </Card>
          )}

          {queue.length > 0 ? (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1 }}>QUEUE — {totalQUnits} units · {currency(totalQCost)}</div>
                <Btn onClick={commitAll} disabled={saving} style={{ whiteSpace: "nowrap" }}>{saving ? "Saving..." : "✓ Commit All to Inventory"}</Btn>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["Brand", "Item Name", "Size", "Cost ($)", "Qty", ""].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: T.muted, fontSize: 10, letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(item => (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "8px 14px" }}><input value={item.brand} onChange={e => updateQ(item.id, "brand", e.target.value)} style={{ background: "transparent", border: "none", color: T.accent, fontFamily: T.mono, fontSize: 12, width: 110, outline: "none", fontWeight: 700 }} /></td>
                        <td style={{ padding: "8px 14px" }}><input value={item.name} onChange={e => updateQ(item.id, "name", e.target.value)} style={{ background: "transparent", border: "none", color: T.white, fontFamily: T.mono, fontSize: 12, width: 160, outline: "none" }} /></td>
                        <td style={{ padding: "8px 14px" }}><input value={item.size} onChange={e => updateQ(item.id, "size", e.target.value)} style={{ background: "transparent", border: "none", color: T.white, fontFamily: T.mono, fontSize: 12, width: 40, outline: "none" }} /></td>
                        <td style={{ padding: "8px 14px" }}><input type="number" value={item.cost} onChange={e => updateQ(item.id, "cost", e.target.value)} style={{ background: "transparent", border: "none", color: T.yellow, fontFamily: T.mono, fontSize: 12, width: 55, outline: "none" }} /></td>
                        <td style={{ padding: "8px 14px" }}><input type="number" value={item.qty} min={1} onChange={e => updateQ(item.id, "qty", e.target.value)} style={{ background: "transparent", border: "none", color: T.white, fontFamily: T.mono, fontSize: 12, width: 40, outline: "none" }} /></td>
                        <td style={{ padding: "8px 14px" }}><button onClick={() => removeQ(item.id)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16 }}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: T.muted, fontFamily: T.font, fontSize: 14, border: `1px dashed ${T.border}`, borderRadius: 10 }}>
              Scan an item or use Manual Entry to build the queue.
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 12 }}>BRAND COST TABLE</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginBottom: 14, lineHeight: 1.6 }}>Set once per shipment. Scanning auto-fills cost from this table.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 14 }}>
              {Object.entries(brandCosts).map(([brand, cost]) => (
                <div key={brand} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: T.font, fontSize: 13, color: T.white }}>{brand}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" value={cost} onChange={e => setBrandCosts(prev => ({ ...prev, [brand]: parseFloat(e.target.value) || 0 }))}
                      style={{ background: "transparent", border: "none", color: T.yellow, fontFamily: T.mono, fontSize: 13, width: 50, textAlign: "right", outline: "none" }} />
                    <button onClick={() => setBrandCosts(prev => { const n = { ...prev }; delete n[brand]; return n; })}
                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 15 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Brand" value={newBrand} onChange={e => setNewBrand(e.target.value)}
                style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 10px", color: T.white, fontFamily: T.mono, fontSize: 12, outline: "none" }} />
              <input placeholder="$" type="number" value={newBrandCost} onChange={e => setNewBrandCost(e.target.value)}
                style={{ width: 52, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 8px", color: T.white, fontFamily: T.mono, fontSize: 12, outline: "none" }} />
              <button onClick={addBrand} style={{ background: T.accent, color: "#000", border: "none", borderRadius: 5, padding: "7px 12px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+</button>
            </div>
          </Card>
          {committed > 0 && (
            <Card>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 10 }}>SESSION LOG</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 800, color: T.accent }}>{committed}</span>
                <span style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>units saved to Supabase this session</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── INVENTORY TAB ────────────────────────────────────────────
const InventoryTab = ({ inventory, reloadInventory }) => {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ brand: "", name: "", size: "", cost: "", qty: "" });
  const [saving, setSaving] = useState(false);

  const filtered = inventory.filter(i =>
    `${i.brand} ${i.name} ${i.size} ${i.id}`.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = async () => {
    if (!form.brand || !form.name || !form.size || !form.cost || !form.qty) return;
    setSaving(true);
    await sb.post("inventory", { id: uid(), brand: form.brand, name: form.name, size: form.size, cost: +form.cost, qty: +form.qty });
    setForm({ brand: "", name: "", size: "", cost: "", qty: "" });
    setShowAdd(false);
    await reloadInventory();
    setSaving(false);
  };

  const totalCost = inventory.reduce((a, i) => a + i.cost * i.qty, 0);
  const totalUnits = inventory.reduce((a, i) => a + i.qty, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[{ label: "Total Units", val: totalUnits }, { label: "SKUs", val: inventory.length }, { label: "Cost Basis", val: currency(totalCost) }].map(s => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.accent }}>{s.val}</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <FInput placeholder="Search brand, name, size..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <Btn onClick={() => setShowAdd(v => !v)}>+ Add Item</Btn>
      </div>
      {showAdd && (
        <Card>
          <div style={{ fontFamily: T.font, fontWeight: 600, color: T.white, marginBottom: 14 }}>New Inventory Item</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FInput label="BRAND" placeholder="Denim Tears" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            <FInput label="ITEM NAME" placeholder="Cotton Wreath Tee" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <FInput label="SIZE" placeholder="L" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
            <FInput label="COST ($)" placeholder="63" type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            <FInput label="QTY" placeholder="3" type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn onClick={addItem} disabled={saving}>{saving ? "Saving..." : "Add to Inventory"}</Btn>
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Brand", "Item", "Size", "Cost", "Qty", "Total Cost"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: T.muted, fontSize: 11, letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                  <td style={{ padding: "11px 16px", color: T.accent, fontWeight: 700 }}>{item.brand}</td>
                  <td style={{ padding: "11px 16px", color: T.white }}>{item.name}</td>
                  <td style={{ padding: "11px 16px", color: T.white }}>{item.size}</td>
                  <td style={{ padding: "11px 16px", color: T.white }}>{currency(item.cost)}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ color: item.qty === 0 ? T.red : item.qty <= 2 ? T.yellow : T.accent, fontWeight: 700 }}>{item.qty}</span>
                  </td>
                  <td style={{ padding: "11px 16px", color: T.white }}>{currency(item.cost * item.qty)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: T.muted }}>No items match.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── STREAM TAB ───────────────────────────────────────────────
const StreamTab = ({ inventory, reloadInventory, streams, reloadStreams }) => {
  const [activeStreamId, setActiveStreamId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [search, setSearch] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [selected, setSelected] = useState(null);
  const [newStreamName, setNewStreamName] = useState("");
  const [showNewStream, setShowNewStream] = useState(false);
  const [sales, setSales] = useState([]);
  const priceRef = useRef();

  const activeStream = streams.find(s => s.id === activeStreamId);
  const available = inventory.filter(i => i.qty > 0 && `${i.brand} ${i.name} ${i.size}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (!activeStreamId) return;
    sb.get("sales", `stream_id=eq.${activeStreamId}&order=ts.desc`).then(setSales);
  }, [activeStreamId]);

  const startStream = async () => {
    if (!newStreamName.trim()) return;
    const id = uid();
    await sb.post("streams", { id, name: newStreamName, date: new Date().toISOString().slice(0, 10), closed: false });
    await reloadStreams();
    setActiveStreamId(id);
    setSales([]);
    setNewStreamName(""); setShowNewStream(false);
  };

  const selectItem = (item) => {
    setSelected(item); setSoldPrice("");
    setTimeout(() => priceRef.current && priceRef.current.focus(), 50);
  };

  const markSold = async () => {
    if (!selected || !soldPrice || !activeStreamId) return;
    const price = parseFloat(soldPrice);
    if (isNaN(price) || price <= 0) return;
    const sale = { id: uid(), stream_id: activeStreamId, item_id: selected.id, name: `${selected.brand} ${selected.name}`, size: selected.size, cost: selected.cost, sold_price: price, ts: new Date().toISOString() };
    await sb.post("sales", sale);
    await sb.patch("inventory", `id=eq.${selected.id}`, { qty: selected.qty - 1 });
    setSales(prev => [sale, ...prev]);
    await reloadInventory();
    setFlash({ ...sale });
    setSelected(null); setSoldPrice(""); setSearch("");
  };

  const endStream = async () => {
    await sb.patch("streams", `id=eq.${activeStreamId}`, { closed: true });
    await reloadStreams();
    setActiveStreamId(null);
    setSales([]);
  };

  const sesRev = sales.reduce((a, s) => a + s.sold_price, 0);
  const sesProfit = sales.reduce((a, s) => a + (s.sold_price - s.cost), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {flash && <SoldFlash item={flash} onDone={() => setFlash(null)} />}
      {!activeStreamId && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 8 }}>No stream active</div>
          <div style={{ fontFamily: T.font, fontSize: 14, color: T.muted, marginBottom: 24 }}>Start a stream to log sales and track profit in real time.</div>
          {showNewStream ? (
            <div style={{ display: "flex", gap: 10, maxWidth: 360, margin: "0 auto" }}>
              <FInput placeholder="Stream name (e.g. TikTok Drop #3)" value={newStreamName}
                onChange={e => setNewStreamName(e.target.value)} onKeyDown={e => e.key === "Enter" && startStream()} />
              <Btn onClick={startStream} style={{ whiteSpace: "nowrap" }}>Go Live</Btn>
            </div>
          ) : (
            <button onClick={() => setShowNewStream(true)} style={{ background: T.accent, color: "#000", fontFamily: T.font, fontWeight: 700, fontSize: 15, padding: "12px 28px", borderRadius: 8, border: "none", cursor: "pointer" }}>
              ▶ Start Stream
            </button>
          )}
        </Card>
      )}

      {activeStreamId && activeStream && (
        <>
          <div style={{ background: T.accentDim, border: `1px solid ${T.accent}`, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, display: "inline-block", animation: "pulse 1s infinite" }} />
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
              <span style={{ fontFamily: T.font, fontWeight: 700, color: T.accent, fontSize: 15 }}>{activeStream.name}</span>
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 13, color: T.white }}><span style={{ color: T.muted }}>Sales: </span>{sales.length}</div>
            <div style={{ fontFamily: T.mono, fontSize: 13, color: T.white }}><span style={{ color: T.muted }}>Revenue: </span>{currency(sesRev)}</div>
            <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: sesProfit >= 0 ? T.accent : T.red }}>+{currency(sesProfit)} profit</div>
            <Btn variant="danger" onClick={endStream}>End Stream</Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FInput placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }}>
                {available.map(item => (
                  <div key={item.id} onClick={() => selectItem(item)} style={{ background: selected && selected.id === item.id ? T.accentDim : T.surface, border: `1px solid ${selected && selected.id === item.id ? T.accent : T.border}`, borderRadius: 8, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .1s" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.font, fontWeight: 600, color: T.white, fontSize: 14 }}>{item.brand} — {item.name}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, marginTop: 2 }}>Size: {item.size} · Cost: {currency(item.cost)}</div>
                    </div>
                    <Badge>{item.qty} left</Badge>
                  </div>
                ))}
                {available.length === 0 && <div style={{ textAlign: "center", padding: 24, color: T.muted, fontFamily: T.font, fontSize: 14 }}>No available items.</div>}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Card>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 14 }}>MARK AS SOLD</div>
                {selected ? (
                  <>
                    <div style={{ fontFamily: T.font, fontWeight: 700, color: T.white, fontSize: 16, marginBottom: 4 }}>{selected.brand}</div>
                    <div style={{ fontFamily: T.font, color: T.muted, fontSize: 14, marginBottom: 12 }}>{selected.name} · {selected.size}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 13, color: T.muted, marginBottom: 16 }}>Cost: {currency(selected.cost)}</div>
                    <FInput label="SOLD PRICE ($)" inputRef={priceRef} type="number" placeholder="0.00" value={soldPrice} onChange={e => setSoldPrice(e.target.value)} onKeyDown={e => e.key === "Enter" && markSold()} />
                    {soldPrice && parseFloat(soldPrice) > 0 && (
                      <div style={{ fontFamily: T.mono, fontSize: 13, color: T.accent, marginTop: 10 }}>
                        Profit: +{currency(parseFloat(soldPrice) - selected.cost)} ({pct(parseFloat(soldPrice) - selected.cost, parseFloat(soldPrice))})
                      </div>
                    )}
                    <button onClick={markSold} style={{ marginTop: 14, width: "100%", background: T.accent, color: "#000", fontFamily: T.font, fontWeight: 800, fontSize: 16, padding: "14px", borderRadius: 8, border: "none", cursor: "pointer" }}>SOLD →</button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 0", color: T.muted, fontFamily: T.font, fontSize: 14 }}>Select an item to sell it.</div>
                )}
              </Card>

              {sales.length > 0 && (
                <Card>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 12 }}>RECENT SALES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                    {sales.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: T.font, fontSize: 13, color: T.white }}>{s.name} · {s.size}</div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.white }}>{currency(s.sold_price)}</div>
                          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accentText }}>+{currency(s.sold_price - s.cost)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── P&L TAB ──────────────────────────────────────────────────
const PnLTab = ({ streams }) => {
  const [selected, setSelected] = useState(null);
  const [streamSales, setStreamSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const closed = streams.filter(s => s.closed);

  const selectStream = async (id) => {
    if (selected === id) { setSelected(null); setStreamSales([]); return; }
    setSelected(id); setLoading(true);
    const data = await sb.get("sales", `stream_id=eq.${id}&order=ts.asc`);
    setStreamSales(data);
    setLoading(false);
  };

  const streamStats = (sales) => ({
    revenue: sales.reduce((a, s) => a + s.sold_price, 0),
    profit: sales.reduce((a, s) => a + (s.sold_price - s.cost), 0),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[
          { label: "Streams Completed", val: closed.length, color: T.white },
          { label: "Click a stream to view P&L", val: "↓", color: T.muted },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: T.font, fontSize: 11, color: T.muted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginBottom: 4 }}>COMPLETED STREAMS</div>
          {closed.length === 0 && <div style={{ color: T.muted, fontFamily: T.font, fontSize: 14, padding: 24, textAlign: "center" }}>No completed streams yet.</div>}
          {closed.map(s => {
            const isSel = selected === s.id;
            return (
              <div key={s.id} onClick={() => selectStream(s.id)} style={{ background: isSel ? T.accentDim : T.surface, border: `1px solid ${isSel ? T.accent : T.border}`, borderRadius: 8, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all .1s" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.font, fontWeight: 600, color: T.white, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, marginTop: 2 }}>{s.date}</div>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>View P&L →</div>
              </div>
            );
          })}
        </div>

        {selected && (
          <Card>
            {loading ? <Spinner /> : (() => {
              const stream = streams.find(s => s.id === selected);
              const { revenue, profit } = streamStats(streamSales);
              return (
                <>
                  <div style={{ fontFamily: T.font, fontWeight: 700, color: T.white, fontSize: 16, marginBottom: 4 }}>{stream && stream.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, marginBottom: 16 }}>{stream && stream.date}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                    {[
                      { l: "Revenue", v: currency(revenue) },
                      { l: "Profit", v: currency(profit) },
                      { l: "Margin", v: pct(profit, revenue) },
                    ].map(s => (
                      <div key={s.l} style={{ textAlign: "center", background: "#ffffff06", borderRadius: 6, padding: 10 }}>
                        <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.accent }}>{s.v}</div>
                        <div style={{ fontFamily: T.font, fontSize: 10, color: T.muted, marginTop: 2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {streamSales.map((s, i) => {
                      const profit = s.sold_price - s.cost;
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                          <div>
                            <div style={{ fontFamily: T.font, fontSize: 13, color: T.white }}>{s.name} · {s.size}</div>
                            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>Cost: {currency(s.cost)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: T.mono, fontSize: 13, color: T.white }}>{currency(s.sold_price)}</div>
                            <div style={{ fontFamily: T.mono, fontSize: 11, color: profit >= 0 ? T.accentText : T.red }}>+{currency(profit)} · {pct(profit, s.sold_price)}</div>
                          </div>
                        </div>
                      );
                    })}
                    {streamSales.length === 0 && <div style={{ textAlign: "center", padding: 16, color: T.muted, fontFamily: T.font, fontSize: 14 }}>No sales logged for this stream.</div>}
                  </div>
                </>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("stream");
  const [inventory, setInventory] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadInventory = async () => {
    const data = await sb.get("inventory", "order=brand.asc,name.asc");
    if (Array.isArray(data)) setInventory(data);
  };

  const reloadStreams = async () => {
    const data = await sb.get("streams", "order=created_at.desc");
    if (Array.isArray(data)) setStreams(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([reloadInventory(), reloadStreams()]);
      } catch (e) {
        setError("Could not connect to Supabase. Check that your tables exist.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const tabs = [
    { id: "intake", label: "📦 Intake" },
    { id: "stream", label: "▶ Stream Mode" },
    { id: "inventory", label: "Inventory" },
    { id: "pnl", label: "P&L" },
  ];

  const totalUnits = inventory.reduce((a, i) => a + i.qty, 0);
  const closedStreams = streams.filter(s => s.closed).length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.white }}>
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "0 28px", display: "flex", alignItems: "center", gap: 24, height: 56, position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ fontFamily: T.mono, fontWeight: 800, fontSize: 16, color: T.accent, letterSpacing: 2 }}>STREETSPHERE</div>
        <div style={{ width: 1, height: 20, background: T.border }} />
        <div style={{ display: "flex", gap: 6 }}>
          {tabs.map(t => <Pill key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</Pill>)}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{totalUnits} units · {closedStreams} streams</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: error ? T.red : T.accent, display: "inline-block" }} />
            <span style={{ fontFamily: T.mono, fontSize: 11, color: error ? T.red : T.accentText }}>{error ? "offline" : "supabase"}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? <Spinner /> : error ? (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontFamily: T.mono, fontSize: 14, color: T.red, marginBottom: 8 }}>Connection Error</div>
            <div style={{ fontFamily: T.font, fontSize: 14, color: T.muted }}>{error}</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, marginTop: 12 }}>Make sure you ran the SQL setup in your Supabase dashboard.</div>
          </Card>
        ) : (
          <>
            {tab === "intake" && <IntakeTab inventory={inventory} reloadInventory={reloadInventory} />}
            {tab === "stream" && <StreamTab inventory={inventory} reloadInventory={reloadInventory} streams={streams} reloadStreams={reloadStreams} />}
            {tab === "inventory" && <InventoryTab inventory={inventory} reloadInventory={reloadInventory} />}
            {tab === "pnl" && <PnLTab streams={streams} />}
          </>
        )}
      </div>
    </div>
  );
}
