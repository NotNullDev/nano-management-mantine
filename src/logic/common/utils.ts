import dayjs from "dayjs";

export class NanoUtils {
  static formatMinutes(minutes: number): string {
    const dur = dayjs.duration({
      minutes,
    });

    const hours = Math.floor(dur.asHours());
    const minutesLeft = dur.minutes() - hours * 60;

    return `${hours}h ${minutesLeft}m`;
  }

  static joinAndFilters(filters: string[]): string {
    return filters.join(" && ");
  }

  static joinOrFilters(filters: string[]): string {
    return filters.join(" || ");
  }

  static makeUnique<T>(arr: T[]) {
    return [...new Set(arr)];
  }
}
