import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, TrendingUp, DollarSign, Users, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Analytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [stats, setStats] = useState({
    totalLent: 0,
    totalRepaid: 0,
    outstanding: 0,
    defaultRate: 0,
    repaymentRate: 0,
    avgLoanAmount: 0,
    totalRevenue: 0,
  });
  const [loanTrends, setLoanTrends] = useState<any[]>([]);
  const [distributorStats, setDistributorStats] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch all relevant data
      const [applicationsRes, disbursementsRes] = await Promise.all([
        supabase
          .from('loan_applications')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('disbursements')
          .select('*')
          .gte('created_at', startDate.toISOString()),
      ]);

      if (applicationsRes.error || disbursementsRes.error) {
        throw new Error('Failed to fetch analytics data');
      }

      const applications = applicationsRes.data || [];
      const disbursements = disbursementsRes.data || [];

      // Calculate key stats
      const totalLent = disbursements.reduce((sum, d) => sum + Number(d.amount || 0), 0);
      const totalRepaid = disbursements
        .filter(d => d.repayment_status === 'completed')
        .reduce((sum, d) => sum + Number(d.repayment_amount || 0), 0);
      const outstanding = totalLent - totalRepaid;
      const avgLoanAmount = applications.length > 0 
        ? applications.reduce((sum, a) => sum + Number(a.loan_amount || 0), 0) / applications.length 
        : 0;

      const completedLoans = disbursements.filter(d => d.repayment_status === 'completed').length;
      const defaultedLoans = disbursements.filter(d => d.repayment_status === 'defaulted').length;
      const totalLoans = disbursements.length;

      const repaymentRate = totalLoans > 0 ? (completedLoans / totalLoans) * 100 : 0;
      const defaultRate = totalLoans > 0 ? (defaultedLoans / totalLoans) * 100 : 0;

      // Assume 10% interest for revenue calculation
      const totalRevenue = totalRepaid * 0.1;

      setStats({
        totalLent,
        totalRepaid,
        outstanding,
        defaultRate,
        repaymentRate,
        avgLoanAmount,
        totalRevenue,
      });

      // Prepare loan trends data (by month)
      const trendMap = new Map<string, { month: string; loans: number; amount: number }>();
      applications.forEach(app => {
        const date = new Date(app.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = trendMap.get(monthKey) || { month: monthKey, loans: 0, amount: 0 };
        existing.loans += 1;
        existing.amount += Number(app.loan_amount || 0);
        trendMap.set(monthKey, existing);
      });

      const trends = Array.from(trendMap.values())
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);
      setLoanTrends(trends);

      // Prepare distributor stats
      const distMap = new Map<string, { name: string; count: number; amount: number }>();
      applications.forEach(app => {
        const name = app.distributor_name;
        const existing = distMap.get(name) || { name, count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += Number(app.loan_amount || 0);
        distMap.set(name, existing);
      });

      const distStats = Array.from(distMap.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      setDistributorStats(distStats);

      // Status distribution
      const statusMap = new Map<string, number>();
      applications.forEach(app => {
        const status = app.status || 'unknown';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const statusDist = Array.from(statusMap.entries()).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setStatusDistribution(statusDist);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    toast({
      title: 'Exporting',
      description: `Generating ${format.toUpperCase()} report...`,
    });
    // In a real implementation, this would generate and download the report
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Performance insights and financial tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Funds Lent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalLent.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="inline h-3 w-3" /> Principal disbursed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalRepaid.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="inline h-3 w-3" /> {stats.repaymentRate.toFixed(1)}% repayment rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.outstanding.toLocaleString()}</div>
            <p className="text-xs text-orange-600 mt-1">
              {stats.defaultRate.toFixed(1)}% default rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (Est.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Interest & fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Loan Trends</TabsTrigger>
          <TabsTrigger value="distributors">Distributors</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Loan Activity Trends</CardTitle>
              <CardDescription>Monthly loan applications and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={loanTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="loans" stroke="#8884d8" name="Number of Loans" />
                  <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#82ca9d" name="Total Amount (KES)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributors">
          <Card>
            <CardHeader>
              <CardTitle>Top Distributors by Loan Volume</CardTitle>
              <CardDescription>Top 5 distributors by total loan amount</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={distributorStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Loans" />
                  <Bar dataKey="amount" fill="#82ca9d" name="Total Amount (KES)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>Breakdown of loan application statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Loan Amount</span>
              <span className="font-semibold">KES {stats.avgLoanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Repayment Rate</span>
              <span className="font-semibold text-green-600">{stats.repaymentRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Default Rate</span>
              <span className="font-semibold text-red-600">{stats.defaultRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Revenue</span>
              <span className="font-semibold">KES {stats.totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Outflow</span>
              <span className="font-semibold text-red-600">-KES {stats.totalLent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Inflow</span>
              <span className="font-semibold text-green-600">+KES {stats.totalRepaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Net Position</span>
              <span className={`font-semibold ${stats.totalRepaid - stats.totalLent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalRepaid - stats.totalLent >= 0 ? '+' : ''}KES {(stats.totalRepaid - stats.totalLent).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm font-medium">Outstanding Receivables</span>
              <span className="font-bold">KES {stats.outstanding.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
