import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * PageTransition — wraps children with a smooth fade + slide animation
 * whenever the route changes.
 */
export default function PageTransition({ children }) {
    const location = useLocation();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState("enter");
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        if (location.pathname !== prevPathRef.current) {
            // Route changed — start exit animation
            setTransitionStage("exit");
            prevPathRef.current = location.pathname;

            const exitTimer = setTimeout(() => {
                // After exit animation, swap content and start enter
                setDisplayChildren(children);
                setTransitionStage("enter");
            }, 200); // exit duration

            return () => clearTimeout(exitTimer);
        } else {
            // Same route or first load — just show immediately
            setDisplayChildren(children);
        }
    }, [location.pathname, children]);

    return (
        <div
            className={`page-transition page-transition--${transitionStage}`}
            style={{ minHeight: "100vh" }}
        >
            {displayChildren}
        </div>
    );
}
