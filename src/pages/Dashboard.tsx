import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Wallet, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface LoanApplication {
  id: string;
  business_name: string;
  loan_amount: number;
  status: string;
  created_at: string;
  owner_phone: string;
}

interface Disbursement {
  id: string;
  amount: number;
  repayment_amount: number | null;
  repayment_due_date: string | null;
  repayment_status: string;
  status: string;
  application_id: string;
}

interface Repayment {
  loan_id: string;
  id: string;
  amount: number;
  phone: string;
  mpesa_receipt: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's loan applications
      const { data: loansData, error: loansError } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;
      setLoans(loansData || []);

      // Fetch disbursements for user's loans
      if (loansData && loansData.length > 0) {
        const loanIds = loansData.map(l => l.id);
        
        const { data: disbData, error: disbError } = await supabase
          .from('disbursements')
          .select('*')
          .in('application_id', loanIds);

        if (disbError) throw disbError;
        setDisbursements(disbData || []);
      }

      // Fetch repayments
      const { data: repData, error: repError } = await supabase
        .from('repayments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (repError) throw repError;
      setRepayments(repData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription for repayments
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('repayments-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'repayments',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getActiveLoan = () => {
    return loans.find(l => l.status === 'disbursed' || l.status === 'approved');
  };

  const getLoanDisbursement = (loanId: string) => {
    return disbursements.find(d => d.id === loanId || loans.some(l => l.id === loanId));
  };

  const calculateOutstandingBalance = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return 0;

    const disbursement = disbursements.find(d => d.application_id === loanId);
    
    const totalRepaymentDue = disbursement?.repayment_amount || (loan.loan_amount * 1.1);
    const paidRepayments = repayments
      .filter(r => r.loan_id === loanId && r.status === 'paid')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return Math.max(0, totalRepaymentDue - paidRepayments);
  };

  const getTotalRepaid = () => {
    return repayments
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + Number(r.amount), 0);
  };

  const handlePayNow = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setPaymentPhone(loan.owner_phone || '');
    const outstanding = calculateOutstandingBalance(loan.id);
    setPaymentAmount(outstanding.toString());
    setShowPayDialog(true);
  };

  const processPayment = async () => {
    if (!selectedLoan || !user || !paymentPhone || !paymentAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    setProcessingPayment(true);

    try {
      // Call the initiate-repayment edge function
      const { data, error } = await supabase.functions.invoke('initiate-repayment', {
        body: {
          user_id: user.id,
          loan_id: selectedLoan.id,
          amount: parseFloat(paymentAmount),
          phone: paymentPhone,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('STK Push sent! Check your phone and enter your M-PESA PIN');
        setShowPayDialog(false);
        setSelectedLoan(null);
        setPaymentPhone('');
        setPaymentAmount('');
        fetchData();
      } else {
        toast.error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'disbursed':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
            <Wallet className="w-3 h-3 mr-1" />
            Disbursed
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeLoan = getActiveLoan();
  const outstandingBalance = activeLoan ? calculateOutstandingBalance(activeLoan.id) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your loans and repayments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  <p className="text-2xl font-bold">{loans.length}</p>
                </div>
                <Building className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-accent">
                    KSh {outstandingBalance.toLocaleString()}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Repaid</p>
                  <p className="text-2xl font-bold text-success">
                    KSh {getTotalRepaid().toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payments Made</p>
                  <p className="text-2xl font-bold">{repayments.filter(r => r.status === 'paid').length}</p>
                </div>
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Loan Card */}
        {activeLoan && (
          <Card className="mb-8 border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-accent" />
                Active Loan
              </CardTitle>
              <CardDescription>Your current loan details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="text-lg font-semibold">{activeLoan.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-semibold">KSh {activeLoan.loan_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(activeLoan.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-lg font-bold text-accent">
                    KSh {outstandingBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => handlePayNow(activeLoan)}
                  disabled={activeLoan.status !== 'disbursed' || outstandingBalance <= 0}
                  className="bg-success hover:bg-success/90"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {outstandingBalance <= 0 ? 'Fully Paid' : 'Pay Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loan Applications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Loan Applications</CardTitle>
            <CardDescription>History of all your loan applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No loan applications found. <a href="/apply" className="text-accent hover:underline">Apply now</a>
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.business_name}</TableCell>
                      <TableCell>KSh {loan.loan_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>{format(new Date(loan.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {loan.status === 'disbursed' && calculateOutstandingBalance(loan.id) > 0 && (
                          <Button size="sm" onClick={() => handlePayNow(loan)} className="bg-success hover:bg-success/90">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Repayment History */}
        <Card>
          <CardHeader>
            <CardTitle>Repayment History</CardTitle>
            <CardDescription>Your M-PESA repayment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>M-PESA Receipt</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No repayments made yet
                    </TableCell>
                  </TableRow>
                ) : (
                  repayments.map((repayment) => (
                    <TableRow key={repayment.id}>
                      <TableCell>
                        {format(new Date(repayment.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        KSh {Number(repayment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{repayment.phone}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {repayment.mpesa_receipt || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(repayment.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-success" />
              Make a Repayment
            </DialogTitle>
            <DialogDescription>
              Enter your payment details. You will receive an M-PESA STK push on your phone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Business</Label>
              <Input value={selectedLoan?.business_name || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label>Phone Number (M-PESA)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount (KSh)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <p className="text-xs text-muted-foreground">
                Outstanding: KSh {outstandingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processPayment} 
              disabled={processingPayment || !paymentPhone || !paymentAmount}
              className="bg-success hover:bg-success/90"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay via M-PESA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
