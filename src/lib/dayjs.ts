import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";

export function initDayjs() {
  dayjs.extend(durationPlugin);
}
