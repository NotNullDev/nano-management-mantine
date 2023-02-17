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

  // always returns a string in format "<prefix>/<url>"
  static withUrlPrefix(url: string): string {
    let prefix = "api";

    //
    // if (
    //     typeof window === "undefined" &&
    //     process.env.NODE_ENV !== "production") { // yee
    //     prefix = "api/"
    // }

    if (url.endsWith("/")) {
        url = url.slice(0, -1)
    }

    if (url.startsWith("/")) {
        url =  url.slice(1)
    }

    return prefix + "/" + url
  }
}

