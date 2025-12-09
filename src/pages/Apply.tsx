import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DocumentCapture from "@/components/DocumentCapture";

interface FormData {
  businessName: string;
  registrationNumber: string;
  yearsInOperation: string;
  physicalAddress: string;
  distributorName: string;
  distributorPaybill: string;
  distributorContact: string;
  loanAmount: string;
  loanPurpose: string;
  ownerName: string;
  phoneNumber: string;
}

interface DocumentUrls {
  idDocument: string;
  businessRegistration: string;
  selfie: string;
}

const Apply = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    registrationNumber: "",
    yearsInOperation: "",
    physicalAddress: "",
    distributorName: "",
    distributorPaybill: "",
    distributorContact: "",
    loanAmount: "",
    loanPurpose: "",
    ownerName: "",
    phoneNumber: "",
  });
  const [documentUrls, setDocumentUrls] = useState<DocumentUrls>({
    idDocument: "",
    businessRegistration: "",
    selfie: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const validateStep = () => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.businessName) newErrors.businessName = "Required";
      if (!formData.registrationNumber) newErrors.registrationNumber = "Required";
      if (!formData.yearsInOperation) newErrors.yearsInOperation = "Required";
      else if (parseInt(formData.yearsInOperation) < 2) {
        newErrors.yearsInOperation = "Must be at least 2 years";
      }
      if (!formData.physicalAddress) newErrors.physicalAddress = "Required";
    }

    if (step === 2) {
      if (!formData.distributorName) newErrors.distributorName = "Required";
      if (!formData.distributorPaybill) newErrors.distributorPaybill = "Required";
      if (!formData.distributorContact) newErrors.distributorContact = "Required";
    }

    if (step === 3) {
      if (!formData.loanAmount) newErrors.loanAmount = "Required";
      else {
        const amount = parseInt(formData.loanAmount);
        if (amount < 5000 || amount > 300000) {
          newErrors.loanAmount = "Amount must be between KSh 5,000 and 300,000";
        }
      }
      if (!formData.loanPurpose) newErrors.loanPurpose = "Required";
    }

    if (step === 4) {
      if (!formData.ownerName) newErrors.ownerName = "Required";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleDocumentCapture = (type: keyof DocumentUrls, url: string) => {
    setDocumentUrls(prev => ({ ...prev, [type]: url }));
  };

  const allDocumentsUploaded = documentUrls.idDocument && documentUrls.businessRegistration && documentUrls.selfie;

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your application.",
        variant: "destructive"
      });
      return;
    }

    if (!allDocumentsUploaded) {
      toast({
        title: "Documents Required",
        description: "Please upload all required documents before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Insert the loan application
      const { data: application, error: appError } = await supabase
        .from('loan_applications')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          registration_number: formData.registrationNumber,
          years_in_operation: parseInt(formData.yearsInOperation),
          physical_address: formData.physicalAddress,
          distributor_name: formData.distributorName,
          distributor_paybill: formData.distributorPaybill,
          distributor_contact: formData.distributorContact,
          loan_amount: parseInt(formData.loanAmount),
          loan_purpose: formData.loanPurpose,
          owner_name: formData.ownerName,
          owner_phone: formData.phoneNumber,
          id_document_url: documentUrls.idDocument,
          business_registration_url: documentUrls.businessRegistration,
          selfie_url: documentUrls.selfie,
          status: 'pending'
        })
        .select()
        .single();

      if (appError) throw appError;

      // Insert KYC data records
      const kycRecords = [
        { document_type: 'id_document', document_url: documentUrls.idDocument },
        { document_type: 'business_registration', document_url: documentUrls.businessRegistration },
        { document_type: 'selfie', document_url: documentUrls.selfie },
      ].map(doc => ({
        ...doc,
        user_id: user.id,
        application_id: application.id,
      }));

      const { error: kycError } = await supabase
        .from('kyc_data')
        .insert(kycRecords);

      if (kycError) {
        console.error('KYC insert error:', kycError);
      }

      toast({
        title: "Application Submitted! 🎉",
        description: "Your application is being reviewed. We'll contact you within 24 hours.",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Apply for Stock 24/7</h1>
            <p className="text-muted-foreground">Complete your application in {totalSteps} simple steps</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      s <= step
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle2 size={18} /> : s}
                  </div>
                  {s < totalSteps && (
                    <div
                      className={`h-1 w-8 sm:w-14 mx-1 ${
                        s < step ? "bg-accent" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Business</span>
              <span>Distributor</span>
              <span>Loan</span>
              <span>Contact</span>
              <span>Verify</span>
            </div>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Business Details"}
                {step === 2 && "Distributor Details"}
                {step === 3 && "Loan Details"}
                {step === 4 && "Contact & Verification"}
                {step === 5 && "Document Verification"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about your liquor business"}
                {step === 2 && "Who is your preferred distributor?"}
                {step === 3 && "How much do you need and why?"}
                {step === 4 && "Your contact information for verification"}
                {step === 5 && "Upload required documents for KYC verification"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => updateField("businessName", e.target.value)}
                      className={errors.businessName ? "border-destructive" : ""}
                    />
                    {errors.businessName && (
                      <p className="text-xs text-destructive mt-1">{errors.businessName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => updateField("registrationNumber", e.target.value)}
                      className={errors.registrationNumber ? "border-destructive" : ""}
                    />
                    {errors.registrationNumber && (
                      <p className="text-xs text-destructive mt-1">{errors.registrationNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="yearsInOperation">Years in Operation *</Label>
                    <Input
                      id="yearsInOperation"
                      type="number"
                      min="2"
                      value={formData.yearsInOperation}
                      onChange={(e) => updateField("yearsInOperation", e.target.value)}
                      className={errors.yearsInOperation ? "border-destructive" : ""}
                    />
                    {errors.yearsInOperation && (
                      <p className="text-xs text-destructive mt-1">{errors.yearsInOperation}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="physicalAddress">Physical Address *</Label>
                    <Textarea
                      id="physicalAddress"
                      value={formData.physicalAddress}
                      onChange={(e) => updateField("physicalAddress", e.target.value)}
                      className={errors.physicalAddress ? "border-destructive" : ""}
                    />
                    {errors.physicalAddress && (
                      <p className="text-xs text-destructive mt-1">{errors.physicalAddress}</p>
                    )}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label htmlFor="distributorName">Distributor Name *</Label>
                    <Input
                      id="distributorName"
                      value={formData.distributorName}
                      onChange={(e) => updateField("distributorName", e.target.value)}
                      className={errors.distributorName ? "border-destructive" : ""}
                    />
                    {errors.distributorName && (
                      <p className="text-xs text-distributive mt-1">{errors.distributorName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="distributorPaybill">Paybill/Till Number *</Label>
                    <Input
                      id="distributorPaybill"
                      value={formData.distributorPaybill}
                      onChange={(e) => updateField("distributorPaybill", e.target.value)}
                      placeholder="e.g., 123456"
                      className={errors.distributorPaybill ? "border-destructive" : ""}
                    />
                    {errors.distributorPaybill && (
                      <p className="text-xs text-destructive mt-1">{errors.distributorPaybill}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="distributorContact">Distributor Contact *</Label>
                    <Input
                      id="distributorContact"
                      type="tel"
                      value={formData.distributorContact}
                      onChange={(e) => updateField("distributorContact", e.target.value)}
                      placeholder="+254 XXX XXXXXX"
                      className={errors.distributorContact ? "border-destructive" : ""}
                    />
                    {errors.distributorContact && (
                      <p className="text-xs text-destructive mt-1">{errors.distributorContact}</p>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <Label htmlFor="loanAmount">Loan Amount (KSh) *</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      min="5000"
                      max="300000"
                      value={formData.loanAmount}
                      onChange={(e) => updateField("loanAmount", e.target.value)}
                      placeholder="Between 5,000 and 300,000"
                      className={errors.loanAmount ? "border-destructive" : ""}
                    />
                    {errors.loanAmount && (
                      <p className="text-xs text-destructive mt-1">{errors.loanAmount}</p>
                    )}
                    {formData.loanAmount && !errors.loanAmount && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Interest (10%): KSh {(parseInt(formData.loanAmount) * 0.1).toLocaleString()} | 
                        Total Repayment: KSh {(parseInt(formData.loanAmount) * 1.1).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="loanPurpose">Purpose of Loan *</Label>
                    <Textarea
                      id="loanPurpose"
                      value={formData.loanPurpose}
                      onChange={(e) => updateField("loanPurpose", e.target.value)}
                      placeholder="e.g., Restock inventory, Purchase new brands"
                      className={errors.loanPurpose ? "border-destructive" : ""}
                    />
                    {errors.loanPurpose && (
                      <p className="text-xs text-destructive mt-1">{errors.loanPurpose}</p>
                    )}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div>
                    <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => updateField("ownerName", e.target.value)}
                      className={errors.ownerName ? "border-destructive" : ""}
                    />
                    {errors.ownerName && (
                      <p className="text-xs text-destructive mt-1">{errors.ownerName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => updateField("phoneNumber", e.target.value)}
                      placeholder="+254 XXX XXXXXX"
                      className={errors.phoneNumber ? "border-destructive" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                </>
              )}

              {step === 5 && user && (
                <>
                  <Card className="bg-muted/50 mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Document Requirements</p>
                          <p className="text-muted-foreground">
                            Please upload clear photos of your ID, business registration, and a selfie for verification.
                            All documents are securely stored and used only for loan risk assessment.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <DocumentCapture
                      documentType="id"
                      title="National ID / Passport"
                      description="Take a clear photo of your ID document (front side)"
                      onCapture={(url) => handleDocumentCapture('idDocument', url)}
                      userId={user.id}
                    />
                    
                    <DocumentCapture
                      documentType="business"
                      title="Business Registration"
                      description="Photo of your liquor license or business permit"
                      onCapture={(url) => handleDocumentCapture('businessRegistration', url)}
                      userId={user.id}
                    />
                    
                    <DocumentCapture
                      documentType="selfie"
                      title="Selfie Verification"
                      description="Take a selfie for identity verification"
                      onCapture={(url) => handleDocumentCapture('selfie', url)}
                      userId={user.id}
                    />
                  </div>

                  <Card className="bg-muted/50 mt-4">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Application Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Business:</strong> {formData.businessName}</p>
                        <p><strong>Years Operating:</strong> {formData.yearsInOperation}</p>
                        <p><strong>Distributor:</strong> {formData.distributorName}</p>
                        <p><strong>Loan Amount:</strong> KSh {parseInt(formData.loanAmount).toLocaleString()}</p>
                        <p><strong>Total Repayment:</strong> KSh {(parseInt(formData.loanAmount) * 1.1).toLocaleString()}</p>
                        <div className="pt-2 border-t mt-2">
                          <p className="flex items-center gap-2">
                            <strong>Documents:</strong>
                            {allDocumentsUploaded ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 size={14} /> All uploaded
                              </span>
                            ) : (
                              <span className="text-amber-600">
                                {[documentUrls.idDocument, documentUrls.businessRegistration, documentUrls.selfie].filter(Boolean).length}/3 uploaded
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <div className="flex gap-4 pt-4">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    <ArrowLeft />
                    Back
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button variant="hero" onClick={handleNext} className="flex-1">
                    Next
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button 
                    variant="hero" 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={submitting || !allDocumentsUploaded}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Apply;