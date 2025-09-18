import React, { useState, useEffect, Suspense, lazy } from 'react';
import StarsCanvas from './components/StarsCanvas';
import GlobalStyles from './components/GlobalStyles';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './sections/Home';
import About from './sections/About';
import Contact from './sections/Contact';
import PainsTransition from './components/PainsTransition';
import BackToTopButton from './components/BackToTopButton';
import { useActiveSection } from './hooks/useActiveSection';
import { CONFIG, PATHS } from './constants/config';

// Lazy loading для тяжелых компонентов
const Method = lazy(() => import('./sections/Method'));
const Testimonials = lazy(() => import('./sections/Testimonials'));
const Qualification = lazy(() => import('./sections/Qualification'));
const ImageModal = lazy(() => import('./components/ImageModal'));
const ContactModal = lazy(() => import('./components/ContactModal'));

const App = () => {
  // --- STATE ---
  const [modalContent, setModalContent] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState('diplomas');
  const activeSection = useActiveSection();

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <GlobalStyles />

      <div className="starry-bg text-gray-200 font-manrope min-h-screen">
        {/* Звёздный фон (Canvas) */}
        <StarsCanvas count={CONFIG.STARS_COUNT} />

        <Header
          activeSection={activeSection}
          setShowContactModal={setShowContactModal}
        />

        <main className="relative z-10">
          <Home />

          {/* Переход между секциями; параметры управляют смещением/высотой */}
          <PainsTransition offset={0} heightVh={35} />

          <About />

          <PainsTransition offset={12} heightVh={40} />

          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-400">Загрузка...</div>
          </div>}>
            <Method setModalContent={setModalContent} />
          </Suspense>

          <PainsTransition offset={24} />

          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-400">Загрузка...</div>
          </div>}>
            <Testimonials setModalContent={setModalContent} />
          </Suspense>

          <PainsTransition offset={36} />

          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-400">Загрузка...</div>
          </div>}>
            <Qualification
              setModalContent={setModalContent}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Suspense>

          <Contact />
        </main>

        {/* Модальные окна и кнопки */}
        <Suspense fallback={null}>
          <ImageModal
            modalContent={modalContent}
            setModalContent={setModalContent}
          />
        </Suspense>
        <Suspense fallback={null}>
          <ContactModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            qrCodeImage={PATHS.QR_CODE}
          />
        </Suspense>
        <BackToTopButton isVisible={showBackToTop} />
        <Footer />
      </div>
    </>
  );
};

export default App;