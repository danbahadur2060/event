// Centralized exports for database models
export { default as Event } from './event.model';
export { default as Booking } from './booking.model';
export { default as User } from './user.model';
export { default as Organization } from './organization.model';
export { default as TicketType } from './ticketType.model';
export { default as Order } from './order.model';
export { default as Coupon } from './coupon.model';

// Re-export types for convenience
export type { Event as IEvent, EventDocument } from './event.model';
export type { Booking as IBooking, BookingDocument } from './booking.model';
export type { User as IUser, UserDocument, UserRole } from './user.model';
export type { Organization as IOrganization } from './organization.model';
export type { TicketType as ITicketType } from './ticketType.model';
export type { Order as IOrder } from './order.model';
export type { Coupon as ICoupon } from './coupon.model';
