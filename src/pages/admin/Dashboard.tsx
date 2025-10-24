import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    activeDisbursements: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [applications, disbursements, customers] = await Promise.all([
      supabase.from('loan_applications').select('*', { count: 'exact', head: true }),
      supabase.from('disbursements').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
    ]);

    const pending = await supabase
      .from('loan_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    setStats({
      totalApplications: applications.count || 0,
      pendingApplications: pending.count || 0,
      activeDisbursements: disbursements.count || 0,
      totalCustomers: customers.count || 0,
    });
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Active Disbursements',
      value: stats.activeDisbursements,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
