import { useLocation } from 'react-router-dom';
import { useDevice } from '../context/DeviceContext';
import Navbar from '../components/Navbar';
import MobileDock from '../components/MobileDock';

const MainLayout = ({ children }) => {
  const { isMobile } = useDevice();
  const location = useLocation();
  const isAIImport = location.pathname === '/ai-import';

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--bg-main)] relative">
      <div 
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-500 ease-in-out ${
          isAIImport ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <Navbar />
      </div>

      <main
        className="w-full h-full overflow-y-auto transition-all duration-500"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          paddingTop: isAIImport ? '0px' : (isMobile ? '0px' : '60px'),
          paddingBottom: isAIImport ? '0px' : (isMobile ? '70px' : '0px'),
        }}
      >
        {children}
      </main>

      <div 
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-in-out ${
          isAIImport ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <MobileDock />
      </div>
    </div>
  );
};

export default MainLayout;
