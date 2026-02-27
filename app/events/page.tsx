"use client";

import { useCallback, useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { supabase } from "@/lib/supabase";

type EventRow = {
  id: string;
  name: string;
  description: string;
  date: string;
  price: number;
  total_supply: number;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, name, description, date, price, total_supply")
      .order("date", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setEvents((data ?? []) as EventRow[]);
      setErrorMessage("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Upcoming Events</h1>
        <p className="text-zinc-400">Discover and mint NFT tickets for exclusive web3 events.</p>
      </div>

      {errorMessage && (
        <div className="mb-10 bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <p className="text-sm text-rose-400 mb-3">{errorMessage}</p>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-400">Loading events...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              date={new Date(event.date).toLocaleDateString()}
              image={event.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
