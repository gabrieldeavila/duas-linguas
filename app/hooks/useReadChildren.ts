import { useEffect, useState } from "react";

type UseReadChildrenReturn = {
  setContainer: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
  readChildren: Set<number>;
};

export function useReadChildren(): UseReadChildrenReturn {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [readChildren, setReadChildren] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = children.indexOf(entry.target as HTMLElement);
          if (index === -1) return;

          if (
            !entry.isIntersecting &&
            entry.boundingClientRect.top < entry.rootBounds!.top
          ) {
            setReadChildren((prev) => new Set(prev).add(index));
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    children.forEach((child) => observer.observe(child));

    return () => {
      children.forEach((child) => observer.unobserve(child));
    };
  }, [container]);

  return { setContainer, readChildren };
}
