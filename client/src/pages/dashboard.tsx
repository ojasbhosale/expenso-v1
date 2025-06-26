import { useState } from "react";
import { useParams } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { ExpensesSection } from "@/components/dashboard/expenses-section";
import { CategoriesSection } from "@/components/dashboard/categories-section";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardPage() {
  const { section = "overview" } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case "expenses":
        return <ExpensesSection />;
      case "categories":
        return <CategoriesSection />;
      case "profile":
        return <ProfileSection />;
      default:
        return <OverviewSection />;
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case "expenses":
        return { title: "Expenses", subtitle: "View and manage all your expenses" };
      case "categories":
        return { title: "Categories", subtitle: "Organize your expenses by category" };
      case "profile":
        return { title: "Profile", subtitle: "Manage your account settings" };
      default:
        return { title: "Overview", subtitle: "Track your spending and manage your budget" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="bg-white shadow-md"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeSection={section}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <DashboardHeader {...getSectionTitle()} />
        <main className="p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
