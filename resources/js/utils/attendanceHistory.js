const DEFAULT_EVENT_NAME = "Event belum bernama";
const DEFAULT_LOCATION = "Lokasi belum diatur";

export function normalizeAttendanceHistoryItem(item, index = 0) {
    const status = item?.status === "present" || item?.status === "hadir" ? "hadir" : "tidak_hadir";
    const name = item?.name || item?.event_name || item?.event_title || item?.title || DEFAULT_EVENT_NAME;
    const location = item?.location || item?.location_name || item?.venue || DEFAULT_LOCATION;

    return {
        ...item,
        id: item?.attendance_id || item?.event_id || `${name}-${index}`,
        name,
        event_name: name,
        location,
        division: location,
        date: item?.date || item?.event_date || "-",
        time: item?.checkin_time || item?.time || item?.event_time || "-",
        method: item?.method || "QR Scan",
        status,
    };
}

export function calculateAttendanceSummary(history = []) {
    const normalized = history.map((item, index) => normalizeAttendanceHistoryItem(item, index));
    const total = normalized.length;
    const present = normalized.filter((item) => item.status === "hadir").length;
    const absent = Math.max(total - present, 0);
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
        normalized,
        total,
        present,
        absent,
        rate,
    };
}
