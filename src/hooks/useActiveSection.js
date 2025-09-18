import { useState, useEffect } from 'react';

export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const sections = ['home', 'about', 'method', 'testimonials', 'qualification', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        if (visibleSections.length > 0) {
          const lastVisible = visibleSections.reduce((prev, current) =>
            current.target.offsetTop >= prev.target.offsetTop ? current : prev
          );
          setActiveSection(lastVisible.target.id);
        }
      },
      { rootMargin: '-20% 0px -20% 0px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
      observer.disconnect();
    };
  }, []);

  return activeSection;
};
