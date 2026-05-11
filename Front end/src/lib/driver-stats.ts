import { type Order as CommerceOrder } from "@/lib/commerce";
import { type Order as DriverOrder, type DriverRating } from "@/lib/driver-mock-data";
import { type RideOrder } from "@/lib/ride-orders";

export const PLATFORM_COMMISSION_RATE = 0.15;
const RECENT_RATING_DAYS = 30;

export interface DriverBreak {
  id: string;
  startedAt: string;
  endedAt?: string;
  minutes?: number;
}

export interface DriverWorkSession {
  startedAt: string;
  endedAt?: string;
  breaks?: DriverBreak[];
}

export interface DriverStats {
  todayTripsCount: number;
  hasActiveRide: boolean;
  todayNetEarnings: number;
  averageRecentRating: number;
  recentRatingsCount: number;
  activeWorkingHours: number;
  breakMinutes: number;
}

export function deriveDriverStats(params: {
  rides: RideOrder[];
  commerceOrders: CommerceOrder[];
  driverOrders: DriverOrder[];
  ratings: DriverRating[];
  workSession: DriverWorkSession | null;
  now?: Date;
}): DriverStats {
  const now = params.now ?? new Date();
  const todayRides = params.rides.filter((ride) => isToday(ride.updatedAt, now));
  const todayCommerceOrders = params.commerceOrders.filter((order) => isToday(order.updatedAt, now));

  const acceptedRides = todayRides.filter((ride) => isAcceptedRide(ride.status));
  const acceptedCommerceOrders = todayCommerceOrders.filter((order) => isAcceptedCommerceOrder(order.driverStatus));
  const acceptedDriverOrders = params.driverOrders.filter((order) => order.status === "active" || order.status === "completed");

  const recentRatings = getRecentRatings(params.ratings, now);
  const breakMinutes = params.workSession ? getBreakMinutes(params.workSession, now) : 0;

  return {
    todayTripsCount: acceptedRides.length + acceptedCommerceOrders.length + acceptedDriverOrders.length,
    hasActiveRide:
      todayRides.some((ride) => ride.status === "accepted" || ride.status === "driver_assigned" || ride.status === "on_the_way") ||
      todayCommerceOrders.some((order) => order.driverStatus === "accepted" || order.driverStatus === "picked_up") ||
      params.driverOrders.some((order) => order.status === "active"),
    todayNetEarnings: netAfterCommission(
      acceptedRides.reduce((sum, ride) => sum + (ride.price ?? 0), 0) +
        acceptedCommerceOrders.reduce((sum, order) => sum + order.deliveryFee, 0) +
        acceptedDriverOrders.reduce((sum, order) => sum + order.price, 0),
    ),
    averageRecentRating: averageRating(recentRatings),
    recentRatingsCount: recentRatings.length,
    activeWorkingHours: params.workSession ? getActiveWorkingHours(params.workSession, breakMinutes, now) : 0,
    breakMinutes,
  };
}

export function isToday(value: string | undefined, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isAcceptedRide(status: RideOrder["status"]) {
  return status === "accepted" || status === "driver_assigned" || status === "on_the_way" || status === "completed";
}

function isAcceptedCommerceOrder(status: CommerceOrder["driverStatus"]) {
  return status === "accepted" || status === "picked_up" || status === "delivered";
}

function netAfterCommission(amount: number) {
  return amount * (1 - PLATFORM_COMMISSION_RATE);
}

function getRecentRatings(ratings: DriverRating[], now: Date) {
  const cutoff = now.getTime() - RECENT_RATING_DAYS * 24 * 60 * 60 * 1000;
  return ratings.filter((rating) => new Date(rating.timestamp).getTime() >= cutoff);
}

function averageRating(ratings: DriverRating[]) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
}

function getBreakMinutes(workSession: DriverWorkSession, now: Date) {
  return (workSession.breaks ?? []).reduce((sum, item) => {
    if (typeof item.minutes === "number") return sum + item.minutes;
    if (!item.endedAt) return sum;
    return sum + Math.max(0, Math.floor((new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime()) / 60000));
  }, 0);
}

function getActiveWorkingHours(workSession: DriverWorkSession, breakMinutes: number, now: Date) {
  const end = workSession.endedAt ? new Date(workSession.endedAt) : now;
  const startedAt = new Date(workSession.startedAt);
  const workingMinutes = Math.max(0, Math.floor((end.getTime() - startedAt.getTime()) / 60000) - breakMinutes);
  return workingMinutes / 60;
}
