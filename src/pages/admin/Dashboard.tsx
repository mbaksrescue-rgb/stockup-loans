import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, Users, TrendingUp, Plus, CheckCircle, Building2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    activeDisbursements: 0,
    totalCustomers: 0,
    totalLent: 0,
    totalRepaid: 0,
    outstandingBalance: 0,
    upcomingPayments: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [applications, disbursements, customers, allDisbursements] = await Promise.all([
        supabase.from('loan_applications').select('*', { count: 'exact', head: true }),
        supabase.from('disbursements').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('disbursements').select('amount, repayment_amount, repayment_status, repayment_due_date'),
      ]);

      const pending = await supabase
        .from('loan_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate financial stats
      const totalLent = allDisbursements.data?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;
      const totalRepaid = allDisbursements.data
        ?.filter(d => d.repayment_status === 'completed')
        .reduce((sum, d) => sum + Number(d.repayment_amount || 0), 0) || 0;
      const outstandingBalance = totalLent - totalRepaid;

      // Calculate upcoming payments (due in next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingPayments = allDisbursements.data?.filter(d => {
        if (d.repayment_status === 'completed' || !d.repayment_due_date) return false;
        const dueDate = new Date(d.repayment_due_date);
        return dueDate >= today && dueDate <= nextWeek;
      }).length || 0;

      setStats({
        totalApplications: applications.count || 0,
        pendingApplications: pending.count || 0,
        activeDisbursements: disbursements.count || 0,
        totalCustomers: customers.count || 0,
        totalLent,
        totalRepaid,
        outstandingBalance,
        upcomingPayments,
      });

      // Fetch recent transactions
      const { data: recent } = await supabase
        .from('disbursements')
        .select(`
          *,
          loan_applications!inner(business_name, owner_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentTransactions(recent || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Active Disbursements',
      value: stats.activeDisbursements,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const financialCards = [
    {
      title: 'Total Amount Lent',
      value: `KES ${stats.totalLent.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Repaid',
      value: `KES ${stats.totalRepaid.toLocaleString()}`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Outstanding Balance',
      value: `KES ${stats.outstandingBalance.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Upcoming Payments (7 days)',
      value: stats.upcomingPayments,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const quickActions = [
    {
      title: 'Review Applications',
      description: 'View and approve pending loan applications',
      icon: FileText,
      action: () => navigate('/admin/applications'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Process Disbursement',
      description: 'Send payments to distributors',
      icon: DollarSign,
      action: () => navigate('/admin/disbursements'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Add Customer',
      description: 'Onboard a new liquor store',
      icon: Building2,
      action: () => navigate('/admin/customers'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Application Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Application Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Financial Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg text-white ${action.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Button variant="outline" onClick={() => navigate('/admin/disbursements')}>
            View All
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.status === 'completed' ? 'bg-green-50' : 
                        transaction.status === 'pending' ? 'bg-orange-50' : 'bg-gray-50'
                      }`}>
                        <DollarSign className={`h-5 w-5 ${
                          transaction.status === 'completed' ? 'text-green-600' : 
                          transaction.status === 'pending' ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.loan_applications?.business_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.loan_applications?.owner_name} • {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KES {Number(transaction.amount).toLocaleString()}</p>
                      <p className={`text-sm capitalize ${
                        transaction.status === 'completed' ? 'text-green-600' : 
                        transaction.status === 'pending' ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {transaction.status}
                      </p>
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
};

export default Dashboard;
