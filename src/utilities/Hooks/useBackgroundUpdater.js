import { useEffect, useRef } from "react";

const useBackgroundUpdater = (callback, interval = 300000) => {
    const intervalRef = useRef(null);

    const startInterval = () => {
        clearInterval(intervalRef.current); // Clear any existing intervals
        intervalRef.current = setInterval(callback, interval); // Start a new interval
    };

    const stopInterval = () => {
        clearInterval(intervalRef.current); // Stop the interval
    };
    //hello

    const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
            // Trigger immediate update when tab becomes visible
            callback();
            startInterval();
        } else {
            stopInterval(); // Stop updates when tab is hidden
        }
    };

    const handleFocus = () => {
        // Immediate update when window or tab gains focus
        callback();
    };

    useEffect(() => {
        // Start interval and listen for visibility/focus changes
        startInterval();
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            // Cleanup intervals and event listeners on unmount
            stopInterval();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [callback, interval]);
};

export default useBackgroundUpdater;
