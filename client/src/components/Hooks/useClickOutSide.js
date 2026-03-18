import { useEffect, useRef } from "react";

export const useClickOutside = (handler) => {
  const domNode = useRef();
  useEffect(() => {
    const maybeHandler = (e) => {
      if (domNode.current && !domNode.current.contains(e.target)) handler();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handler();
    };

    document.addEventListener("mousedown", maybeHandler);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", maybeHandler);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handler]);
  return domNode;
};
