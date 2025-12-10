import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertTriangle, CheckCircle, XCircle, Shield, FileCheck, AlertCircle, Eye, Clock, Brain, Loader2, FileImage, User, Building2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { Label } from '@/components/ui/label';

interface RiskAssessmentDB {
  id: string;
  application_id: string | null;
  risk_score: number | null;
  risk_level: string | null;
  kyc_status: string | null;
  aml_status: string | null;
  fraud_flags: unknown;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Application {
  id: string;
  business_name: string;
  owner_name: string;
  owner_phone: string;
  registration_number: string;
  years_in_operation: number;
  physical_address: string;
  loan_amount: number;
  loan_purpose: string;
  distributor_name: string;
  status: string;
  documents_verified: boolean;
  id_document_url: string | null;
  business_registration_url: string | null;
  selfie_url: string | null;
  created_at: string;
}

interface CombinedAssessment {
  id: string;
  application: Application;
  risk_assessment: RiskAssessmentDB | null;
  has_documents: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
}

const RiskCompliance = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assessments, setAssessments] = useState<CombinedAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<CombinedAssessment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<CombinedAssessment | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [documentDialog, setDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [analyzingRisk, setAnalyzingRisk] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [searchQuery, assessments]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch loan applications
      const { data: applications, error: appError } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appError) throw appError;

      // Fetch risk assessments
      const { data: riskAssessments, error: riskError } = await supabase
        .from('risk_assessments')
        .select('*');

      if (riskError) {
        console.error('Risk assessments error:', riskError);
      }

      // Fetch audit logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Audit logs error:', logsError);
      }

      // Combine applications with their risk assessments
      const combinedData: CombinedAssessment[] = (applications || []).map(app => {
        const riskAssessment = riskAssessments?.find(r => r.application_id === app.id) || null;
        const hasDocuments = !!(app.id_document_url || app.business_registration_url || app.selfie_url);
        
        return {
          id: app.id,
          application: app,
          risk_assessment: riskAssessment,
          has_documents: hasDocuments,
        };
      });

      setAssessments(combinedData);
      setAuditLogs((logs || []) as AuditLog[]);
    } catch (error) {
      console.error('Error fetching risk data:', error);
      toast.error('Failed to load risk assessment data');
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
        a.application.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.application.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredAssessments(filtered);
  };

  const handleRunRiskAnalysis = async (assessment: CombinedAssessment) => {
    setAnalyzingRisk(assessment.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-risk', {
        body: {
          applicationId: assessment.application.id,
          documentUrls: {
            idDocument: assessment.application.id_document_url,
            businessRegistration: assessment.application.business_registration_url,
            selfie: assessment.application.selfie_url
          },
          businessData: {
            businessName: assessment.application.business_name,
            registrationNumber: assessment.application.registration_number,
            yearsInOperation: assessment.application.years_in_operation,
            physicalAddress: assessment.application.physical_address,
            loanAmount: assessment.application.loan_amount,
            loanPurpose: assessment.application.loan_purpose,
            distributorName: assessment.application.distributor_name
          }
        }
      });

      if (error) {
        toast.error('Failed to run risk analysis: ' + error.message);
      } else {
        toast.success('AI risk analysis completed!');
        fetchData();
      }
    } catch (err) {
      console.error('Risk analysis error:', err);
      toast.error('Failed to run risk analysis');
    } finally {
      setAnalyzingRisk(null);
    }
  };

  const handleViewDocument = async (url: string | null) => {
    if (!url) {
      toast.error('Document not available');
      return;
    }

    const { data } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(url, 3600);

    if (data?.signedUrl) {
      setSelectedDocument(data.signedUrl);
      setDocumentDialog(true);
    } else {
      toast.error('Failed to load document');
    }
  };

  const getRiskBadge = (level: string | null) => {
    if (!level) {
      return <Badge variant="outline" className="text-muted-foreground">Not Assessed</Badge>;
    }

    const variants: Record<string, { icon: React.ElementType; className: string }> = {
      low: { icon: CheckCircle, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      medium: { icon: AlertCircle, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      high: { icon: AlertTriangle, className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const { icon: Icon, className } = variants[level] || variants.medium;

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status || status === 'pending') {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    if (status === 'verified' || status === 'clear') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (status === 'flagged') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />;
  };

  const viewDetails = (assessment: CombinedAssessment) => {
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
    highRisk: assessments.filter(a => a.risk_assessment?.risk_level === 'high').length,
    mediumRisk: assessments.filter(a => a.risk_assessment?.risk_level === 'medium').length,
    lowRisk: assessments.filter(a => a.risk_assessment?.risk_level === 'low').length,
    pendingVerification: assessments.filter(a => !a.application.documents_verified && a.has_documents).length,
    kycVerified: assessments.filter(a => a.risk_assessment?.kyc_status === 'verified').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Risk & Compliance</h1>
        <p className="text-muted-foreground">Monitor KYC/AML compliance and AI risk assessments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Docs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingVerification}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">KYC Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kycVerified}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">AI Risk Assessments</TabsTrigger>
          <TabsTrigger value="documents">Document Review</TabsTrigger>
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
              <CardTitle>AI Risk Assessment Dashboard</CardTitle>
              <CardDescription>View AI-generated risk scores and compliance status</CardDescription>
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
                    <TableHead>AML</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssessments.map((assessment) => {
                      const fraudFlags = assessment.risk_assessment?.fraud_flags;
                      const flagCount = Array.isArray(fraudFlags) ? fraudFlags.length : 0;
                      
                      return (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">{assessment.application.business_name}</TableCell>
                          <TableCell>{assessment.application.owner_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold">
                                {assessment.risk_assessment?.risk_score ?? '—'}
                              </div>
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>{getRiskBadge(assessment.risk_assessment?.risk_level || null)}</TableCell>
                          <TableCell>{getStatusBadge(assessment.risk_assessment?.kyc_status || null)}</TableCell>
                          <TableCell>{getStatusBadge(assessment.risk_assessment?.aml_status || null)}</TableCell>
                          <TableCell>
                            {flagCount > 0 ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {flagCount}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => viewDetails(assessment)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleRunRiskAnalysis(assessment)}
                                disabled={analyzingRisk === assessment.id}
                              >
                                {analyzingRisk === assessment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Brain className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Review Queue</CardTitle>
              <CardDescription>Review and verify uploaded KYC documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssessments.filter(a => a.has_documents).map(assessment => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileCheck className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{assessment.application.business_name}</p>
                        <p className="text-sm text-muted-foreground">{assessment.application.owner_name}</p>
                        <div className="flex gap-2 mt-2">
                          {assessment.application.id_document_url && (
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3 w-3" /> ID
                            </Badge>
                          )}
                          {assessment.application.business_registration_url && (
                            <Badge variant="outline" className="gap-1">
                              <Building2 className="h-3 w-3" /> Business
                            </Badge>
                          )}
                          {assessment.application.selfie_url && (
                            <Badge variant="outline" className="gap-1">
                              <Camera className="h-3 w-3" /> Selfie
                            </Badge>
                          )}
                          {assessment.application.documents_verified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assessment.application.id_document_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDocument(assessment.application.id_document_url)}
                        >
                          <User className="h-4 w-4 mr-1" /> View ID
                        </Button>
                      )}
                      {assessment.application.business_registration_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDocument(assessment.application.business_registration_url)}
                        >
                          <Building2 className="h-4 w-4 mr-1" /> View Reg
                        </Button>
                      )}
                      {assessment.application.selfie_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDocument(assessment.application.selfie_url)}
                        >
                          <Camera className="h-4 w-4 mr-1" /> View Selfie
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredAssessments.filter(a => a.has_documents).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents to review
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
              <CardDescription>Track all system actions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.entity_type}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details).slice(0, 50) + '...' : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Risk Assessment Details</DialogTitle>
            <DialogDescription>{selectedAssessment?.application.business_name}</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-6 py-4">
              {/* AI Risk Assessment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAssessment.risk_assessment ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Risk Score</Label>
                        <p className="text-2xl font-bold">
                          {selectedAssessment.risk_assessment.risk_score ?? 'N/A'}
                          <span className="text-sm font-normal text-muted-foreground">/100</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Risk Level</Label>
                        <div className="mt-1">
                          {getRiskBadge(selectedAssessment.risk_assessment.risk_level)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">KYC Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(selectedAssessment.risk_assessment.kyc_status)}
                          <span className="capitalize">{selectedAssessment.risk_assessment.kyc_status || 'Pending'}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">AML Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(selectedAssessment.risk_assessment.aml_status)}
                          <span className="capitalize">{selectedAssessment.risk_assessment.aml_status || 'Pending'}</span>
                        </div>
                      </div>
                      {Array.isArray(selectedAssessment.risk_assessment.fraud_flags) && 
                       selectedAssessment.risk_assessment.fraud_flags.length > 0 && (
                        <div className="col-span-2">
                          <Label className="text-sm text-destructive">Fraud Flags</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(selectedAssessment.risk_assessment.fraud_flags as string[]).map((flag, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedAssessment.risk_assessment.verification_notes && (
                        <div className="col-span-2">
                          <Label className="text-sm text-muted-foreground">AI Recommendation</Label>
                          <p className="text-sm mt-1 p-2 bg-muted rounded">
                            {selectedAssessment.risk_assessment.verification_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">No AI assessment available</p>
                      <Button onClick={() => handleRunRiskAnalysis(selectedAssessment)}>
                        <Brain className="h-4 w-4 mr-2" />
                        Run AI Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Owner</Label>
                      <p className="font-medium">{selectedAssessment.application.owner_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedAssessment.application.owner_phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Registration</Label>
                      <p className="font-medium">{selectedAssessment.application.registration_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Years Operating</Label>
                      <p className="font-medium">{selectedAssessment.application.years_in_operation} years</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Loan Amount</Label>
                      <p className="font-medium">KSh {selectedAssessment.application.loan_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge variant="outline" className="capitalize">{selectedAssessment.application.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2"
                      disabled={!selectedAssessment.application.id_document_url}
                      onClick={() => handleViewDocument(selectedAssessment.application.id_document_url)}
                    >
                      <User className="h-6 w-6" />
                      <span className="text-xs">ID Document</span>
                      {selectedAssessment.application.id_document_url ? (
                        <Badge variant="secondary" className="text-xs">View</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Missing</Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2"
                      disabled={!selectedAssessment.application.business_registration_url}
                      onClick={() => handleViewDocument(selectedAssessment.application.business_registration_url)}
                    >
                      <Building2 className="h-6 w-6" />
                      <span className="text-xs">Business Reg</span>
                      {selectedAssessment.application.business_registration_url ? (
                        <Badge variant="secondary" className="text-xs">View</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Missing</Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2"
                      disabled={!selectedAssessment.application.selfie_url}
                      onClick={() => handleViewDocument(selectedAssessment.application.selfie_url)}
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-xs">Selfie</span>
                      {selectedAssessment.application.selfie_url ? (
                        <Badge variant="secondary" className="text-xs">View</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Missing</Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={documentDialog} onOpenChange={setDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Viewer</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[400px]">
              <img
                src={selectedDocument}
                alt="Document"
                className="max-w-full max-h-[70vh] object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  toast.error('Failed to load document image');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskCompliance;