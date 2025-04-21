"use client";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// xAI Grok models and pricing (per 1M tokens, USD)
const XAI_MODELS = [
  {
    id: 'grok-1.5rag',
    name: 'Grok-1.5RAG',
    tokenCostIn: 0.5, // $0.50 per 1M tokens
    tokenCostOut: 1.0, // $1.00 per 1M tokens
    recommended: true,
  },
  {
    id: 'grok-1.5',
    name: 'Grok-1.5',
    tokenCostIn: 0.5,
    tokenCostOut: 1.0,
    recommended: false,
  },
  {
    id: 'grok-1.0',
    name: 'Grok-1.0',
    tokenCostIn: 0.25,
    tokenCostOut: 0.5,
    recommended: false,
  },
];

export default function AdminSettingsPage({ params }: { params?: Promise<any> }) {
  // If you need params, use: const { id } = params ? use(params) : {};
  const { role, loadingRole } = useUserRole();
  const router = useRouter();
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState("grok-1.5rag");
  const [tokenCostIn, setTokenCostIn] = useState("");
  const [tokenCostOut, setTokenCostOut] = useState("");
  const [apiBalance, setApiBalance] = useState("");
  const [apiSpend, setApiSpend] = useState("");
  const [apiError, setApiError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loadingRole && role !== "admin") {
      router.replace("/");
    }
  }, [role, loadingRole, router]);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data } = await supabase
        .from("chatbot_settings")
        .select("id, instructions, model, token_cost_in, token_cost_out")
        .eq("id", 1)
        .single();
      if (data) {
        setInstructions(data.instructions || "");
        setModel(data.model || "grok-1.5rag");
        const modelInfo = XAI_MODELS.find((m) => m.id === (data.model || "grok-1.5rag")) || XAI_MODELS[0];
        setTokenCostIn(String(modelInfo.tokenCostIn));
        setTokenCostOut(String(modelInfo.tokenCostOut));
      } else {
        setInstructions("");
        setModel("grok-1.5rag");
        setTokenCostIn(String(XAI_MODELS[0].tokenCostIn));
        setTokenCostOut(String(XAI_MODELS[0].tokenCostOut));
      }
      setLoading(false);
    }
    if (role === "admin") fetchSettings();
  }, [role]);

  // Update token costs when model changes
  useEffect(() => {
    const modelInfo = XAI_MODELS.find((m) => m.id === model) || XAI_MODELS[0];
    setTokenCostIn(String(modelInfo.tokenCostIn));
    setTokenCostOut(String(modelInfo.tokenCostOut));
  }, [model]);

  useEffect(() => {
    async function fetchApiBalance() {
      try {
        setApiError(false);
        const resp = await fetch("/api/xai-billing");
        const json = await resp.json();
        if (json.balance && json.spend) {
          setApiBalance(json.balance);
          setApiSpend(json.spend);
        } else {
          setApiBalance("");
          setApiSpend("");
          setApiError(true);
        }
      } catch {
        setApiBalance("");
        setApiSpend("");
        setApiError(true);
      }
    }
    fetchApiBalance();
  }, [model]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    await supabase.from("chatbot_settings").upsert({
      id: 1,
      instructions,
      model,
      token_cost_in: tokenCostIn ? Number(tokenCostIn) : null,
      token_cost_out: tokenCostOut ? Number(tokenCostOut) : null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSuccess(true);
  }

  if (loadingRole || loading) return <div className="p-8 text-center">Loading...</div>;
  if (role !== "admin") return null;

  // Theme support: use dark/light mode classes
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <h2 className="text-2xl font-bold mb-4">Chatbot Personality & Model</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-semibold">Personality / Instructions</label>
          <textarea
            className="w-full h-40 border rounded p-2 font-mono bg-muted dark:bg-muted text-foreground placeholder:text-muted-foreground"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Describe the bot's personality, scope, tone, and rules here. Markdown supported."
          />
        </div>
        <div>
          <label className="block font-semibold">xAI Model</label>
          <select className="w-full border rounded p-2 bg-muted dark:bg-muted text-foreground" value={model} onChange={e => setModel(e.target.value)}>
            {XAI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.recommended ? ' (Recommended)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-semibold">Token Cost In (per 1M)</label>
            <input className="w-full border rounded p-2 bg-muted dark:bg-muted text-foreground" type="text" value={`$${tokenCostIn} / 1M tokens`} readOnly />
          </div>
          <div className="flex-1">
            <label className="block font-semibold">Token Cost Out (per 1M)</label>
            <input className="w-full border rounded p-2 bg-muted dark:bg-muted text-foreground" type="text" value={`$${tokenCostOut} / 1M tokens`} readOnly />
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-semibold">xAI API Balance</label>
            <input className="w-full border rounded p-2 bg-muted dark:bg-muted text-foreground" type="text" value={apiBalance ? `$${apiBalance}` : (apiError ? 'Error' : '')} readOnly placeholder="Live from xAI API" />
          </div>
          <div className="flex-1">
            <label className="block font-semibold">xAI API Spend (Total)</label>
            <input className="w-full border rounded p-2 bg-muted dark:bg-muted text-foreground" type="text" value={apiSpend ? `$${apiSpend}` : (apiError ? 'Error' : '')} readOnly placeholder="Live from xAI API" />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {success && <div className="text-green-600 mt-2">Settings saved!</div>}
      </form>
    </div>
  );
}
