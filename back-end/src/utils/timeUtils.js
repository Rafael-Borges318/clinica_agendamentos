export function addMinutesToISO(isoString, minutes) {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + Number(minutes));
  return d.toISOString();
}

export function ceilToStep(ms, stepMinutes) {
  const stepMs = stepMinutes * 60 * 1000;
  return Math.ceil(ms / stepMs) * stepMs;
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

export function getWindowsForDow(dow) {
  if (dow === 0) return [];
  if (dow === 6) return [["08:00", "12:00"]];
  return [
    ["08:00", "12:00"],
    ["13:00", "17:00"],
  ];
}

export function toISO(dia, hhmm, tz = "-03:00") {
  return new Date(`${dia}T${hhmm}:00${tz}`).toISOString();
}

export function toMsLocal(dia, hhmm, tz = "-03:00") {
  return new Date(`${dia}T${hhmm}:00${tz}`).getTime();
}
