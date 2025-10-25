import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, DollarSign, CheckCircle, XCircle, Clock, Receipt, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  status: string;
  disbursed_at: string;
  transaction_ref: string;
  distributor_paybill: string;
  repayment_status: string;
  loan_applications: {
    business_name: string;
    distributor_name: string;
  };
}

const Payments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sendPaymentDialog, setSendPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    transactionRef: '',
    amount: '',
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, statusFilter, payments]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('disbursements')
        .select(`
          *,
          loan_applications!inner(business_name, distributor_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.loan_applications?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.loan_applications?.distributor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleSendPayment = async () => {
    if (!selectedPayment) return;

    try {
      const { error } = await supabase
        .from('disbursements')
        .update({
          status: 'completed',
          transaction_ref: paymentForm.transactionRef,
          disbursed_at: new Date().toISOString(),
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment sent successfully',
      });

      setSendPaymentDialog(false);
      setSelectedPayment(null);
      setPaymentForm({ transactionRef: '', amount: '' });
      fetchPayments();
    } catch (error) {
      console.error('Error sending payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to send payment',
        variant: 'destructive',
      });
    }
  };

  const handleRecordManualPayment = async (paymentId: string, transactionRef: string) => {
    try {
      const { error } = await supabase
        .from('disbursements')
        .update({
          status: 'completed',
          transaction_ref: transactionRef,
          disbursed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      fetchPayments();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      completed: { variant: 'default', icon: CheckCircle },
      pending: { variant: 'secondary', icon: Clock },
      failed: { variant: 'destructive', icon: XCircle },
    };

    const { variant, icon: Icon } = variants[status] || variants.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payment Processing</h1>
        <p className="text-muted-foreground">Manage payments to distributors and track repayments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter((p) => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {payments.filter((p) => p.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payments.filter((p) => p.status === 'failed').length}
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
                placeholder="Search by business, distributor, or transaction ref..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paybill</TableHead>
                <TableHead>Transaction Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.loan_applications?.business_name}</TableCell>
                    <TableCell>{payment.loan_applications?.distributor_name}</TableCell>
                    <TableCell className="font-semibold">KES {Number(payment.amount).toLocaleString()}</TableCell>
                    <TableCell>{payment.distributor_paybill}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.transaction_ref || '-'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.disbursed_at
                        ? formatDistanceToNow(new Date(payment.disbursed_at), { addSuffix: true })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setPaymentForm({ ...paymentForm, amount: payment.amount.toString() });
                              setSendPaymentDialog(true);
                            }}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Send Payment Dialog */}
      <Dialog open={sendPaymentDialog} onOpenChange={setSendPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment to Distributor</DialogTitle>
            <DialogDescription>
              Send payment to {selectedPayment?.loan_applications?.distributor_name} for{' '}
              {selectedPayment?.loan_applications?.business_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Paybill Number</Label>
              <Input value={selectedPayment?.distributor_paybill || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference</Label>
              <Input
                value={paymentForm.transactionRef}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                placeholder="Enter transaction reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPayment} disabled={!paymentForm.transactionRef}>
              <DollarSign className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
