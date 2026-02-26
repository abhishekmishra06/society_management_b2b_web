'use client';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '@/lib/constants/colors';

export default function FinancialReportsPage() {
  const dummyData = {
    totalIncome: 145000,
    totalExpenses: 68500,
    netBalance: 76500,
    collections: {
      maintenance: 95000,
      utility: 35000,
      penalties: 5000,
      others: 10000,
    },
    expenses: {
      staff: 25000,
      maintenance: 18000,
      utilities: 12500,
      vendors: 13000,
    },
    monthlyTrend: [
      { month: 'Oct', income: 120000, expense: 55000 },
      { month: 'Nov', income: 130000, expense: 62000 },
      { month: 'Dec', income: 125000, expense: 58000 },
      { month: 'Jan', income: 135000, expense: 65000 },
      { month: 'Feb', income: 145000, expense: 68500 },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Financial Reports</h1>
        <p className="text-muted-foreground mt-1">Collection reports, expense reports, charts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: COLORS.success }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.success }}>₹{dummyData.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4" style={{ color: COLORS.error }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.error }}>₹{dummyData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: COLORS.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>₹{dummyData.netBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month surplus</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dummyData.collections).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                    <span className="capitalize text-sm">{key}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">₹{value.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{((value / dummyData.totalIncome) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dummyData.expenses).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.error }} />
                    <span className="capitalize text-sm">{key}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">₹{value.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{((value / dummyData.totalExpenses) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend (Last 5 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dummyData.monthlyTrend.map((item) => (
              <div key={item.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.month}</span>
                  <div className="flex gap-4">
                    <span style={{ color: COLORS.success }}>Income: ₹{item.income.toLocaleString()}</span>
                    <span style={{ color: COLORS.error }}>Expense: ₹{item.expense.toLocaleString()}</span>
                    <span className="font-bold">Net: ₹{(item.income - item.expense).toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${(item.income / 150000) * 100}%`,
                      backgroundColor: COLORS.primary 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground mt-1">Of expected collections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg. Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹131,000</div>
            <p className="text-xs text-muted-foreground mt-1">Last 5 months average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg. Monthly Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹61,700</div>
            <p className="text-xs text-muted-foreground mt-1">Last 5 months average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
