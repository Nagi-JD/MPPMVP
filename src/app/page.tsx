"use client";
import { useEffect, useState } from "react";
import { getProvider } from "@/lib/data/client";
import { useSession } from "@/store/useSession";
import { EventCard } from "@/components/EventCard";
import type { GameEvent, Outcome, Prediction } from "@/lib/types";

export default function Home() {
  const { userId } = useSession();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const provider = getProvider();

  useEffect(() => {
    (async () => {
      setEvents(await provider.listEvents());
      setPreds(await provider.getPredictions(userId));
    })();
  }, [userId, provider]);

  async function submit(eventId: string, choice: Outcome) {
    await provider.submitPrediction(userId, eventId, choice);
    setPreds(await provider.getPredictions(userId));
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl font-bold text-brand">Predict</h1>
      {events.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          existing={preds.find((p) => p.eventId === e.id)}
          onSubmit={(o) => submit(e.id, o)}
        />
      ))}
    </div>
  );
}
