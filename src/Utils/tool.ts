import type { EventsData, Organizer } from './interface.tsx';

export const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return '待定';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatToInstant = (timeStr: string | number | null) => {
    if (!timeStr) return null;
    // new Date 会自动把本地时间转换成标准的 UTC ISO-8601 格式
    return new Date(timeStr as string).toISOString();
};
// UTC ISO字符串 → datetime-local 所需的本地时间格式
export const formatToDatetimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
type OrganizersUnion = number[] | Organizer[] | null;
export const isNumberArray = (value: OrganizersUnion): value is number[] => {
    return Array.isArray(value) && value.every((item) => typeof item === 'number');
};
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
