import { auth } from "@/lib/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar userEmail={session?.user?.email ?? ""} />
      <SidebarInset>
        <div className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
        </div>
        <main className="flex-1 px-4 pb-12 sm:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
