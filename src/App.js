import React, { useState, useEffect } from 'react';
import StarsCanvas from './components/StarsCanvas';
import GlobalStyles from './components/GlobalStyles';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './sections/Home';
import About from './sections/About';
import Method from './sections/Method';
import Testimonials from './sections/Testimonials';
import Qualification from './sections/Qualification';
import Contact from './sections/Contact';
import PainsTransition from './components/PainsTransition';
import ImageModal from './components/ImageModal';
import ContactModal from './components/ContactModal';
import BackToTopButton from './components/BackToTopButton';
import { useActiveSection } from './hooks/useActiveSection';

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
        <StarsCanvas count={156} />

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

          <Method setModalContent={setModalContent} />

          <PainsTransition offset={24} />

          <Testimonials setModalContent={setModalContent} />

          <PainsTransition offset={36} />

          <Qualification
            setModalContent={setModalContent}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <Contact />
        </main>

        {/* Модальные окна и кнопки */}
        <ImageModal
          modalContent={modalContent}
          setModalContent={setModalContent}
        />
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          qrCodeImage="/images/QR.png"
        />
        <BackToTopButton isVisible={showBackToTop} />
        <Footer />
      </div>
    </>
  );
};

export default App;

