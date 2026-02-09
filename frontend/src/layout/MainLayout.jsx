import { useDevice } from '../context/DeviceContext';
import Navbar from '../components/Navbar';
import MobileDock from '../components/MobileDock';

const MainLayout = ({ children }) => {
  const { isMobile } = useDevice();

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--bg-main)]">
      <Navbar />
      <main
        className="overflow-y-auto"
        style={{
          height: isMobile ? '100vh' : 'calc(100vh - 70px)',
        }}
      >
        {children}
      </main>
      <MobileDock />
    </div>
  );
};

export default MainLayout;
