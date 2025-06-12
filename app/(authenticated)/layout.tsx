import { SidebarProvider } from "../context/SidebarContext";
import Sidebar from "@/components/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 