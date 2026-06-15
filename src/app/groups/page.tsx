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
    setMsg(`Created ${g.name} — invite code ${g.inviteCode}`);
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

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand">Groups</h1>
      <div className="space-y-2 rounded-xl border bg-white p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New league name"
          className="w-full rounded border px-3 py-2"
        />
        <button onClick={create} className="w-full rounded bg-brand py-2 text-white">
          Create league
        </button>
      </div>
      <div className="space-y-2 rounded-xl border bg-white p-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Invite code"
          className="w-full rounded border px-3 py-2"
        />
        <button onClick={join} className="w-full rounded border border-brand py-2 text-brand">
          Join league
        </button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      <ul className="space-y-1">
        {groups.map((g) => (
          <li key={g.id} className="rounded bg-white px-3 py-2 text-sm">
            {g.name} — <b>{g.inviteCode}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
