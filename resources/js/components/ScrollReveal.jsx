import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal — reveals children with a smooth animation when scrolled into view.
 *
 * Props:
 *  - direction: "up" | "down" | "left" | "right" | "fade" | "scale" (default: "up")
 *  - delay: delay in ms before the animation starts (default: 0)
 *  - duration: animation duration in ms (default: 600)
 *  - threshold: IntersectionObserver threshold 0-1 (default: 0.15)
 *  - once: if true, only animates once (default: true)
 *  - className: additional class names
 *  - as: wrapper element type (default: "div")
 */
export default function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration = 600,
    threshold = 0.15,
    once = true,
    className = "",
    as: Component = "div",
    style: extraStyle = {},
    ...rest
}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(el);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin: "0px 0px -40px 0px" }
        );

        observer.observe(el);
        return () => observer.unobserve(el);
    }, [threshold, once]);

    // Build initial transform based on direction
    const transforms = {
        up: "translateY(32px)",
        down: "translateY(-32px)",
        left: "translateX(32px)",
        right: "translateX(-32px)",
        fade: "translateY(0)",
        scale: "scale(0.92)",
    };

    const baseStyle = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) translateX(0) scale(1)" : transforms[direction] || transforms.up,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
        ...extraStyle,
    };

    return (
        <Component
            ref={ref}
            className={className}
            style={baseStyle}
            {...rest}
        >
            {children}
        </Component>
    );
}
