"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type TicketType = {
  _id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  quantity: number;
  salesStart?: string | null;
  salesEnd?: string | null;
  perUserLimit?: number | null;
};

export default function BuyTickets({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available tickets
    fetch(`/api/tickets?eventId=${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.tickets) {
          setTickets(data.tickets);
        }
      })
      .catch(err => console.error("Failed to fetch tickets", err));
  }, [eventId]);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => {
      if (quantity <= 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: quantity };
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((sum, [ticketId, quantity]) => {
      const ticket = tickets.find(t => t._id === ticketId);
      if (!ticket) return sum;
      return sum + ticket.price * quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    if (Object.keys(selectedTickets).length === 0) {
      setError("Please select at least one ticket");
      return;
    }

    const email = session?.user?.email || prompt("Please enter your email:");
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const items = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity,
      }));

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          email,
          items,
          couponCode: couponCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isTicketAvailable = (ticket: TicketType) => {
    const now = new Date();
    if (ticket.salesStart && new Date(ticket.salesStart) > now) return false;
    if (ticket.salesEnd && new Date(ticket.salesEnd) < now) return false;
    return ticket.quantity > 0;
  };

  if (tickets.length === 0) {
    return null; // No tickets available
  }

  const total = calculateTotal();
  const currency = tickets[0]?.currency || "USD";

  return (
    <div className="glass p-6 rounded-md space-y-4">
      <h2 className="text-xl font-bold">Purchase Tickets</h2>

      <div className="space-y-3">
        {tickets.map(ticket => {
          const available = isTicketAvailable(ticket);
          const selectedQty = selectedTickets[ticket._id] || 0;

          return (
            <div key={ticket._id} className="flex items-center justify-between border-b border-dark-200 pb-3">
              <div className="flex-1">
                <h3 className="font-medium">{ticket.name}</h3>
                <p className="text-sm text-light-200">
                  ${(ticket.price / 100).toFixed(2)} {ticket.currency}
                </p>
                {!available && (
                  <p className="text-xs text-red-400">Not available</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(ticket._id, selectedQty - 1)}
                  disabled={!available || selectedQty === 0}
                  className="bg-dark-200 px-3 py-1 rounded disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-8 text-center">{selectedQty}</span>
                <button
                  onClick={() => handleQuantityChange(ticket._id, selectedQty + 1)}
                  disabled={!available || (ticket.perUserLimit != null && selectedQty >= ticket.perUserLimit)}
                  className="bg-dark-200 px-3 py-1 rounded disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Coupon code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="w-full bg-dark-200 rounded px-4 py-2"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-200">
        <span className="font-bold">Total:</span>
        <span className="font-bold text-xl">
          ${(total / 100).toFixed(2)} {currency}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || Object.keys(selectedTickets).length === 0}
        className="w-full bg-primary text-black rounded px-4 py-3 font-medium disabled:opacity-50"
      >
        {loading ? "Processing..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}
