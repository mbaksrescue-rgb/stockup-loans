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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  FileCheck, 
  FileX, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileImage,
  User,
  Building2,
  Camera
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KycDocument {
  id: string;
  user_id: string;
  application_id: string | null;
  document_type: string;
  document_url: string;
  analysis_result: unknown;
  risk_score: number | null;
  created_at: string;
  updated_at: string;
}

interface ApplicationWithDocs {
  id: string;
  business_name: string;
  owner_name: string;
  owner_phone: string;
  status: string;
  created_at: string;
  documents_verified: boolean;
  id_document_url: string | null;
  business_registration_url: string | null;
  selfie_url: string | null;
  kyc_documents: KycDocument[];
}

const DocumentVerification = () => {
  const [applications, setApplications] = useState<ApplicationWithDocs[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDocs | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  useEffect(() => {
    fetchApplicationsWithDocuments();
  }, []);

  const fetchApplicationsWithDocuments = async () => {
    setLoading(true);
    
    // Fetch applications with documents
    const { data: apps, error: appsError } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (appsError) {
      toast.error('Failed to fetch applications');
      setLoading(false);
      return;
    }

    // Fetch KYC documents
    const { data: kycDocs, error: kycError } = await supabase
      .from('kyc_data')
      .select('*');

    if (kycError) {
      console.error('Failed to fetch KYC data:', kycError);
    }

    // Map documents to applications
    const applicationsWithDocs: ApplicationWithDocs[] = (apps || []).map((app) => ({
      ...app,
      kyc_documents: (kycDocs || []).filter((doc) => doc.application_id === app.id),
    }));

    setApplications(applicationsWithDocs);
    setLoading(false);
  };

  const getDocumentUrl = async (path: string | null): Promise<string | null> => {
    if (!path) return null;
    
    const { data } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    return data?.signedUrl || null;
  };

  const handleViewDocument = async (url: string | null) => {
    if (!url) {
      toast.error('Document not available');
      return;
    }

    const signedUrl = await getDocumentUrl(url);
    if (signedUrl) {
      setSelectedDocument(signedUrl);
    } else {
      toast.error('Failed to load document');
    }
  };

  const handleVerifyDocuments = async (appId: string, verified: boolean) => {
    setVerifying(true);
    
    const { error } = await supabase
      .from('loan_applications')
      .update({ documents_verified: verified })
      .eq('id', appId);

    if (error) {
      toast.error('Failed to update verification status');
    } else {
      toast.success(verified ? 'Documents verified successfully' : 'Documents marked as unverified');
      fetchApplicationsWithDocuments();
      setSelectedApp(null);
    }
    
    setVerifying(false);
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !app.documents_verified;
    if (filter === 'verified') return app.documents_verified;
    return true;
  });

  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-500/20">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'id_document':
        return <User className="w-4 h-4" />;
      case 'business_registration':
        return <Building2 className="w-4 h-4" />;
      case 'selfie':
        return <Camera className="w-4 h-4" />;
      default:
        return <FileImage className="w-4 h-4" />;
    }
  };

  const hasDocuments = (app: ApplicationWithDocs) => {
    return app.id_document_url || app.business_registration_url || app.selfie_url || app.kyc_documents.length > 0;
  };

  const pendingCount = applications.filter(a => !a.documents_verified && hasDocuments(a)).length;
  const verifiedCount = applications.filter(a => a.documents_verified).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify KYC documents submitted by applicants</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <FileImage className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications with Documents</CardTitle>
          <CardDescription>Click on an application to view and verify uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => {
                const docCount = [
                  app.id_document_url,
                  app.business_registration_url,
                  app.selfie_url,
                ].filter(Boolean).length + app.kyc_documents.length;

                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.business_name}</TableCell>
                    <TableCell>{app.owner_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{docCount} document(s)</Badge>
                    </TableCell>
                    <TableCell>{getVerificationBadge(app.documents_verified)}</TableCell>
                    <TableCell>{format(new Date(app.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Application Documents Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Review - {selectedApp?.business_name}</DialogTitle>
            <DialogDescription>
              Review all uploaded documents for this application
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Owner Name</Label>
                      <p className="font-medium">{selectedApp.owner_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedApp.owner_phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Business</Label>
                      <p className="font-medium">{selectedApp.business_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Application Status</Label>
                      <Badge variant="outline">{selectedApp.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ID Document */}
                <Card className={selectedApp.id_document_url ? '' : 'opacity-50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      ID Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApp.id_document_url ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDocument(selectedApp.id_document_url)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">Not uploaded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Business Registration */}
                <Card className={selectedApp.business_registration_url ? '' : 'opacity-50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Business Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApp.business_registration_url ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDocument(selectedApp.business_registration_url)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">Not uploaded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Selfie */}
                <Card className={selectedApp.selfie_url ? '' : 'opacity-50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Selfie Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApp.selfie_url ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDocument(selectedApp.selfie_url)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Photo
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">Not uploaded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional KYC Documents */}
              {selectedApp.kyc_documents.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Additional KYC Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedApp.kyc_documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getDocumentIcon(doc.document_type)}
                            <div>
                              <p className="font-medium capitalize">
                                {doc.document_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.risk_score !== null && (
                              <Badge variant={doc.risk_score > 50 ? 'destructive' : 'secondary'}>
                                Risk: {doc.risk_score}
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(doc.document_url)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Notes */}
              <div className="space-y-2">
                <Label>Verification Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about the document verification..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => handleVerifyDocuments(selectedApp.id, true)}
                  disabled={verifying}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Verify Documents
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleVerifyDocuments(selectedApp.id, false)}
                  disabled={verifying}
                >
                  <FileX className="w-4 h-4 mr-2" />
                  Mark Unverified
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
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

export default DocumentVerification;