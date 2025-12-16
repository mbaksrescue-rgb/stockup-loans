import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DollarSign, 
  Plus, 
  Send, 
  Loader2, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Building,
  Phone,
  AlertCircle,
  CreditCard
} from 'lucide-react';

interface Application {
  id: string;
  business_name: string;
  owner_name: string;
  loan_amount: number;
  distributor_name: string;
  distributor_paybill: string;
}

interface Disbursement {
  id: string;
  amount: number;
  distributor_paybill: string;
  transaction_ref: string | null;
  status: string;
  disbursed_at: string | null;
  repayment_due_date: string | null;
  repayment_status: string;
  repayment_amount: number | null;
  created_at: string;
  application_id: string;
  loan_applications: Application;
}

const Disbursements = () => {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [approvedApps, setApprovedApps] = useState<Application[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initiate' | 'processing' | 'complete' | 'failed'>('initiate');

  useEffect(() => {
    fetchDisbursements();
    fetchApprovedApplications();
  }, []);

  const fetchDisbursements = async () => {
    const { data, error } = await supabase
      .from('disbursements')
      .select(`
        *,
        loan_applications (
          id,
          business_name,
          owner_name,
          loan_amount,
          distributor_name,
          distributor_paybill
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch disbursements');
    } else {
      setDisbursements(data || []);
    }
  };

  const fetchApprovedApplications = async () => {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('id, business_name, owner_name, loan_amount, distributor_name, distributor_paybill')
      .eq('status', 'approved');

    if (error) {
      toast.error('Failed to fetch applications');
    } else {
      setApprovedApps(data || []);
    }
  };

  const handleCreateDisbursement = async () => {
    if (!selectedAppId) {
      toast.error('Please select an application');
      return;
    }

    setLoading(true);
    const selectedApp = approvedApps.find(app => app.id === selectedAppId);
    
    if (!selectedApp) return;

    const repaymentDueDate = new Date();
    repaymentDueDate.setDate(repaymentDueDate.getDate() + 7);

    const { error: disbursementError } = await supabase
      .from('disbursements')
      .insert({
        application_id: selectedAppId,
        amount: selectedApp.loan_amount,
        distributor_paybill: selectedApp.distributor_paybill,
        status: 'pending', // Start as pending until payment is processed
        repayment_due_date: repaymentDueDate.toISOString(),
        repayment_amount: selectedApp.loan_amount * 1.1, // 10% interest
      });

    if (disbursementError) {
      toast.error('Failed to create disbursement');
    } else {
      toast.success('Disbursement created - ready for payment processing');
      setShowCreateDialog(false);
      setSelectedAppId('');
      setTransactionRef('');
      fetchDisbursements();
      fetchApprovedApplications();
    }
    setLoading(false);
  };

  const handleInitiatePayment = (disbursement: Disbursement) => {
    setSelectedDisbursement(disbursement);
    setTransactionRef('');
    setPaymentStep('initiate');
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    if (!selectedDisbursement) return;

    setProcessingPayment(true);
    setPaymentStep('processing');

    try {
      // This is where Daraja API will be integrated
      // For now, simulate the payment process
      
      // Generate a mock transaction reference (will be replaced by actual Daraja response)
      const mockTransactionRef = transactionRef || `MPESA${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      // Simulate API delay (remove this when integrating real Daraja API)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Update disbursement with payment details
      const { error } = await supabase
        .from('disbursements')
        .update({
          status: 'completed',
          transaction_ref: mockTransactionRef,
          disbursed_at: new Date().toISOString(),
        })
        .eq('id', selectedDisbursement.id);

      if (error) throw error;

      // Update application status
      await supabase
        .from('loan_applications')
        .update({ status: 'disbursed' })
        .eq('id', selectedDisbursement.application_id);

      setPaymentStep('complete');
      setTransactionRef(mockTransactionRef);
      toast.success('Payment processed successfully!');
      
      // Refresh data after delay
      setTimeout(() => {
        fetchDisbursements();
        fetchApprovedApplications();
        setShowPaymentDialog(false);
        setSelectedDisbursement(null);
      }, 2000);

    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStep('failed');
      toast.error('Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const retryPayment = () => {
    setPaymentStep('initiate');
    setTransactionRef('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
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

  const getRepaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const totalDisbursed = disbursements
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingAmount = disbursements
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Disbursements</h1>
          <p className="text-muted-foreground mt-1">Manage loan disbursements and M-Pesa payments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Disbursement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Disbursed</p>
                <p className="text-2xl font-bold text-green-600">KSh {totalDisbursed.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">KSh {pendingAmount.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{disbursements.filter(d => d.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Applications</p>
                <p className="text-2xl font-bold text-blue-600">{approvedApps.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Disbursements</CardTitle>
          <CardDescription>Process payments to distributors via M-Pesa Daraja API</CardDescription>
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
                <TableHead>Repayment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disbursements.map((disbursement) => (
                <TableRow key={disbursement.id}>
                  <TableCell className="font-medium">
                    {disbursement.loan_applications?.business_name || 'N/A'}
                  </TableCell>
                  <TableCell>{disbursement.loan_applications?.distributor_name || 'N/A'}</TableCell>
                  <TableCell>KSh {disbursement.amount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{disbursement.distributor_paybill}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {disbursement.transaction_ref || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(disbursement.status)}</TableCell>
                  <TableCell>
                    {getRepaymentBadge(disbursement.repayment_status)}
                    {disbursement.repayment_amount && (
                      <div className="text-xs text-muted-foreground mt-1">
                        KSh {disbursement.repayment_amount.toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {disbursement.repayment_due_date
                      ? format(new Date(disbursement.repayment_due_date), 'MMM dd, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {disbursement.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleInitiatePayment(disbursement)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Process
                      </Button>
                    )}
                    {disbursement.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInitiatePayment(disbursement)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    {disbursement.status === 'completed' && (
                      <span className="text-sm text-green-600">Paid</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {disbursements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No disbursements found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Disbursement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Disbursement</DialogTitle>
            <DialogDescription>
              Select an approved application to create a disbursement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Application</Label>
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an application" />
                </SelectTrigger>
                <SelectContent>
                  {approvedApps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.business_name} - KSh {app.loan_amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAppId && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  {(() => {
                    const app = approvedApps.find(a => a.id === selectedAppId);
                    if (!app) return null;
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Business:</span>
                          <span className="font-medium">{app.business_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner:</span>
                          <span>{app.owner_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-bold text-primary">KSh {app.loan_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Distributor:</span>
                          <span>{app.distributor_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paybill:</span>
                          <span className="font-mono">{app.distributor_paybill}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <Button onClick={handleCreateDisbursement} disabled={loading || !selectedAppId} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Disbursement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Processing Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentStep === 'initiate' && 'Process M-Pesa Payment'}
              {paymentStep === 'processing' && 'Processing Payment...'}
              {paymentStep === 'complete' && 'Payment Successful'}
              {paymentStep === 'failed' && 'Payment Failed'}
            </DialogTitle>
          </DialogHeader>

          {selectedDisbursement && (
            <div className="space-y-6">
              {/* Initiate State */}
              {paymentStep === 'initiate' && (
                <>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Distributor</p>
                          <p className="font-medium">
                            {selectedDisbursement.loan_applications?.distributor_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Paybill Number</p>
                          <p className="font-mono font-medium">{selectedDisbursement.distributor_paybill}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-xl font-bold text-primary">
                            KSh {selectedDisbursement.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label>Transaction Reference (Optional)</Label>
                    <Input
                      placeholder="Enter manual reference or leave blank"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to auto-generate via Daraja API
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-600">Daraja API Integration</p>
                        <p className="text-muted-foreground">
                          This will trigger M-Pesa B2B payment to the distributor's paybill.
                          Ensure Daraja credentials are configured.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Processing State */}
              {paymentStep === 'processing' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Processing M-Pesa Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Sending KSh {selectedDisbursement.amount.toLocaleString()} to paybill {selectedDisbursement.distributor_paybill}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Waiting for confirmation...
                  </div>
                </div>
              )}

              {/* Success State */}
              {paymentStep === 'complete' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Payment Successful!</p>
                    <p className="text-sm text-muted-foreground">
                      KSh {selectedDisbursement.amount.toLocaleString()} sent successfully
                    </p>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Transaction Reference</p>
                      <p className="font-mono font-bold text-primary">{transactionRef}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Failed State */}
              {paymentStep === 'failed' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Payment Failed</p>
                    <p className="text-sm text-muted-foreground">
                      Unable to process the payment. Please check Daraja API configuration and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {paymentStep === 'initiate' && (
              <>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={processPayment} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send Payment
                </Button>
              </>
            )}
            {paymentStep === 'failed' && (
              <>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Close
                </Button>
                <Button onClick={retryPayment}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </>
            )}
            {paymentStep === 'complete' && (
              <Button onClick={() => setShowPaymentDialog(false)}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Disbursements;
