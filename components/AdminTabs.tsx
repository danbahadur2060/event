"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TabKey = "users" | "bookings" | "email" | "events" | "orders" | "coupons" | "tickets" | "orgs";

export default function Tabs({ initial = "users" as TabKey, onChange }: { initial?: TabKey; onChange?: (k: TabKey) => void }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = (search.get("tab") as TabKey) || initial;
  const [active, setActive] = useState<TabKey>(current);

  useEffect(() => { onChange?.(active); }, [active]);
  useEffect(() => { setActive(current); }, [current]);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "users", label: "Users" },
    { key: "events", label: "Events" },
    { key: "bookings", label: "Bookings" },
    { key: "tickets", label: "Tickets" },
    { key: "orders", label: "Orders" },
    { key: "coupons", label: "Coupons" },
    { key: "orgs", label: "Organizations" },
    { key: "email", label: "Email" },
  ];

  const setTab = (k: TabKey) => {
    const params = new URLSearchParams(search.toString());
    params.set("tab", k);
    router.replace(`${pathname}?${params.toString()}`);
    setActive(k);
  };

  return (
    <div>
      <div className="flex gap-2 border-b border-dark-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t-md ${active === t.key ? "bg-primary text-black" : "glass"}`}
            aria-pressed={active === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
