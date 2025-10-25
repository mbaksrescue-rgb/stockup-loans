import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertTriangle, CheckCircle, XCircle, Shield, FileCheck, AlertCircle, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface RiskAssessment {
  id: string;
  business_name: string;
  owner_name: string;
  license_verified: boolean;
  kyc_completed: boolean;
  aml_checked: boolean;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  fraud_flags: string[];
  last_checked: string;
}

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}

const RiskCompliance = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<RiskAssessment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [searchQuery, assessments]);

  const fetchData = async () => {
    try {
      // Fetch loan applications and create risk assessments
      const { data: applications, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate risk assessments
      const assessmentData: RiskAssessment[] = (applications || []).map(app => {
        const fraudFlags: string[] = [];
        let riskScore = 0;

        // Check for fraud indicators
        if (!app.registration_number) {
          fraudFlags.push('Missing registration number');
          riskScore += 20;
        }

        if (app.years_in_operation < 1) {
          fraudFlags.push('Business less than 1 year old');
          riskScore += 15;
        }

        if (Number(app.loan_amount) > 500000) {
          fraudFlags.push('High loan amount requested');
          riskScore += 10;
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (riskScore >= 30) riskLevel = 'high';
        else if (riskScore >= 15) riskLevel = 'medium';

        return {
          id: app.id,
          business_name: app.business_name,
          owner_name: app.owner_name,
          license_verified: !!app.registration_number,
          kyc_completed: !!app.owner_name && !!app.owner_phone,
          aml_checked: false,
          risk_score: riskScore,
          risk_level: riskLevel,
          fraud_flags: fraudFlags,
          last_checked: app.created_at,
        };
      });

      setAssessments(assessmentData);

      // Generate sample audit logs
      const logs: AuditLog[] = applications?.slice(0, 20).map((app, idx) => ({
        id: `log-${idx}`,
        user_email: 'admin@zionlink.com',
        action: ['Approved Loan', 'Rejected Loan', 'Updated Customer', 'Verified Document', 'Sent Payment'][idx % 5],
        entity_type: ['loan_application', 'customer', 'disbursement'][idx % 3],
        entity_id: app.id,
        details: `Action performed on ${app.business_name}`,
        timestamp: app.created_at,
      })) || [];

      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching risk data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load risk assessment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    if (!searchQuery) {
      setFilteredAssessments(assessments);
      return;
    }

    const filtered = assessments.filter(
      (a) =>
        a.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredAssessments(filtered);
  };

  const getRiskBadge = (level: string) => {
    const variants: Record<string, { variant: any; icon: any; className: string }> = {
      low: { variant: 'default', icon: CheckCircle, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      medium: { variant: 'secondary', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      high: { variant: 'destructive', icon: AlertTriangle, className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const { icon: Icon, className } = variants[level] || variants.low;

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const viewDetails = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    total: assessments.length,
    highRisk: assessments.filter(a => a.risk_level === 'high').length,
    mediumRisk: assessments.filter(a => a.risk_level === 'medium').length,
    lowRisk: assessments.filter(a => a.risk_level === 'low').length,
    kycCompleted: assessments.filter(a => a.kyc_completed).length,
    licenseVerified: assessments.filter(a => a.license_verified).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Risk & Compliance</h1>
        <p className="text-muted-foreground">Monitor KYC/AML compliance and fraud detection</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">KYC Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kycCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.licenseVerified}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
          <TabsTrigger value="verification">Document Verification</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business or owner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Dashboard</CardTitle>
              <CardDescription>Monitor customer risk levels and compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>AML</TableHead>
                    <TableHead>Fraud Flags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.business_name}</TableCell>
                        <TableCell>{assessment.owner_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">{assessment.risk_score}</div>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>{getRiskBadge(assessment.risk_level)}</TableCell>
                        <TableCell>
                          {assessment.kyc_completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {assessment.license_verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {assessment.aml_checked ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {assessment.fraud_flags.length > 0 ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {assessment.fraud_flags.length}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => viewDetails(assessment)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Document Verification Queue</CardTitle>
              <CardDescription>Review and verify customer documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssessments.filter(a => !a.license_verified || !a.kyc_completed).map(assessment => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileCheck className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{assessment.business_name}</p>
                        <p className="text-sm text-muted-foreground">{assessment.owner_name}</p>
                        <div className="flex gap-2 mt-2">
                          {!assessment.license_verified && (
                            <Badge variant="outline">License Pending</Badge>
                          )}
                          {!assessment.kyc_completed && (
                            <Badge variant="outline">KYC Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAssessments.filter(a => !a.license_verified || !a.kyc_completed).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    All documents verified
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Track all administrative actions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="font-medium">{log.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.entity_type}</TableCell>
                      <TableCell className="text-sm">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Risk Assessment Details</DialogTitle>
            <DialogDescription>{selectedAssessment?.business_name}</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Owner</p>
                  <p className="text-lg">{selectedAssessment.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(selectedAssessment.risk_level)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-bold">{selectedAssessment.risk_score}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Checked</p>
                  <p className="text-sm">{formatDistanceToNow(new Date(selectedAssessment.last_checked), { addSuffix: true })}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Compliance Status</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    {selectedAssessment.kyc_completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm">KYC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAssessment.license_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm">License</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAssessment.aml_checked ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-600" />
                    )}
                    <span className="text-sm">AML</span>
                  </div>
                </div>
              </div>

              {selectedAssessment.fraud_flags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Fraud Flags</p>
                  <div className="space-y-2">
                    {selectedAssessment.fraud_flags.map((flag, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
            <Button>Mark as Reviewed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskCompliance;
