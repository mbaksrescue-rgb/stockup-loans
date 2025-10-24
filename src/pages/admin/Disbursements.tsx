import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { DollarSign, Plus } from 'lucide-react';

interface Application {
  id: string;
  business_name: string;
  loan_amount: number;
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
  const [selectedAppId, setSelectedAppId] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);

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
          loan_amount,
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
      .select('id, business_name, loan_amount, distributor_paybill')
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
        transaction_ref: transactionRef || null,
        status: 'completed',
        disbursed_at: new Date().toISOString(),
        repayment_due_date: repaymentDueDate.toISOString(),
      });

    if (disbursementError) {
      toast.error('Failed to create disbursement');
    } else {
      const { error: updateError } = await supabase
        .from('loan_applications')
        .update({ status: 'disbursed' })
        .eq('id', selectedAppId);

      if (updateError) {
        toast.error('Failed to update application status');
      } else {
        toast.success('Disbursement created successfully');
        setShowCreateDialog(false);
        setSelectedAppId('');
        setTransactionRef('');
        fetchDisbursements();
        fetchApprovedApplications();
      }
    }
    setLoading(false);
  };

  const handleUpdateRepayment = async (id: string, amount: number, status: string) => {
    const { error } = await supabase
      .from('disbursements')
      .update({ repayment_amount: amount, repayment_status: status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update repayment');
    } else {
      toast.success('Repayment updated');
      fetchDisbursements();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      processing: 'secondary',
      completed: 'default',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getRepaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      partial: 'secondary',
      completed: 'default',
      overdue: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Disbursements</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Disbursement
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Disbursements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paybill</TableHead>
                <TableHead>Transaction Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Repayment</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disbursements.map((disbursement) => (
                <TableRow key={disbursement.id}>
                  <TableCell className="font-medium">
                    {disbursement.loan_applications.business_name}
                  </TableCell>
                  <TableCell>KSh {disbursement.amount.toLocaleString()}</TableCell>
                  <TableCell>{disbursement.distributor_paybill}</TableCell>
                  <TableCell>{disbursement.transaction_ref || 'N/A'}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Disbursement</DialogTitle>
            <DialogDescription>
              Select an approved application to disburse funds
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

            <div className="space-y-2">
              <Label>Transaction Reference (Optional)</Label>
              <Input
                placeholder="Enter M-PESA transaction reference"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>

            <Button onClick={handleCreateDisbursement} disabled={loading} className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Create Disbursement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Disbursements;
