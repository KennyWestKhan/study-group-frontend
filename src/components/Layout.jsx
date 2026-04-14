import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="bg-surface text-on-background min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen w-full relative">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 w-full max-w-8xl mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
