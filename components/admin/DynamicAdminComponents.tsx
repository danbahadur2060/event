'use client';

import dynamic from "next/dynamic";

export const OrderManagerWrapper = dynamic(() => import("@/components/admin/OrderManager"), { ssr: false });
export const CouponManagerWrapper = dynamic(() => import("@/components/admin/CouponManager"), { ssr: false });
export const TicketManagerWrapper = dynamic(() => import("@/components/admin/TicketManager"), { ssr: false });
export const EventManagerWrapper = dynamic(() => import("@/components/admin/EventManager"), { ssr: false });