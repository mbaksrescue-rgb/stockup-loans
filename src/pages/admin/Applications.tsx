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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Application {
  id: string;
  business_name: string;
  owner_name: string;
  loan_amount: number;
  status: string;
  created_at: string;
  registration_number: string;
  years_in_operation: number;
  physical_address: string;
  distributor_name: string;
  distributor_paybill: string;
  distributor_contact: string;
  loan_purpose: string;
  owner_phone: string;
  rejection_reason: string | null;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch applications');
    } else {
      setApplications(data || []);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('loan_applications')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve application');
    } else {
      toast.success('Application approved successfully');
      fetchApplications();
      setSelectedApp(null);
    }
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('loan_applications')
      .update({ status: 'rejected', rejection_reason: rejectionReason })
      .eq('id', id);

    if (error) {
      toast.error('Failed to reject application');
    } else {
      toast.success('Application rejected');
      fetchApplications();
      setSelectedApp(null);
      setRejectionReason('');
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      disbursed: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Loan Applications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.business_name}</TableCell>
                  <TableCell>{app.owner_name}</TableCell>
                  <TableCell>KSh {app.loan_amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{format(new Date(app.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review and manage this loan application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Business Name</Label>
                  <p>{selectedApp.business_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Registration Number</Label>
                  <p>{selectedApp.registration_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Years in Operation</Label>
                  <p>{selectedApp.years_in_operation} years</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Physical Address</Label>
                  <p>{selectedApp.physical_address}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Owner Name</Label>
                  <p>{selectedApp.owner_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Owner Phone</Label>
                  <p>{selectedApp.owner_phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Distributor Name</Label>
                  <p>{selectedApp.distributor_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Distributor Paybill</Label>
                  <p>{selectedApp.distributor_paybill}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Distributor Contact</Label>
                  <p>{selectedApp.distributor_contact}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Loan Amount</Label>
                  <p className="text-lg font-bold">KSh {selectedApp.loan_amount.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Loan Purpose</Label>
                  <p>{selectedApp.loan_purpose}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Status</Label>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {selectedApp.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <Label className="text-sm font-semibold">Rejection Reason</Label>
                  <p className="text-sm mt-1">{selectedApp.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
