import { auth } from "@/lib/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./app-sidebar";
import { Breadcrumb } from "./breadcrumb";
import { GlobalSearch } from "./global-search";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar userEmail={session?.user?.email ?? ""} />
      <SidebarInset>
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-8">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <Breadcrumb />
          </div>
          <div className="shrink-0">
            <GlobalSearch />
          </div>
        </div>
        <div className="flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
