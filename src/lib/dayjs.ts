import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import customParseFormat from 'dayjs/plugin/customParseFormat'

export function initDayjs() {
  dayjs.extend(durationPlugin);
  dayjs.extend(customParseFormat);
}
