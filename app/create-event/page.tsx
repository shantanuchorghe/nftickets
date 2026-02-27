"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/tickets";

export default function CreateEventPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    price: "",
    totalSupply: "",
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.date || !form.price || !form.totalSupply) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createEvent({
        name: form.name,
        description: form.description,
        date: new Date(form.date).toISOString(),
        price: Number(form.price),
        total_supply: Number(form.totalSupply),
      });

      // Clear the form and redirect to the events list
      setForm({ name: "", description: "", date: "", price: "", totalSupply: "" });
      router.push("/events");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create event.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Create New Event</h1>
        <p className="text-zinc-400">Set up a new event and configure its NFT ticketing parameters.</p>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 sm:p-8 shadow-xl">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <p className="text-sm text-rose-400">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleCreateEvent} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Event Name *</label>
            <input
              placeholder="e.g. Solana Breakpoint 2026"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-3 text-white outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Date & Time *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-3 text-white outline-none transition-all [color-scheme:dark]"
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Ticket Price (SOL) *</label>
                <input
                  placeholder="0.5"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-3 text-white outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-zinc-300">Total Supply *</label>
                <input
                  placeholder="1000"
                  type="number"
                  min="1"
                  value={form.totalSupply}
                  onChange={(e) => setForm((prev) => ({ ...prev, totalSupply: e.target.value }))}
                  className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-3 text-white outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea
              placeholder="Tell attendees what to expect..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-3 text-white outline-none transition-all min-h-[120px] resize-y"
            />
          </div>

          <div className="pt-4 border-t border-[#27272a]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
