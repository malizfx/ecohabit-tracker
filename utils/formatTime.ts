/**
 * formatTime.ts — Relative time formatting for mobile UI.
 * Shows "Just now", "3m ago", "2h ago", "Yesterday", etc.
 */

export const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Checks if a timestamp is from today.
 */
export const isToday = (timestamp: number): boolean => {
    return new Date(timestamp).toDateString() === new Date().toDateString();
};

/**
 * Checks if a timestamp is from yesterday.
 */
export const isYesterday = (timestamp: number): boolean => {
    const yesterday = new Date(Date.now() - 86_400_000);
    return new Date(timestamp).toDateString() === yesterday.toDateString();
};
