"use client";
import { useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const { userId } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const provider = getProvider();

  async function create() {
    if (!name) return;
    const g = await provider.createGroup(userId, name);
    setGroups((s) => [...s, g]);
    setName("");
    setMsg(`Created ${g.name} — share code ${g.inviteCode}`);
  }
  async function join() {
    try {
      const g = await provider.joinGroup(userId, code.toUpperCase());
      setGroups((s) => [...s, g]);
      setMsg(`Joined ${g.name}`);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  const input =
    "w-full rounded-xl border border-line bg-ink px-3.5 py-3 text-sm text-white placeholder:text-muted/60 focus:border-violet";

  return (
    <div className="px-5 pt-7">
      <p className="eyebrow">Private leagues</p>
      <h1 className="mt-2 mb-5 font-display text-3xl font-extrabold tracking-tight">Your Leagues</h1>

      <div className="space-y-3 rounded-2xl border border-line bg-ink-800/60 p-4">
        <label className="eyebrow block">Start a league</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunday Pub Crew" className={input} />
        <button onClick={create} className="w-full rounded-xl bg-violet py-3 text-sm font-bold text-white shadow-glow transition hover:bg-violet-light">
          Create league
        </button>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-line bg-ink-800/60 p-4">
        <label className="eyebrow block">Got an invite code?</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-character code" className={`${input} font-mono uppercase tracking-widest`} />
        <button onClick={join} className="w-full rounded-xl border border-violet py-3 text-sm font-bold text-violet-light transition hover:bg-violet/10">
          Join league
        </button>
      </div>

      {msg && <p className="mt-4 text-sm text-muted">{msg}</p>}

      {groups.length > 0 && (
        <ul className="mt-4 space-y-2">
          {groups.map((g) => (
            <li key={g.id} className="flex items-center justify-between rounded-xl border border-line bg-ink-800/60 px-4 py-3">
              <span className="font-semibold">{g.name}</span>
              <span className="font-mono text-xs tracking-widest text-violet-light">{g.inviteCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
