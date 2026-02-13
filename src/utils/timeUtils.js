export const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (isNaN(h) || isNaN(m)) return timeStr;

        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedH = h % 12 || 12; // Handle 0 as 12
        const formattedM = m.toString().padStart(2, '0');

        return `${formattedH}:${formattedM} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return dateStr;
    }
};
