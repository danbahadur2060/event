import { Booking } from "@/database";
import connectDB from "../mongodb";

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    await connectDB();
    const booking = (await Booking.create({ eventId, slug, email })).toObject();
    return { success: true, booking };
  } catch (error) {
    console.log("create booking failed");
    return { success: false, e: error };
  }
};
