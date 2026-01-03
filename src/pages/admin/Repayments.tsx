import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Search, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Receipt,
  RefreshCw
} from 'lucide-react';

interface Repayment {
  id: string;
  user_id: string;
  loan_id: string;
  amount: number;
  phone: string;
  mpesa_receipt: string | null;
  checkout_request_id: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  loan_applications: {
    business_name: string;
    owner_name: string;
    loan_amount: number;
  } | null;
}

const AdminRepayments = () => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [filteredRepayments, setFilteredRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRepayments();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterRepayments();
  }, [searchQuery, statusFilter, repayments]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-repayments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'repayments',
        },
        () => {
          fetchRepayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchRepayments = async () => {
    try {
      const { data, error } = await supabase
        .from('repayments')
        .select(`
          *,
          loan_applications (
            business_name,
            owner_name,
            loan_amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepayments(data || []);
    } catch (error) {
      console.error('Error fetching repayments:', error);
      toast.error('Failed to load repayments');
    } finally {
      setLoading(false);
    }
  };

  const filterRepayments = () => {
    let filtered = [...repayments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.loan_applications?.business_name?.toLowerCase().includes(query) ||
          r.loan_applications?.owner_name?.toLowerCase().includes(query) ||
          r.phone?.includes(query) ||
          r.mpesa_receipt?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    setFilteredRepayments(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalReceived = repayments
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const pendingAmount = repayments
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repayments</h1>
          <p className="text-muted-foreground mt-1">Track and manage M-PESA loan repayments</p>
        </div>
        <Button variant="outline" onClick={fetchRepayments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold text-green-600">
                  KSh {totalReceived.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">
                  KSh {pendingAmount.toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful Payments</p>
                <p className="text-2xl font-bold">
                  {repayments.filter((r) => r.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{repayments.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by business, owner, phone, or receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repayments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Repayments</CardTitle>
          <CardDescription>Real-time M-PESA repayment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>M-PESA Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No repayments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepayments.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell className="font-medium">
                      {repayment.loan_applications?.business_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {repayment.loan_applications?.owner_name || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      KSh {Number(repayment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{repayment.phone}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {repayment.mpesa_receipt || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(repayment.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {repayment.paid_at
                        ? format(new Date(repayment.paid_at), 'MMM dd, yyyy HH:mm')
                        : format(new Date(repayment.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRepayments;
