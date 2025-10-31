// Centralized exports for database models
export { default as Event } from './event.model';
export { default as Booking } from './booking.model';

// Re-export types for convenience
export type { Event as IEvent, EventDocument } from './event.model';
export type { Booking as IBooking, BookingDocument } from './booking.model';
