import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { Home } from './pages/Home';
import { ExamTemplatePage } from './pages/ExamTemplatePage';
import { PresetsDirectory } from './pages/PresetsDirectory';
import { BatchMode } from './pages/BatchMode';
import { CustomResizer } from './pages/CustomResizer';
import { FAQ } from './pages/FAQ';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { Disclaimer } from './pages/Disclaimer';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

// Hooks
import { usePresets } from './hooks/usePresets';

export function App() {
  const {
    presets,
    selectedPreset,
    selectedPresetId,
    setSelectedPresetId,
    addCustomPreset,
  } = usePresets();

  // Helper to parse initial route from URL path
  const getInitialRoute = (): string => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!path || path === '') return 'home';
    return path;
  };

  const [currentPage, setCurrentPage] = useState<string>(getInitialRoute);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      setCurrentPage(path || 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetPath = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Supported dedicated exam landing slugs
  const examSlugs = [
    'ssc-photo-resizer',
    'ssc-signature-resize',
    'upsc-photo-resize',
    'upsc-signature-resize',
    'nta-neet-photo-compress',
    'ibps-photo-signature',
  ];

  const handleIncrementProcessed = () => {
    // No-op or analytics hook
  };

  const renderPage = () => {
    if (examSlugs.includes(currentPage)) {
      return (
        <ExamTemplatePage
          slug={currentPage}
          onNavigate={navigateTo}
          onIncrementProcessed={handleIncrementProcessed}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <Home
            selectedPreset={selectedPreset}
            onSelectPreset={(id) => setSelectedPresetId(id)}
            presets={presets}
            onNavigate={navigateTo}
            onIncrementProcessed={handleIncrementProcessed}
          />
        );
      case 'presets':
        return (
          <PresetsDirectory
            presets={presets}
            onSelectPreset={(id) => setSelectedPresetId(id)}
            onNavigate={navigateTo}
          />
        );
      case 'batch':
        return (
          <BatchMode
            onIncrementProcessed={handleIncrementProcessed}
          />
        );
      case 'custom':
        return (
          <CustomResizer
            onIncrementProcessed={handleIncrementProcessed}
            onAddCustomPreset={addCustomPreset}
          />
        );
      case 'faq':
        return <FAQ />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-and-conditions':
        return <TermsConditions />;
      case 'disclaimer':
        return <Disclaimer />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <NotFound onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Top Navigation with minimal clean PWA install */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      {/* Main Content Stage */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default App;
