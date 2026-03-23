import { useState, useEffect } from "react";
import { supabase } from './supabase';

const DEFAULT_PASS = "513122";

const LEVELS = [
  { active: "bg-gray-500",   text: "text-gray-300",   label: "Nenhum",        desc: "Não sei nada sobre este item." },
  { active: "bg-red-600",    text: "text-red-400",     label: "Básico",        desc: "Já ouvi falar ou li algo, mas nunca trabalhei com isso." },
  { active: "bg-yellow-500", text: "text-yellow-400",  label: "Intermediário", desc: "Consigo trabalhar com apoio ou consultando documentação." },
  { active: "bg-green-600",  text: "text-green-400",   label: "Avançado",      desc: "Trabalho com autonomia e resolvo problemas complexos." },
  { active: "bg-blue-500",   text: "text-blue-300",    label: "Expert",        desc: "Domínio total, consigo ensinar e tomar decisões arquiteturais." },
];

const LEVEL_BG = [
  "bg-gray-900 border-gray-700",
  "bg-red-950 border-red-900",
  "bg-yellow-950 border-yellow-900",
  "bg-green-950 border-green-900",
  "bg-blue-950 border-blue-900",
];

const LEVEL_COLORS = ["#6b7280","#dc2626","#eab308","#16a34a","#3b82f6"];
const DEFAULT_SYSTEMS = [];

const SEED_MODULES = [
  { id: "p01", name: "Setup inicial", submodules: [{ id: "p01s01", name: "Parametrizações de base" }] },
  { id: "p02", name: "Entrada Animais", submodules: [
    { id: "p02s01", name: "Recepção de lotes de produtor" },
    { id: "p02s02", name: "Programação de abate" },
    { id: "p02s03", name: "Recepção e controle de pesagens" },
    { id: "p02s04", name: "Controle de galpão de espera" },
    { id: "p02s05", name: "Abate (descarga / pendura / controle currais)" },
    { id: "p02s06", name: "Descarte (condenas)" },
  ]},
  { id: "p03", name: "Produção", submodules: [
    { id: "p03s01", name: "Ordens de produção (simples / múltipla)" },
    { id: "p03s02", name: "Gestão de layouts de etiquetas" },
    { id: "p03s03", name: "Impressão de etiquetas diversas" },
    { id: "p03s04", name: "Registro direto da produção (PRO009)" },
    { id: "p03s05", name: "Produção agrupada" },
    { id: "p03s06", name: "Integração com verificadoras de peso" },
    { id: "p03s07", name: "Destinação de produtos (processo / reprocesso / descarte)" },
    { id: "p03s08", name: "Entrada / saída de túnel" },
    { id: "p03s09", name: "Paletização" },
    { id: "p03s10", name: "Produção de itens de terceiros" },
    { id: "p03s11", name: "Integração e configuração de equipamentos (balanças)" },
    { id: "p03s12", name: "Mecanismos de contingência" },
    { id: "p03s13", name: "Manutenção de etiquetas / repositório" },
  ]},
  { id: "p04", name: "Armazenagem", submodules: [
    { id: "p04s01", name: "Transferência entre almoxarifados" },
    { id: "p04s02", name: "Localização de paletes (WMS)" },
    { id: "p04s03", name: "Inventário" },
  ]},
  { id: "p04b", name: "Qualidade", submodules: [
    { id: "p04bs01", name: "Controle de laudos" },
    { id: "p04bs02", name: "Sequestros de produção" },
    { id: "p04bs03", name: "myPAC" },
    { id: "p04bs04", name: "Rastreabilidade" },
  ]},
  { id: "p05", name: "Materiais", submodules: [
    { id: "p05s01", name: "Entrada de materiais" },
    { id: "p05s02", name: "Consumo de materiais" },
    { id: "p05s03", name: "Manutenção de estoque de materiais" },
    { id: "p05s04", name: "Inventário de materiais" },
    { id: "p05s05", name: "Cardex" },
  ]},
  { id: "p06", name: "Transferência entre filiais", submodules: [
    { id: "p06s01", name: "Setup para transferência" },
    { id: "p06s02", name: "Transferência entre bases distintas" },
    { id: "p06s03", name: "Transferência em base única" },
  ]},
  { id: "p07", name: "Entrada de Produtos", submodules: [{ id: "p07s01", name: "Entrada de produtos" }] },
  { id: "p08", name: "Comercial", submodules: [{ id: "p08s01", name: "Pedido de compra" }] },
  { id: "p09", name: "Logística", submodules: [
    { id: "p09s01", name: "Programação de caminhões" },
    { id: "p09s02", name: "Montagem de cargas / liberação" },
  ]},
  { id: "p10", name: "Expedição", submodules: [
    { id: "p10s01", name: "Picking" },
    { id: "p10s02", name: "Expedição de cargas (totalizadas / pedido / mista)" },
    { id: "p10s03", name: "Desmembramento de unidades individuais" },
    { id: "p10s04", name: "Pesagens de cargas" },
  ]},
  { id: "p11", name: "Industrializados", submodules: [{ id: "p11s01", name: "Controle de batchs" }] },
  { id: "p12", name: "Segurança", submodules: [
    { id: "p12s01", name: "Métodos de acesso e controle de segurança por usuário e senha" },
    { id: "p12s02", name: "Métodos de acesso e controle de segurança por AD" },
  ]},
  { id: "p13", name: "Devolução", submodules: [
    { id: "p13s01", name: "Devolução normal" },
    { id: "p13s02", name: "Devolução direta" },
    { id: "p13s03", name: "Devolução entre filiais distintas" },
  ]},
  { id: "p14", name: "Ferramentas Built-in", submodules: [
    { id: "p14s01", name: "Dashboards custom" },
    { id: "p14s02", name: "Relatórios custom" },
    { id: "p14s03", name: "Consultas custom" },
  ]},
  { id: "p15", name: "Serviços", submodules: [
    { id: "p15s01", name: "WSI" },
    { id: "p15s02", name: "Common" },
    { id: "p15s03", name: "MSS" },
  ]},
  { id: "p16", name: "Cardex", submodules: [
    { id: "p16s01", name: "Parametrização inicial" },
    { id: "p16s02", name: "Controle de fechamentos" },
    { id: "p16s03", name: "Análise de problemas" },
  ]},
  { id: "p17", name: "Tradução", submodules: [
    { id: "p17s01", name: "Captura" },
    { id: "p17s02", name: "Tradução" },
    { id: "p17s03", name: "Geração de dicionário" },
  ]},
  { id: "p18", name: "Custos", submodules: [
    { id: "p18s01", name: "Conceito" },
    { id: "p18s02", name: "Parametrização" },
    { id: "p18s03", name: "Fechamento" },
  ]},
  { id: "p18b", name: "Replicação", submodules: [
    { id: "p18bs01", name: "Parametrização" },
    { id: "p18bs02", name: "Arquitetura" },
  ]},
  { id: "p19", name: "Balança Rodoviária", submodules: [
    { id: "p19s01", name: "Pesagens Diversas" },
  ]},
];

function copyText(text) {
  try {
    const el = document.createElement("textarea");
    el.value = text; el.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(el); el.focus(); el.select();
    document.execCommand("copy"); document.body.removeChild(el);
  } catch {}
}

// ── Level Selector ────────────────────────────────────────────
function LevelSelector({ level, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {LEVELS.map((s, i) => (
        <button key={i} onClick={() => onChange(i)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 border text-left transition-all ${level === i ? `${LEVEL_BG[i]} ring-2 ring-white ring-opacity-20` : "bg-gray-900 border-gray-800 hover:border-gray-600"}`}>
          <span className={`w-7 h-7 flex items-center justify-center rounded-md font-bold text-sm shrink-0 ${s.active} text-white`}>{i}</span>
          <div>
            <span className={`text-sm font-semibold ${level === i ? s.text : "text-gray-400"}`}>{s.label}</span>
            <span className={`text-xs ml-2 ${level === i ? "text-gray-300" : "text-gray-600"}`}>— {s.desc}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Tag({ label, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-sm">
      <span className="text-gray-200">{label}</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
    </div>
  );
}

// ── System Selection Step ─────────────────────────────────────
function SystemSelectionStep({ dev, systems, initialSelected, onConfirm }) {
  const [selected, setSelected] = useState(initialSelected || []);
  function toggle(s) { setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); }
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mb-1">
            <p className="text-orange-400 font-bold text-2xl tracking-widest leading-none">TAGAT</p>
            <p className="text-orange-400 font-light text-xs tracking-widest">Foodtech</p>
          </div>
          <p className="text-gray-400 text-sm mt-3">Olá, <span className="text-blue-400 font-semibold">{dev}</span>!</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-white font-semibold text-sm mb-1">🖥️ Com quais sistemas você trabalha?</h2>
            <p className="text-gray-500 text-xs leading-relaxed">Selecione todos os sistemas com os quais você tem ou já teve experiência.</p>
          </div>
          <div className="space-y-2">
            {systems.map(s => {
              const active = selected.includes(s);
              return (
                <button key={s} onClick={() => toggle(s)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border text-left transition-all ${active ? "bg-blue-950 border-blue-700 ring-1 ring-blue-600" : "bg-gray-800 border-gray-700 hover:border-gray-500"}`}>
                  <span className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-all ${active ? "bg-blue-600 border-blue-600" : "border-gray-500"}`}>
                    {active && <span className="text-white text-xs font-bold">✓</span>}
                  </span>
                  <span className={`text-sm font-medium ${active ? "text-blue-200" : "text-gray-300"}`}>{s}</span>
                </button>
              );
            })}
          </div>
          {systems.length === 0 && <p className="text-gray-600 text-xs text-center">Nenhum sistema cadastrado. Continue assim mesmo.</p>}
          <button onClick={() => onConfirm(selected)} disabled={systems.length > 0 && selected.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold text-sm text-white transition-colors">
            Continuar para avaliação →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Snapshot View ─────────────────────────────────────────────
function SnapshotView({ dev, snapshot, config, onBack }) {
  const rows = [];
  for (const mod of config.modules) {
    if (mod.submodules.length === 0) rows.push({ mod: mod.name, sub: null, key: mod.id });
    else mod.submodules.forEach(sub => rows.push({ mod: mod.name, sub: sub.name, key: sub.id }));
  }
  const date = new Date(snapshot.timestamp).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🧠 Respostas — {dev}</h1>
            <p className="text-sm text-gray-500 mt-1">Snapshot de <strong>{date}</strong></p>
            {snapshot.systems?.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {snapshot.systems.map(s => <span key={s} className="bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-3 py-1">{s}</span>)}
              </div>
            )}
          </div>
          <button onClick={onBack} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors">← Voltar</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ background: "#1e293b" }}>
              <th style={{ padding: "10px 12px", color: "#fff", fontSize: "12px", fontWeight: 600, textAlign: "left" }}>Processo</th>
              <th style={{ padding: "10px 12px", color: "#fff", fontSize: "12px", fontWeight: 600, textAlign: "left" }}>Subprocesso</th>
              <th style={{ padding: "10px 12px", color: "#fff", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Nível</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const lvl = snapshot.answers[r.key] ?? 0;
              return (
                <tr key={r.key} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", color: "#374151", fontSize: "13px" }}>{r.mod}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "13px" }}>{r.sub ?? "—"}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                    <span style={{ display: "inline-block", background: LEVEL_COLORS[lvl], color: "#fff", fontWeight: 700, borderRadius: "6px", padding: "2px 10px", fontSize: "12px" }}>
                      {lvl} – {LEVELS[lvl].label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af" }}>Bus Factor Tracker · Snapshot de {date}</p>
      </div>
    </div>
  );
}

// ── Report View ───────────────────────────────────────────────
function ReportView({ dev, config, devAnswers, onBack }) {
  const [exporting, setExporting] = useState(false);
  const rows = [];
  for (const mod of config.modules) {
    if (mod.submodules.length === 0) rows.push({ mod: mod.name, sub: null, key: mod.id });
    else mod.submodules.forEach(sub => rows.push({ mod: mod.name, sub: sub.name, key: sub.id }));
  }
  const selectedSystems = devAnswers["_systems"] || [];

  function exportHTML() {
    setExporting(true);
    const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const tableRows = rows.map((r, i) => {
      const lvl = devAnswers[r.key] ?? 0;
      const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `<tr style="background:${bg}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px">${r.mod}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">${r.sub ?? "—"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="display:inline-block;background:${LEVEL_COLORS[lvl]};color:#fff;font-weight:700;border-radius:6px;padding:2px 10px;font-size:12px">${lvl} – ${LEVELS[lvl].label}</span>
        </td>
      </tr>`;
    }).join("");
    const systemsBadges = selectedSystems.length > 0
      ? `<div style="margin-bottom:20px"><p style="font-size:12px;color:#374151;margin-bottom:6px;font-weight:600">Sistemas declarados:</p><div style="display:flex;gap:8px;flex-wrap:wrap">${selectedSystems.map(s => `<span style="background:#dbeafe;color:#1d4ed8;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:600">${s}</span>`).join("")}</div></div>`
      : "";
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Relatório – ${dev}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#fff;color:#111;padding:40px}h1{font-size:20px;font-weight:700;color:#111}.sub{font-size:13px;color:#6b7280;margin-top:4px}.date{font-size:11px;color:#9ca3af;margin-top:2px}.info{background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:4px;margin:20px 0;font-size:12px;color:#1e40af;line-height:1.6}table{width:100%;border-collapse:collapse;margin-bottom:24px}thead tr{background:#1e293b}thead th{padding:10px 12px;color:#fff;font-size:12px;font-weight:600;text-align:left}thead th:last-child{text-align:center}footer{text-align:center;font-size:11px;color:#9ca3af;margin-top:16px}@media print{body{padding:20px}@page{margin:1.5cm}}</style>
</head><body>
  <h1>🧠 Matriz de Conhecimento</h1>
  <p class="sub">Avaliação individual — <strong>${dev}</strong></p>
  <p class="date">${date}</p>
  <div class="info">Esta avaliação considera tanto o <strong>entendimento do processo de negócio</strong> quanto o <strong>domínio técnico</strong>. Níveis de <strong>0 – Nenhum</strong> a <strong>4 – Expert</strong>.</div>
  ${systemsBadges}
  <table><thead><tr><th>Processo</th><th>Subprocesso</th><th style="text-align:center">Nível</th></tr></thead><tbody>${tableRows}</tbody></table>
  <footer>Bus Factor Tracker · Documento gerado automaticamente</footer>
  <script>window.onload=function(){window.print();setTimeout(()=>window.close(),1000)};</script>
</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `relatorio-${dev.replace(/\s+/g,"_")}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => { URL.revokeObjectURL(url); setExporting(false); }, 2000);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🧠 Matriz de Conhecimento</h1>
            <p className="text-sm text-gray-500 mt-1">Avaliação individual — <strong>{dev}</strong></p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportHTML} disabled={exporting}
              className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
              {exporting ? "Gerando..." : "⬇️ Exportar HTML"}
            </button>
            <button onClick={onBack} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors">← Voltar</button>
          </div>
        </div>
        <div style={{ background: "#eff6ff", borderLeft: "4px solid #3b82f6", padding: "12px 16px", borderRadius: "4px", marginBottom: "24px", fontSize: "12px", color: "#1e40af", lineHeight: "1.6" }}>
          Esta avaliação considera tanto o <strong>entendimento do processo de negócio</strong> quanto o <strong>domínio técnico</strong>. Níveis de <strong>0 – Nenhum</strong> a <strong>4 – Expert</strong>.
        </div>
        {selectedSystems.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-500 font-semibold mb-2">Sistemas declarados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSystems.map(s => <span key={s} className="bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-3 py-1">{s}</span>)}
            </div>
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ background: "#1e293b" }}>
              <th style={{ padding: "10px 12px", color: "#fff", fontSize: "12px", fontWeight: 600, textAlign: "left" }}>Processo</th>
              <th style={{ padding: "10px 12px", color: "#fff", fontSize: "12px", fontWeight: 600, textAlign: "left" }}>Subprocesso</th>
              <th style={{ padding: "10px 12px", color: "#fff", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Nível</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const lvl = devAnswers[r.key] ?? 0;
              return (
                <tr key={r.key} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", color: "#374151", fontSize: "13px" }}>{r.mod}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "13px" }}>{r.sub ?? "—"}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                    <span style={{ display: "inline-block", background: LEVEL_COLORS[lvl], color: "#fff", fontWeight: 700, borderRadius: "6px", padding: "2px 10px", fontSize: "12px" }}>
                      {lvl} – {LEVELS[lvl].label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af" }}>Bus Factor Tracker · Documento gerado automaticamente</p>
      </div>
    </div>
  );
}

// ── Dev Fill View ─────────────────────────────────────────────
function DevFillView({ dev, config, initialAnswers, onSave, onLogout }) {
  const [step, setStep] = useState("systems");
  const [selectedSystems, setSelectedSystems] = useState(initialAnswers?.["_systems"] || []);
  const [devAnswers, setDevAnswers] = useState(initialAnswers || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const systems = config.systems || DEFAULT_SYSTEMS;

  function handleSystemsConfirm(sel) { setSelectedSystems(sel); setStep("modules"); }
  function setLevel(key, val) { setDevAnswers(p => ({ ...p, [key]: val })); setSaved(false); }

  async function submit() {
    setSaving(true);
    const prevHistory = initialAnswers?._savedHistory || [];
    const now = new Date().toISOString();
    const allAnswers = {
      _systems: selectedSystems,
      _savedAt: now,
      _savedHistory: [...prevHistory, now],
    };
    for (const mod of config.modules) {
      if (mod.submodules.length === 0) allAnswers[mod.id] = devAnswers[mod.id] ?? 0;
      else mod.submodules.forEach(sub => { allAnswers[sub.id] = devAnswers[sub.id] ?? 0; });
    }
    await onSave(dev, allAnswers);
    setDevAnswers(allAnswers);
    setSaving(false);
    setSaved(true);
    setShowReport(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function clear() {
    setDevAnswers({}); setSelectedSystems([]);
    await onSave(dev, null);
    setConfirmClear(false); setSaved(false); setStep("systems");
  }

  if (showReport) return <ReportView dev={dev} config={config} devAnswers={devAnswers} onBack={() => setShowReport(false)} />;
  if (step === "systems") return <SystemSelectionStep dev={dev} systems={systems} initialSelected={selectedSystems} onConfirm={handleSystemsConfirm} />;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-36" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🧠 Matriz de Conhecimento</h1>
          <p className="text-xs text-gray-500 mt-0.5">Olá, <span className="text-blue-400 font-semibold">{dev}</span> — avalie seu conhecimento em cada módulo</p>
          {selectedSystems.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {selectedSystems.map(s => <span key={s} className="text-xs bg-blue-900 text-blue-300 rounded-full px-2 py-0.5">{s}</span>)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("systems")} className="text-gray-600 hover:text-gray-400 text-xs transition-colors">← Sistemas</button>
          {onLogout && <button onClick={onLogout} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Sair</button>}
        </div>
      </div>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-white font-semibold text-sm">📋 Antes de começar, leia com atenção</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Esta avaliação tem como objetivo mapear o nível de conhecimento de cada membro do time sobre os módulos e rotinas do sistema — considerando tanto o <span className="text-white font-medium">entendimento do processo de negócio</span> quanto o <span className="text-white font-medium">domínio técnico</span>.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            O objetivo <span className="text-white font-medium">não</span> é avaliar desempenho individual, mas identificar riscos e oportunidades de compartilhamento de conhecimento no time.
          </p>
        </div>
        {config.modules.length === 0
          ? <p className="text-gray-500 text-sm">Nenhum módulo cadastrado ainda.</p>
          : (
            <div className="space-y-3">
              {config.modules.map(mod => (
                <div key={mod.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <span className="text-blue-300 font-medium text-sm">{mod.name}</span>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {mod.submodules.length === 0
                      ? <div><span className="text-gray-400 text-sm block mb-2">Nível geral</span>
                          <LevelSelector level={devAnswers[mod.id] ?? 0} onChange={v => setLevel(mod.id, v)} /></div>
                      : mod.submodules.map(sub => (
                          <div key={sub.id}>
                            <span className="text-gray-300 text-sm block mb-2">↳ {sub.name}</span>
                            <LevelSelector level={devAnswers[sub.id] ?? 0} onChange={v => setLevel(sub.id, v)} />
                          </div>
                        ))
                    }
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
      {config.modules.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-3 z-50">
          <div className="max-w-3xl mx-auto flex gap-2">
            <button onClick={submit} disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 py-3 rounded-xl font-semibold text-sm transition-colors text-white">
              {saving ? "Salvando..." : saved ? "✅ Salvo" : "💾 Salvar respostas"}
            </button>
            <button onClick={() => setShowReport(true)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 py-3 rounded-xl font-semibold text-sm transition-colors text-gray-200 flex items-center justify-center gap-1">
              📄 Ver relatório
            </button>
            <button onClick={() => setConfirmClear(true)}
              className="bg-gray-800 hover:bg-red-950 border border-gray-700 hover:border-red-800 text-gray-400 hover:text-red-400 px-4 py-3 rounded-xl text-sm transition-colors">
              🗑️
            </button>
          </div>
          {confirmClear && (
            <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between bg-red-950 border border-red-800 rounded-xl px-4 py-2">
              <span className="text-red-300 text-sm">Limpar respostas de <strong>{dev}</strong>?</span>
              <div className="flex gap-2 ml-4">
                <button onClick={clear} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Confirmar</button>
                <button onClick={() => setConfirmClear(false)} className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Change Password View ──────────────────────────────────────
function ChangePasswordView({ manager, onChanged, onLogout }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleChange() {
    if (newPass.trim().length < 4) { setMsg({ ok: false, text: "A senha deve ter pelo menos 4 caracteres." }); return; }
    if (newPass !== confirmPass) { setMsg({ ok: false, text: "As senhas não coincidem." }); return; }
    setSaving(true);
    await onChanged(newPass.trim());
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mb-1">
            <p className="text-orange-400 font-bold text-2xl tracking-widest leading-none">TAGAT</p>
            <p className="text-orange-400 font-light text-xs tracking-widest">Foodtech</p>
          </div>
          <h1 className="text-xl font-bold text-white mt-4">Redefinir Senha</h1>
          <p className="text-gray-500 text-sm mt-1">Olá, <span className="text-yellow-400 font-semibold">{manager.name}</span>! Defina sua nova senha para continuar.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nova senha</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
              placeholder="Digite a nova senha..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Confirmar senha</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleChange()}
              placeholder="Confirme a nova senha..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
          </div>
          {msg && <p className={`text-xs text-center ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
          <button onClick={handleChange} disabled={saving}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-60 py-3 rounded-xl font-semibold text-sm text-white transition-colors">
            {saving ? "Salvando..." : "Confirmar nova senha"}
          </button>
          <button onClick={onLogout} className="w-full text-gray-600 hover:text-gray-400 text-xs py-1 transition-colors">← Voltar</button>
        </div>
      </div>
    </div>
  );
}

// ── Entry Screen ──────────────────────────────────────────────
function EntryScreen({ config, devCodes, managers, onDevAccess, onManagerAccess, onChangePass }) {
  const [screen, setScreen] = useState("dev");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changeMsg, setChangeMsg] = useState(null);
  const [name, setName] = useState("");

  function tryCode() {
    const trimmed = code.trim().toLowerCase();
    const entry = Object.entries(devCodes).find(([, c]) => c.toLowerCase() === trimmed);
    const devByBank = entry ? entry[0] : null;
    // fallback: procura dev pelo código antigo (hash simples) caso não esteja no banco
    const dev = devByBank || config.devs.find(d => {
      let h = 0;
      for (let i = 0; i < d.length; i++) h = (Math.imul(31, h) + d.charCodeAt(i)) | 0;
      return (Math.abs(h) % 90000 + 10000).toString() === code.trim();
    });
    if (dev) onDevAccess(dev);
    else { setCodeErr("Código inválido. Verifique com seu gestor."); setTimeout(() => setCodeErr(""), 2500); }
  }

 function tryManager() {
  if (!name.trim()) { setPassErr("Digite seu nome."); setTimeout(() => setPassErr(""), 2500); return; }
  const manager = managers.find(m => m.name.toLowerCase() === name.trim().toLowerCase() && m.password === pass);
  if (manager) onManagerAccess(manager);
  else { setPassErr("Nome ou senha incorretos."); setTimeout(() => setPassErr(""), 2500); }
}
  function tryChangePass() {
    if (oldPass !== managerPass) { setChangeMsg({ ok: false, text: "Senha atual incorreta." }); return; }
    if (newPass.trim().length < 4) { setChangeMsg({ ok: false, text: "A nova senha deve ter pelo menos 4 caracteres." }); return; }
    if (newPass !== confirmPass) { setChangeMsg({ ok: false, text: "As senhas não coincidem." }); return; }
    onChangePass(newPass.trim());
    setChangeMsg({ ok: true, text: "Senha alterada com sucesso!" });
    setTimeout(() => { setOldPass(""); setNewPass(""); setConfirmPass(""); setChangeMsg(null); setScreen("manager"); setPass(""); }, 2000);
  }
  function reset(s) { setCode(""); setPass(""); setOldPass(""); setNewPass(""); setConfirmPass(""); setChangeMsg(null); setCodeErr(""); setPassErr(""); setScreen(s); }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mb-1">
            <p className="text-orange-400 font-bold text-2xl tracking-widest leading-none">TAGAT</p>
            <p className="text-orange-400 font-light text-xs tracking-widest">Foodtech</p>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">Matriz de Conhecimento</h1>
          <p className="text-gray-500 text-sm mt-1">Bus Factor Tracker</p>
        </div>
        {screen === "dev" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-gray-300 text-sm text-center">Digite seu código de acesso:</p>
            <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && tryCode()}
              placeholder="Cole seu código aqui" autoFocus
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-center font-mono text-sm tracking-wider focus:outline-none placeholder-gray-600 ${codeErr ? "border-red-600 text-red-400" : "border-gray-700 focus:border-blue-500 text-white"}`} />
            {codeErr && <p className="text-red-400 text-xs text-center">{codeErr}</p>}
            <button onClick={tryCode} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold text-sm text-white transition-colors">Acessar</button>
            <button onClick={() => reset("manager")} className="w-full text-gray-600 hover:text-gray-400 text-xs py-1 transition-colors">Acesso de gestor</button>
          </div>
        )}
{screen === "manager" && (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
    <p className="text-gray-300 text-sm text-center font-semibold">Acesso de Gestor</p>
    <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && tryManager()}
      placeholder="Seu nome..." autoFocus
      className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-sm focus:outline-none placeholder-gray-600 ${passErr ? "border-red-600 text-red-400" : "border-gray-700 focus:border-blue-500 text-white"}`} />
    <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && tryManager()}
      placeholder="Senha..."
      className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-sm focus:outline-none placeholder-gray-600 ${passErr ? "border-red-600 text-red-400" : "border-gray-700 focus:border-blue-500 text-white"}`} />
    {passErr && <p className="text-red-400 text-xs text-center">{passErr}</p>}
    <button onClick={tryManager} className="w-full bg-yellow-600 hover:bg-yellow-500 py-3 rounded-xl font-semibold text-sm text-white transition-colors">Entrar como Gestor</button>
    <button onClick={() => reset("dev")} className="w-full text-gray-600 hover:text-gray-400 text-xs py-1 transition-colors">← Voltar</button>
  </div>
)}
        {screen === "changepass" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-gray-300 text-sm text-center font-semibold">🔐 Alterar Senha do Gestor</p>
            {[["Senha atual", oldPass, setOldPass, false], ["Nova senha", newPass, setNewPass, false], ["Confirmar nova senha", confirmPass, setConfirmPass, true]].map(([label, val, setter, isLast]) => (
              <div key={label}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type="password" value={val} onChange={e => setter(e.target.value)}
                  onKeyDown={e => isLast && e.key === "Enter" && tryChangePass()} placeholder={label + "..."}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
              </div>
            ))}
            {changeMsg && <p className={`text-xs text-center ${changeMsg.ok ? "text-green-400" : "text-red-400"}`}>{changeMsg.text}</p>}
            <button onClick={tryChangePass} className="w-full bg-yellow-600 hover:bg-yellow-500 py-3 rounded-xl font-semibold text-sm text-white transition-colors">Confirmar alteração</button>
            <button onClick={() => reset("manager")} className="w-full text-gray-600 hover:text-gray-400 text-xs py-1 transition-colors">← Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Manager View ──────────────────────────────────────────────
function ManagerView({ config, answers, history, devCodes, isMaster, managerName, managers, onUpdateManagers, managerPass, onChangePass, onUpdateConfig, onUpdateAnswers, onUpdateHistory, onSaveDevAnswers, onLogout }) {
  const [tab, setTab] = useState(isMaster ? "admin" : "matrix");
  const [newDev, setNewDev] = useState("");
  const [newMod, setNewMod] = useState("");
  const [newSubs, setNewSubs] = useState({});
  const [newSystem, setNewSystem] = useState("");
  const [copiedDev, setCopiedDev] = useState(null);
  const [previewDev, setPreviewDev] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [viewSnapshot, setViewSnapshot] = useState(null);
  const systems = config.systems || DEFAULT_SYSTEMS;

  async function addDev() {
    const v = newDev.trim();
    if (!v || config.devs.includes(v)) return;
    // Gera código único baseado em nome + timestamp e salva no banco
    const raw = v + Date.now().toString();
    let h = 0;
    for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = ""; let n = Math.abs(h);
    for (let i = 0; i < 8; i++) { code += chars[n % chars.length]; n = Math.floor(n / chars.length); }
    await supabase.from('dev_codes').upsert({ dev: v, code });
    onUpdateConfig({ ...config, devs: [...config.devs, v] });
    setNewDev("");
  }

  function removeDev(dev) {
    const ans = { ...answers }; delete ans[dev]; onUpdateAnswers(ans);
    onUpdateConfig({ ...config, devs: config.devs.filter(d => d !== dev) });
    supabase.from('dev_codes').delete().eq('dev', dev);
  }
  function addMod() {
    const v = newMod.trim(); if (!v) return;
    onUpdateConfig({ ...config, modules: [...config.modules, { id: `m${Date.now()}`, name: v, submodules: [] }] });
    setNewMod("");
  }
  function removeMod(id) { onUpdateConfig({ ...config, modules: config.modules.filter(m => m.id !== id) }); }
  function addSub(modId) {
    const v = (newSubs[modId] || "").trim(); if (!v) return;
    onUpdateConfig({ ...config, modules: config.modules.map(m => m.id !== modId ? m : { ...m, submodules: [...m.submodules, { id: `s${Date.now()}`, name: v }] }) });
    setNewSubs({ ...newSubs, [modId]: "" });
  }
  function removeSub(modId, subId) {
    onUpdateConfig({ ...config, modules: config.modules.map(m => m.id !== modId ? m : { ...m, submodules: m.submodules.filter(s => s.id !== subId) }) });
  }
  function addSystem() {
    const v = newSystem.trim(); if (!v || systems.includes(v)) return;
    onUpdateConfig({ ...config, systems: [...systems, v] }); setNewSystem("");
  }
  function removeSystem(s) { onUpdateConfig({ ...config, systems: systems.filter(x => x !== s) }); }

  function handleCopy(dev) {
    const code = devCodes[dev] || "";
    copyText(`Olá ${dev}! Seu código de acesso para a Matriz de Conhecimento é: *${code}*`);
    setCopiedDev(dev); setTimeout(() => setCopiedDev(null), 2000);
  }

  function getRows() {
    const rows = [];
    for (const mod of config.modules) {
      if (mod.submodules.length === 0) rows.push({ key: mod.id, label: mod.name, modName: mod.name, subName: null, header: false });
      else {
        rows.push({ key: mod.id, label: mod.name, modName: mod.name, subName: null, header: true });
        for (const sub of mod.submodules) rows.push({ key: sub.id, label: sub.name, modName: mod.name, subName: sub.name, header: false, indent: true });
      }
    }
    return rows;
  }

  function busFactor(key) { return config.devs.filter(d => (answers[d]?.[key] ?? 0) >= 2).length; }
  function bfColor(n) { if (n <= 1) return "#ef4444"; if (n === 2) return "#eab308"; return "#22c55e"; }

  if (viewSnapshot) return <SnapshotView dev={viewSnapshot.dev} snapshot={viewSnapshot.snapshot} config={config} onBack={() => setViewSnapshot(null)} />;
  if (previewMode && previewDev) {
    return <DevFillView dev={previewDev} config={config} initialAnswers={answers[previewDev] || {}} onSave={onSaveDevAnswers} onLogout={() => setPreviewMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🧠 Matriz de Conhecimento</h1>
          <p className="text-xs text-gray-500 mt-0.5">Painel do <span className="text-yellow-400 font-semibold">Gestor</span></p>
        </div>
        <button onClick={onLogout} className="text-gray-500 hover:text-gray-300 text-xs">Sair</button>
      </div>

      <div className="bg-gray-900 border-b border-gray-800 flex overflow-x-auto">
        {(isMaster
          ? [["admin","⚙️ Admin"],["links","🔗 Devs"],["preview","👁️ Simular Dev"],["matrix","📊 Matriz"],["gestores","👤 Gestores"]]
           : [["matrix","📊 Matriz"]]
          ).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === k ? "border-b-2 border-yellow-500 text-yellow-400" : "text-gray-400 hover:text-gray-200"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-7x1 mx-auto">

        {/* ── ADMIN TAB ── */}
        {tab === "admin" && (
          <div className="space-y-10">
            <section>
              <h2 className="text-base font-semibold text-gray-200 mb-1">🖥️ Sistemas</h2>
              <p className="text-gray-500 text-xs mb-4">Estes são os sistemas exibidos na pergunta inicial do formulário do dev.</p>
              <div className="flex gap-2 mb-3">
                <input value={newSystem} onChange={e => setNewSystem(e.target.value)} onKeyDown={e => e.key === "Enter" && addSystem()}
                  placeholder="Nome do sistema..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
                <button onClick={addSystem} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold text-white">+ Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8">
                {systems.length === 0 ? <p className="text-gray-600 text-sm">Nenhum sistema cadastrado.</p>
                  : systems.map(s => <Tag key={s} label={s} onRemove={() => removeSystem(s)} />)}
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-200 mb-4">👥 Desenvolvedores</h2>
              <div className="flex gap-2 mb-3">
                <input value={newDev} onChange={e => setNewDev(e.target.value)} onKeyDown={e => e.key === "Enter" && addDev()}
                  placeholder="Nome do desenvolvedor..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
                <button onClick={addDev} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold text-white">+ Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8">
                {config.devs.length === 0 ? <p className="text-gray-600 text-sm">Nenhum desenvolvedor ainda.</p>
                  : config.devs.map(d => <Tag key={d} label={d} onRemove={() => removeDev(d)} />)}
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-200 mb-4">📦 Processos e Subprocessos</h2>
              {config.modules.length === 0 && <p className="text-gray-600 text-sm mb-3">Nenhum processo adicionado ainda.</p>}
              <div className="space-y-3">
                {config.modules.map(mod => (
                  <div key={mod.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                      <span className="text-blue-300 font-medium text-sm">{mod.name}</span>
                      <button onClick={() => removeMod(mod.id)} className="text-xs text-gray-600 hover:text-red-400">✕ Remover</button>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {mod.submodules.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                          <span className="text-gray-300 text-sm">↳ {sub.name}</span>
                          <button onClick={() => removeSub(mod.id, sub.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input value={newSubs[mod.id] || ""} onChange={e => setNewSubs({ ...newSubs, [mod.id]: e.target.value })}
                          onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); addSub(mod.id); } }}
                          placeholder="Adicionar subprocesso..."
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 placeholder-gray-600 text-white" />
                        <button type="button" onClick={() => addSub(mod.id)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white">+ Sub</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <input value={newMod} onChange={e => setNewMod(e.target.value)} onKeyDown={e => e.key === "Enter" && addMod()}
                    placeholder="Nome do novo processo..."
                    className="flex-1 bg-gray-900 border border-dashed border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
                  <button onClick={addMod} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold text-white">+ Processo</button>
                </div>
              </div>
              {config.modules.length === 0 && (
                <div className="mt-4">
                  <button onClick={() => onUpdateConfig({ ...config, modules: SEED_MODULES })}
                    className="w-full border border-dashed border-yellow-700 text-yellow-600 hover:text-yellow-400 hover:border-yellow-500 py-3 rounded-xl text-sm font-medium transition-colors">
                    ⚡ Carregar módulos padrão (SEED)
                  </button>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-200 mb-1">💾 Backup de Dados</h2>
              <p className="text-gray-500 text-xs mb-4">Exporte um arquivo JSON com todos os dados e importe quando precisar restaurar.</p>
              <div className="flex gap-3">
                <button onClick={() => {
                    const payload = JSON.stringify({ config, answers, history, managerPass }, null, 2);
                    const blob = new Blob([payload], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `bft-backup-${new Date().toISOString().slice(0,10)}.json`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 2000);
                  }}
                  className="flex-1 bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
                  ⬇️ Exportar backup
                </button>
                <label className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl text-sm font-semibold transition-colors text-center cursor-pointer">
                  ⬆️ Importar backup
                  <input type="file" accept=".json" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      try {
                        const data = JSON.parse(ev.target.result);
                        if (data.config) onUpdateConfig(data.config);
                        if (data.answers) onUpdateAnswers(data.answers);
                        if (data.history) onUpdateHistory(data.history);
                        if (data.managerPass) onChangePass(data.managerPass);
                        alert("✅ Backup restaurado com sucesso!");
                      } catch { alert("❌ Arquivo inválido."); }
                    };
                    reader.readAsText(file); e.target.value = "";
                  }} />
                </label>
              </div>
            </section>
          </div>
        )}

        {/* ── LINKS TAB ── */}
        {tab === "links" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-200 mb-1">🔗 Código dos Devs</h2>
            <p className="text-gray-500 text-sm mb-5">Cada dev recebe um código único para acessar apenas o próprio formulário.</p>
            {config.devs.length === 0
              ? <p className="text-gray-500 text-sm">Cadastre desenvolvedores na aba Admin primeiro.</p>
              : config.devs.map(dev => (
                <div key={dev} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{dev}</span>
                      {answers[dev]
                        ? <span className="text-xs bg-green-950 border border-green-800 text-green-400 px-2 py-0.5 rounded-full">✅ Preenchido</span>
                        : <span className="text-xs bg-gray-800 border border-gray-700 text-gray-500 px-2 py-0.5 rounded-full">⏳ Pendente</span>}
                    </div>
                    <p className="text-gray-500 text-xs">Código: <span className="text-gray-300 font-mono font-bold tracking-widest">{devCodes[dev] || "—"}</span></p>
                    {answers[dev] && (
                      <div className="mt-1 space-y-1">
                        {answers[dev]._savedHistory?.length > 0
                          ? [...answers[dev]._savedHistory].reverse().map((ts, i) => {
                              const snap = history[dev]?.find(s => Math.abs(new Date(s.timestamp) - new Date(ts)) < 5000);
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <p className="text-xs">
                                    <span className="text-gray-600">{i === 0 ? "💾 Último save:" : "   └"}</span>{" "}
                                    <span className={i === 0 ? "text-gray-400" : "text-gray-600"}>
                                      {new Date(ts).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                                    </span>
                                  </p>
                                  {snap && (
                                    <button onClick={() => setViewSnapshot({ dev, snapshot: snap })}
                                      className="text-xs bg-gray-800 hover:bg-orange-950 border border-orange-600 hover:border-orange-400 text-orange-400 hover:text-orange-300 px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap">
                                      Ver Respostas
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          : answers[dev]._savedAt
                            ? <p className="text-gray-600 text-xs">💾 Salvo em: <span className="text-gray-400">{new Date(answers[dev]._savedAt).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}</span></p>
                            : <p className="text-gray-700 text-xs italic">Salve novamente para registrar a data</p>
                        }
                      </div>
                    )}
                    {answers[dev]?.["_systems"]?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {answers[dev]["_systems"].map(s => <span key={s} className="text-xs bg-blue-950 text-blue-400 border border-blue-900 rounded-full px-2 py-0.5">{s}</span>)}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleCopy(dev)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${copiedDev === dev ? "bg-green-700 text-green-200" : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}>
                    {copiedDev === dev ? "✅ Copiado!" : "📋 Copiar"}
                  </button>
                </div>
              ))
            }
          </div>
        )}

        {/* ── PREVIEW TAB ── */}
        {tab === "preview" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-200 mb-1">👁️ Simular visão do Dev</h2>
            <p className="text-gray-500 text-sm mb-4">Visualize e edite o formulário como se fosse um desenvolvedor.</p>
            {config.devs.length === 0
              ? <p className="text-gray-500 text-sm">Cadastre desenvolvedores na aba Admin primeiro.</p>
              : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                  <label className="text-xs text-gray-400 block">Selecione o desenvolvedor:</label>
                  <select value={previewDev} onChange={e => setPreviewDev(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">— Selecione —</option>
                    {config.devs.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button disabled={!previewDev} onClick={() => setPreviewMode(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 rounded-lg text-sm font-semibold text-white transition-colors">
                    Abrir visão do dev →
                  </button>
                </div>
              )
            }
          </div>
        )}

{/* ── GESTORES TAB ── */}
{tab === "gestores" && (
  <div className="space-y-6">
    <div>
      <h2 className="text-base font-semibold text-gray-200 mb-1">👤 Gestores</h2>
      <p className="text-gray-500 text-xs mb-4">Gerencie os gestores com acesso à Matriz de Conhecimento.</p>
    </div>

    {/* Adicionar novo gestor */}
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">+ Novo Gestor</h3>
      <div className="flex gap-2">
        <input id="newManagerName" placeholder="Nome do gestor..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
        <input id="newManagerPass" placeholder="Senha provisória..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 text-white" />
        <button onClick={async () => {
          const name = document.getElementById("newManagerName").value.trim();
          const pass = document.getElementById("newManagerPass").value.trim();
          if (!name || !pass) return alert("Preencha nome e senha.");
          if (managers.find(m => m.name.toLowerCase() === name.toLowerCase())) return alert("Gestor já cadastrado.");
          const { data, error } = await supabase.from('managers').insert({ name, password: pass, is_master: false, must_change_password: true }).select().single();
          if (error) return alert("Erro ao cadastrar gestor.");
          onUpdateManagers([...managers, data]);
          document.getElementById("newManagerName").value = "";
          document.getElementById("newManagerPass").value = "";
        }}
          className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold text-white whitespace-nowrap">
          + Adicionar
        </button>
      </div>
    </div>

    {/* Lista de gestores */}
    <div className="space-y-3">
      {managers.filter(m => !m.is_master).length === 0
        ? <p className="text-gray-500 text-sm">Nenhum gestor cadastrado ainda.</p>
        : managers.filter(m => !m.is_master).map(m => (
          <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium text-sm">{m.name}</p>
              <p className="text-xs mt-0.5">
                {m.must_change_password
                  ? <span className="text-yellow-500">⏳ Aguardando troca de senha</span>
                  : <span className="text-green-400">✅ Senha definida</span>}
              </p>
            </div>
            <button onClick={async () => {
              if (!confirm(`Remover o gestor ${m.name}?`)) return;
              await supabase.from('managers').delete().eq('id', m.id);
              onUpdateManagers(managers.filter(x => x.id !== m.id));
            }}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-red-800">
              Remover
            </button>
          </div>
        ))
      }
    </div>
  </div>
)}



 {/* ── MATRIX TAB ── */}
        {tab === "matrix" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-200">Matriz de Conhecimento</h2>
                <p className="text-gray-500 text-xs mt-0.5">Cor por nivel - Bus Factor = devs com nivel 2 ou mais</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 text-xs text-gray-500 items-center">
                  {LEVEL_COLORS.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span style={{ background: c, width: 10, height: 10, borderRadius: 2, display: "inline-block" }} />
                      {LEVELS[i].label}
                    </span>
                  ))}
                </div>
                <button onClick={() => {
                    const headerCols = config.devs.map(d => {
                      const sys = answers[d]?.["_systems"] || [];
                      const badges = sys.map(s => `<span style="display:inline-block;background:#1e3a5f;color:#93c5fd;border-radius:20px;padding:1px 6px;font-size:9px;margin:1px">${s}</span>`).join("");
                      return `<th style="padding:8px 10px;color:#fff;font-size:11px;font-weight:600;border-bottom:1px solid #374151;border-right:1px solid #374151;text-align:center;white-space:nowrap">${d}${badges ? `<div style="margin-top:3px">${badges}</div>` : ""}</th>`;
                    }).join("");
                    const bodyRows = getRows().map((r, i) => {
                      const bg = i % 2 === 0 ? "#111827" : "#0f172a";
                      if (r.header) return `<tr style="background:#1e293b"><td colspan="${config.devs.length + 2}" style="padding:8px 12px;color:#93c5fd;font-size:12px;font-weight:600">${r.label}</td></tr>`;
                      const bf = config.devs.filter(d => (answers[d]?.[r.key] ?? 0) >= 2).length;
                      const bfCol = bf <= 1 ? "#ef4444" : bf === 2 ? "#eab308" : "#22c55e";
                      const devCells = config.devs.map(d => {
                        const lvl = answers[d]?.[r.key] ?? 0;
                        return `<td style="padding:6px 10px;border-bottom:1px solid #1f2937;border-right:1px solid #1f2937;text-align:center"><span style="display:inline-block;background:${LEVEL_COLORS[lvl]};color:#fff;font-weight:700;border-radius:4px;padding:1px 8px;font-size:11px">${lvl}</span></td>`;
                      }).join("");
                      return `<tr style="background:${bg}"><td style="padding:6px 12px;border-bottom:1px solid #1f2937;border-right:1px solid #1f2937;color:#9ca3af;font-size:12px;white-space:nowrap">${r.indent ? "-> " : ""}${r.label}</td>${devCells}<td style="padding:6px 10px;border-bottom:1px solid #1f2937;text-align:center;font-weight:700;font-size:13px;color:${bfCol}">${bf}</td></tr>`;
                    }).join("");
                    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Matriz de Conhecimento</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#030712;color:#fff;padding:32px}h1{font-size:18px;font-weight:700;margin-bottom:4px}.sub{font-size:12px;color:#6b7280;margin-bottom:20px}.legend{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}.legend span{font-size:11px;color:#9ca3af;display:flex;align-items:center;gap:4px}.dot{width:10px;height:10px;border-radius:2px;display:inline-block}table{width:100%;border-collapse:collapse;font-size:12px}thead tr{background:#1e293b}thead th:first-child{text-align:left}.bf-legend{display:flex;gap:16px;margin-top:20px;flex-wrap:wrap}.bf-item{background:#111827;border:1px solid #1f2937;border-radius:8px;padding:8px 12px;font-size:11px}.bf-item p:first-child{font-weight:600;color:#e5e7eb}.bf-item p:last-child{color:#6b7280;margin-top:2px}footer{text-align:center;font-size:11px;color:#374151;margin-top:24px}@media print{body{padding:16px}@page{margin:1cm;size:landscape}}</style>
</head><body>
<h1>Matriz de Conhecimento</h1>
<p class="sub">Bus Factor Tracker - ${new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })}</p>
<div class="legend">${LEVEL_COLORS.map((c,i) => `<span><span class="dot" style="background:${c}"></span>${LEVELS[i].label}</span>`).join("")}</div>
<table><thead><tr><th style="padding:8px 12px;color:#fff;font-size:11px;font-weight:600;border-bottom:1px solid #374151;border-right:1px solid #374151;text-align:left;min-width:180px">Processo / Subprocesso</th>${headerCols}<th style="padding:8px 12px;color:#fff;font-size:11px;font-weight:600;border-bottom:1px solid #374151;text-align:center">Bus Factor</th></tr></thead><tbody>${bodyRows}</tbody></table>
<div class="bf-legend"><div class="bf-item"><p>Bus Factor 1</p><p>Risco critico</p></div><div class="bf-item"><p>Bus Factor 2</p><p>Atencao</p></div><div class="bf-item"><p>Bus Factor 3+</p><p>Saudavel</p></div></div>
<footer>Bus Factor Tracker - Documento gerado automaticamente</footer>
<script>window.onload=function(){window.print();setTimeout(()=>window.close(),1000)};</script>
</body></html>`;
                    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `matriz-conhecimento-${new Date().toISOString().slice(0,10)}.html`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 2000);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                  Exportar HTML
                </button>
              </div>
            </div>

            {config.devs.length === 0 || config.modules.length === 0
              ? <p className="text-gray-500 text-sm">Configure devs e modulos na aba Admin primeiro.</p>
              : (
                <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "75vh", borderRadius: "12px", border: "1px solid #1f2937" }}>
                  <table style={{ borderCollapse: "collapse", fontSize: "12px", width: "max-content", minWidth: "100%" }}>
                    <thead>
                      <tr style={{ background: "#111827", position: "sticky", top: 0, zIndex: 10 }}>
                        <th style={{ position: "sticky", left: 0, zIndex: 20, background: "#111827", padding: "10px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #1f2937", borderRight: "1px solid #1f2937", whiteSpace: "nowrap", minWidth: "220px" }}>
                          Processo / Subprocesso
                        </th>
                        {config.devs.map(d => (
                          <th key={d} style={{ background: "#111827", padding: "8px 12px", color: "#d1d5db", fontWeight: 600, borderBottom: "1px solid #1f2937", borderRight: "1px solid #1f2937", whiteSpace: "nowrap", textAlign: "center", minWidth: "90px" }}>
                            <div>{d}</div>
                            {answers[d]?.["_systems"]?.length > 0 && (
                              <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginTop: "4px", flexWrap: "wrap" }}>
                                {answers[d]["_systems"].map(s => (
                                  <span key={s} style={{ background: "#1e3a5f", color: "#93c5fd", borderRadius: "20px", padding: "1px 6px", fontSize: "10px", border: "1px solid #1e40af" }}>{s}</span>
                                ))}
                              </div>
                            )}
                          </th>
                        ))}
                        <th style={{ background: "#111827", padding: "8px 12px", color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #1f2937", whiteSpace: "nowrap", textAlign: "center", minWidth: "80px" }}>
                          Bus Factor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRows().map((r, i) => {
                        const bf = busFactor(r.key);
                        const rowBg = i % 2 === 0 ? "#111827" : "#0f172a";
                        return (
                          <tr key={r.key}>
                            <td style={{ position: "sticky", left: 0, zIndex: 5, background: rowBg, padding: r.indent ? "6px 16px 6px 32px" : "6px 16px", borderBottom: "1px solid #1f2937", borderRight: "1px solid #374151", whiteSpace: "nowrap", color: r.header ? "#93c5fd" : r.indent ? "#9ca3af" : "#d1d5db", fontWeight: r.header ? 600 : 400 }}>
                              {r.indent ? "-> " : ""}{r.label}
                            </td>
                            {r.header
                              ? config.devs.map(d => <td key={d} style={{ background: rowBg, padding: "6px 12px", borderBottom: "1px solid #1f2937", borderRight: "1px solid #1f2937", textAlign: "center", color: "#374151" }}>{"—"}</td>)
                              : config.devs.map(d => {
                                  const lvl = answers[d]?.[r.key] ?? 0;
                                  return (
                                    <td key={d} style={{ background: rowBg, padding: "6px 12px", borderBottom: "1px solid #1f2937", borderRight: "1px solid #1f2937", textAlign: "center" }}>
                                      <span style={{ display: "inline-block", background: LEVEL_COLORS[lvl], color: "#fff", borderRadius: 4, padding: "2px 10px", fontWeight: 700, minWidth: 24 }}>{lvl}</span>
                                    </td>
                                  );
                                })
                            }
                            <td style={{ background: rowBg, padding: "6px 12px", borderBottom: "1px solid #1f2937", textAlign: "center" }}>
                              {!r.header && <span style={{ color: bfColor(bf), fontWeight: 700, fontSize: 13 }}>{bf}</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }

            <div className="mt-4 flex gap-4 flex-wrap">
              {[
                ["Bus Factor 1","Risco critico - apenas 1 pessoa domina"],
                ["Bus Factor 2","Atencao - conhecimento concentrado"],
                ["Bus Factor 3+","Saudavel - conhecimento distribuido"]
              ].map(([t, d]) => (
                <div key={t} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs">
                  <p className="font-semibold text-gray-200">{t}</p>
                  <p className="text-gray-500 mt-0.5">{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────
export default function App() {
  const [config, setConfig] = useState({ devs: [], modules: [], systems: [...DEFAULT_SYSTEMS] });
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState({});
  const [devCodes, setDevCodes] = useState({});
  const [managers, setManagers] = useState([]);
  const [managerPass, setManagerPass] = useState(DEFAULT_PASS);
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: cfgData }, { data: ansData }, { data: histData }, { data: codesData }] = await Promise.all([
          supabase.from('config').select('data').eq('id', 'main').single(),
          supabase.from('answers').select('dev, data'),
          supabase.from('history').select('*').order('timestamp', { ascending: true }),
          supabase.from('dev_codes').select('dev, code'),
          supabase.from('managers').select('*'),
        ]);
        if (cfgData) setConfig(cfgData.data);
        if (ansData) {
          const ans = {};
          ansData.forEach(row => { ans[row.dev] = row.data; });
          setAnswers(ans);
        }
        if (histData) {
          const hist = {};
          histData.forEach(row => {
            if (!hist[row.dev]) hist[row.dev] = [];
            hist[row.dev].push({ timestamp: row.timestamp, systems: row.systems, answers: row.answers });
          });
          setHistory(hist);
        }
        if (codesData) {
          const codes = {};
          codesData.forEach(row => { codes[row.dev] = row.code; });
          setDevCodes(codes);
        }
        if (managersData) setManagers(managersData);

      } catch(e) { console.error(e); }
      setLoaded(true);
    }
    load();
  }, []);

  async function saveConfig(cfg) {
    setConfig(cfg);
    await supabase.from('config').upsert({ id: 'main', data: cfg });
  }
  async function saveAnswers(ans) { setAnswers(ans); }
  async function savePass(p) {
    setManagerPass(p);
    await supabase.from('config').upsert({ id: 'main', data: { ...config, managerPass: p } });
  }
  async function saveHistory(hist) { setHistory(hist); }

  async function saveDevAnswers(dev, ans) {
    const next = { ...answers };
    if (ans === null) {
      delete next[dev];
      setAnswers(next);
      await supabase.from('answers').delete().eq('dev', dev);
    } else {
      next[dev] = ans;
      setAnswers(next);
      await supabase.from('answers').upsert({ dev, data: ans });
      const timestamp = ans._savedAt;
      await supabase.from('history').insert({
        dev, timestamp,
        systems: ans._systems || [],
        answers: Object.fromEntries(Object.entries(ans).filter(([k]) => !['_systems','_savedAt','_savedHistory'].includes(k))),
      });
      const hist = { ...history };
      if (!hist[dev]) hist[dev] = [];
      hist[dev].push({ timestamp, systems: ans._systems || [], answers: ans });
      setHistory(hist);
    }
  }

  if (!loaded) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
    </div>
  );

if (!session) return <EntryScreen config={config} devCodes={devCodes} managers={managers} onDevAccess={dev => setSession({ dev })} onManagerAccess={manager => setSession({ manager })} />;

if (session?.manager) {
  if (session.manager.must_change_password) {
    return <ChangePasswordView manager={session.manager} onChanged={async (newPass) => {
      await supabase.from('managers').update({ password: newPass, must_change_password: false }).eq('id', session.manager.id);
      setSession({ manager: { ...session.manager, password: newPass, must_change_password: false } });
    }} onLogout={() => setSession(null)} />;
  }
  return <ManagerView config={config} answers={answers} history={history} devCodes={devCodes} isMaster={session.manager.is_master} managerName={session.manager.name} managers={managers} onUpdateManagers={setManagers} managerPass={managerPass} onChangePass={savePass} onUpdateConfig={saveConfig} onUpdateAnswers={saveAnswers} onUpdateHistory={saveHistory} onSaveDevAnswers={saveDevAnswers} onLogout={() => setSession(null)} />;
}