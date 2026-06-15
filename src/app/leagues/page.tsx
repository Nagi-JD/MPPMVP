"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { SPORTS } from "@/lib/catalog";
import { SportLogo } from "@/components/SportLogo";
import type { Group, League } from "@/lib/types";

export default function LeaguesPage() {
  const { userId } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const provider = getProvider();

  useEffect(() => {
    provider.listLeagues().then(setLeagues);
  }, [provider]);

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

  const input = "w-full rounded-xl border border-line bg-ink px-3.5 py-3 text-sm text-white placeholder:text-muted/60 focus:border-violet";

  return (
    <div className="px-5 pt-7">
      <p className="eyebrow">Competitions</p>
      <h1 className="mt-2 mb-4 font-display text-3xl font-extrabold tracking-tight">Leagues</h1>

      <h2 className="eyebrow mb-2">Official seasons</h2>
      <ul className="space-y-2">
        {leagues.map((l) => {
          const meta = SPORTS[l.sport];
          return (
            <li key={l.id} className={`flex items-center gap-3 rounded-xl border ${meta.border} bg-ink-800/60 px-4 py-3`}>
              <SportLogo sport={l.sport} className="h-6 w-7" />
              <span className="flex-1">
                <span className="block font-display font-bold">{l.org}</span>
                <span className={`text-xs ${meta.accent}`}>{meta.label} · Season {l.season}</span>
              </span>
              <span className="font-mono text-xs text-muted">{l.season}</span>
            </li>
          );
        })}
      </ul>

      <h2 className="eyebrow mb-2 mt-6">Private mini-leagues</h2>
      <div className="space-y-3 rounded-2xl border border-line bg-ink-800/60 p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Office Hoops Crew" className={input} />
        <button onClick={create} className="w-full rounded-xl bg-violet py-3 text-sm font-bold text-white shadow-glow transition hover:bg-violet-light">Create mini-league</button>
        <div className="h-px bg-line" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Invite code" className={`${input} font-mono uppercase tracking-widest`} />
        <button onClick={join} className="w-full rounded-xl border border-violet py-3 text-sm font-bold text-violet-light transition hover:bg-violet/10">Join with code</button>
      </div>

      {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
      {groups.length > 0 && (
        <ul className="mt-3 space-y-2">
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
