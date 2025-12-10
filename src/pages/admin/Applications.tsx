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
import { AlertTriangle, CheckCircle, XCircle, Shield, MessageSquare, Brain, Loader2 } from 'lucide-react';
import { sendStatusNotification } from '@/lib/sms';

interface RiskAssessment {
  id: string;
  application_id: string | null;
  risk_score: number | null;
  risk_level: string | null;
  kyc_status: string | null;
  aml_status: string | null;
  fraud_flags: unknown;
  verification_notes: string | null;
}

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
  risk_assessment?: RiskAssessment;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingRisk, setAnalyzingRisk] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    // Fetch applications
    const { data: appsData, error: appsError } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (appsError) {
      toast.error('Failed to fetch applications');
      return;
    }

    // Fetch risk assessments
    const { data: riskData, error: riskError } = await supabase
      .from('risk_assessments')
      .select('*');

    if (riskError) {
      console.error('Failed to fetch risk assessments:', riskError);
    }

    // Map risk assessments to applications
    const applicationsWithRisk = (appsData || []).map((app) => {
      const riskAssessment = riskData?.find((r) => r.application_id === app.id);
      return { ...app, risk_assessment: riskAssessment };
    });

    setApplications(applicationsWithRisk);
  };

  const handleRunRiskAnalysis = async (app: Application) => {
    setAnalyzingRisk(app.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-risk', {
        body: {
          applicationId: app.id,
          documentUrls: {
            idDocument: null,
            businessRegistration: null,
            selfie: null
          },
          businessData: {
            businessName: app.business_name,
            registrationNumber: app.registration_number,
            yearsInOperation: app.years_in_operation,
            physicalAddress: app.physical_address,
            loanAmount: app.loan_amount,
            loanPurpose: app.loan_purpose,
            distributorName: app.distributor_name
          }
        }
      });

      if (error) {
        toast.error('Failed to run risk analysis: ' + error.message);
      } else {
        toast.success('AI risk analysis completed!', {
          icon: <Brain className="w-4 h-4" />,
        });
        fetchApplications();
      }
    } catch (err) {
      console.error('Risk analysis error:', err);
      toast.error('Failed to run risk analysis');
    } finally {
      setAnalyzingRisk(null);
    }
  };

  const handleApprove = async (id: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    setLoading(true);
    const { error } = await supabase
      .from('loan_applications')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve application');
    } else {
      toast.success('Application approved successfully');
      
      // Send SMS notification
      const smsResult = await sendStatusNotification(
        app.owner_phone,
        'approved',
        app.business_name,
        id,
        app.loan_amount
      );
      
      if (smsResult.success) {
        toast.success('SMS notification sent to applicant', {
          icon: <MessageSquare className="w-4 h-4" />,
        });
      } else {
        toast.warning('Application approved but SMS notification failed');
      }
      
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

    const app = applications.find(a => a.id === id);
    if (!app) return;

    setLoading(true);
    const { error } = await supabase
      .from('loan_applications')
      .update({ status: 'rejected', rejection_reason: rejectionReason })
      .eq('id', id);

    if (error) {
      toast.error('Failed to reject application');
    } else {
      toast.success('Application rejected');
      
      // Send SMS notification
      const smsResult = await sendStatusNotification(
        app.owner_phone,
        'rejected',
        app.business_name,
        id,
        app.loan_amount,
        rejectionReason
      );
      
      if (smsResult.success) {
        toast.success('SMS notification sent to applicant', {
          icon: <MessageSquare className="w-4 h-4" />,
        });
      } else {
        toast.warning('Application rejected but SMS notification failed');
      }
      
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

  const getRiskBadge = (riskLevel: string | null | undefined, riskScore: number | null | undefined) => {
    if (!riskLevel) {
      return <Badge variant="outline" className="text-muted-foreground">Not Assessed</Badge>;
    }

    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className: string }> = {
      low: { variant: 'default', icon: <CheckCircle className="w-3 h-3 mr-1" />, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
      medium: { variant: 'secondary', icon: <AlertTriangle className="w-3 h-3 mr-1" />, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      high: { variant: 'destructive', icon: <XCircle className="w-3 h-3 mr-1" />, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    };

    const { icon, className } = config[riskLevel] || config.medium;

    return (
      <Badge variant="outline" className={className}>
        {icon}
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} ({riskScore || 0})
      </Badge>
    );
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
                <TableHead>Risk Level</TableHead>
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
                  <TableCell>
                    {getRiskBadge(app.risk_assessment?.risk_level, app.risk_assessment?.risk_score)}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{format(new Date(app.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRunRiskAnalysis(app)}
                        disabled={analyzingRisk === app.id}
                      >
                        {analyzingRisk === app.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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
              {/* Risk Assessment Card */}
              {selectedApp.risk_assessment && (
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      AI Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold">Risk Score</Label>
                        <p className="text-2xl font-bold">
                          {selectedApp.risk_assessment.risk_score || 'N/A'}
                          <span className="text-sm font-normal text-muted-foreground">/100</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Risk Level</Label>
                        <div className="mt-1">
                          {getRiskBadge(selectedApp.risk_assessment.risk_level, selectedApp.risk_assessment.risk_score)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">KYC Status</Label>
                        <Badge 
                          variant={selectedApp.risk_assessment.kyc_status === 'verified' ? 'default' : 'outline'}
                          className={selectedApp.risk_assessment.kyc_status === 'verified' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                        >
                          {selectedApp.risk_assessment.kyc_status || 'Pending'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">AML Status</Label>
                        <Badge 
                          variant={selectedApp.risk_assessment.aml_status === 'clear' ? 'default' : 'outline'}
                          className={selectedApp.risk_assessment.aml_status === 'clear' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                        >
                          {selectedApp.risk_assessment.aml_status || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedApp.risk_assessment.fraud_flags && 
                     Array.isArray(selectedApp.risk_assessment.fraud_flags) && 
                     (selectedApp.risk_assessment.fraud_flags as string[]).length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold text-destructive">Fraud Flags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedApp.risk_assessment.fraud_flags as string[]).map((flag, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApp.risk_assessment.verification_notes && (
                      <div>
                        <Label className="text-sm font-semibold">AI Recommendation</Label>
                        <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                          {selectedApp.risk_assessment.verification_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
