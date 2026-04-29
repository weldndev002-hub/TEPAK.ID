import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const IDLE_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const WARNING_BEFORE_MS = 5 * 60 * 1000; // Show warning 5 minutes before logout

/**
 * Hook to track user idle time and auto-logout after 3 hours of inactivity.
 * Tracks: mouse movement, keyboard input, clicks, scrolls, touch events.
 * Shows a warning dialog 5 minutes before logout.
 * Resets timer on any user activity.
 */
export function useIdleTimeout() {
    const [showWarning, setShowWarning] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const warningTimeRef = useRef<Date | null>(null);

    const logout = async () => {
        console.log('[IdleTimeout] Session expired due to inactivity. Logging out...');
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('[IdleTimeout] Error signing out:', e);
        }
        // Redirect to login page
        window.location.href = '/login';
    };

    const resetTimers = () => {
        // Clear existing timers
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }

        // Dismiss warning if it was showing
        setShowWarning(false);
        setRemainingSeconds(0);

        // Set warning timer (3 hours - 5 minutes)
        warningTimerRef.current = setTimeout(() => {
            console.log('[IdleTimeout] Showing inactivity warning...');
            setShowWarning(true);
            warningTimeRef.current = new Date(Date.now() + WARNING_BEFORE_MS);

            // Start countdown
            countdownRef.current = setInterval(() => {
                if (warningTimeRef.current) {
                    const diff = Math.max(0, Math.floor((warningTimeRef.current.getTime() - Date.now()) / 1000));
                    setRemainingSeconds(diff);
                    if (diff <= 0) {
                        if (countdownRef.current) clearInterval(countdownRef.current);
                    }
                }
            }, 1000);
        }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

        // Set logout timer (3 hours)
        idleTimerRef.current = setTimeout(() => {
            logout();
        }, IDLE_TIMEOUT_MS);
    };

    const extendSession = () => {
        // User clicked "Stay Logged In" — reset all timers
        resetTimers();
    };

    useEffect(() => {
        // Activity events to track
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'keypress'
        ];

        // Debounce reset to avoid excessive timer resets
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;

        const handleActivity = () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                resetTimers();
            }, 1000); // Reset timers at most once per second
        };

        // Attach event listeners
        events.forEach((event) => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Initialize timers
        resetTimers();

        return () => {
            // Cleanup
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, []);

    return { showWarning, remainingSeconds, extendSession, logout };
}
