import { useState, useEffect } from 'react';

export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'about', 'method', 'testimonials', 'qualification', 'contact'];
    const observer = new IntersectionObserver((entries) => {
      let visibleSections = entries.filter(entry => entry.isIntersecting);
      if (visibleSections.length > 0) {
        // Берём последнюю видимую секцию по порядку в DOM
        const lastVisible = visibleSections[visibleSections.length - 1];
        setActiveSection(lastVisible.target.id);
      }
    }, { rootMargin: '-20% 0px -20% 0px' });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.unobserve(el);
    });
  }, []);

  return activeSection;
};
