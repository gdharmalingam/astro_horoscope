"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setKeys(await api.listApiKeys());
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const created = await api.createApiKey(name);
      setNewKey(created.api_key);
      setName("");
      load();
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-accent">API Keys</h1>
        <Link href="/" className="underline opacity-70">
          Home
        </Link>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          placeholder="Key name (e.g. production)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10"
        />
        <button className="px-4 py-2 rounded bg-accent text-cosmic font-semibold">
          Create
        </button>
      </form>

      {newKey && (
        <div className="bg-green-900/40 border border-green-500/40 p-3 rounded text-sm">
          <p className="font-semibold text-green-300">
            Copy your key now — it will not be shown again:
          </p>
          <code className="break-all">{newKey}</code>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <ul className="space-y-2">
        {keys.map((k) => (
          <li
            key={k.id}
            className="flex justify-between bg-black/20 px-4 py-3 rounded"
          >
            <span>{k.name}</span>
            <code className="opacity-70">{k.prefix}…</code>
          </li>
        ))}
      </ul>
    </main>
  );
}
