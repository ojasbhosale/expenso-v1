import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, Calendar, Tags, BarChart } from "lucide-react";

export function OverviewSection() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const recentExpenses = expenses?.slice(0, 3) || [];
  const topCategories = categories?.slice(0, 4) || [];

  if (statsLoading || expensesLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Expenses"
          value={`$${stats?.totalExpenses?.toFixed(2) || '0.00'}`}
          subtitle="This month"
          icon={ArrowDown}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <StatsCard
          title="This Week"
          value={`$${stats?.weeklyExpenses?.toFixed(2) || '0.00'}`}
          subtitle="Last 7 days"
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Categories"
          value={stats?.categoriesCount?.toString() || '0'}
          subtitle="Active categories"
          icon={Tags}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Avg. Daily"
          value={`$${stats?.dailyAverage?.toFixed(2) || '0.00'}`}
          subtitle="Last 30 days"
          icon={BarChart}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Recent Expenses & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses yet</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 text-sm">💰</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{expense.title}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category?.name || 'Uncategorized'} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600">-${expense.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No categories yet</p>
            ) : (
              <div className="space-y-4">
                {topCategories.map((category: any) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${category.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{category.expenseCount} expenses</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
