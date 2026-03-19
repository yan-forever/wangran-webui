import type { EventsData } from '@/types/events.ts';
import type { Organizer } from '@/types/organizers.ts';

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
};

const formatLocaleDateTime = (
    dateString: string | null | undefined,
    fallback: string,
    options: Intl.DateTimeFormatOptions,
) => {
    if (!dateString) return fallback;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString('zh-CN', options);
};

export const formatDate = (dateString: string | null | undefined) =>
    formatLocaleDateTime(dateString, '未知时间', DATE_TIME_OPTIONS);

export const formatDateShort = (dateStr: string | null | undefined) =>
    formatLocaleDateTime(dateStr, '时间待定', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const formatToInstant = (timeStr: string | number | null) => {
    if (timeStr === null || timeStr === undefined || timeStr === '') return null;
    // new Date 会自动把本地时间转换成标准的 UTC ISO-8601 格式
    const date = new Date(timeStr);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};
// UTC ISO字符串 → datetime-local 所需的本地时间格式
export const formatToDatetimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
type OrganizersUnion = number[] | Organizer[] | null;
export const isOrganizerArray = (value: OrganizersUnion): value is Organizer[] => {
    return (
        Array.isArray(value) &&
        value.every((item) => typeof item === 'object' && item !== null && 'id' in item)
    );
};

export const toOrganizerIds = (organizers: EventsData['organizers']): number[] => {
    if (isOrganizerArray(organizers)) {
        return organizers.map((item) => Number(item.id)).filter((item) => !Number.isNaN(item));
    }

    if (Array.isArray(organizers)) {
        return organizers.filter((item): item is number => !Number.isNaN(item));
    }
    return [];
};

export const getSaleStatus = (startTime: string | null, endTime: string | null, currentTime: number = Date.now()) => {
    if (!startTime || !endTime) return '未定义';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (currentTime < start) return '未开售';
    if (currentTime > end) return '已售罄';
    return '售票中';
};

