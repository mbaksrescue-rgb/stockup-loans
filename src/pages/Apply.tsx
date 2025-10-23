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
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

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
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleSubmit = () => {
    if (validateStep()) {
      // Simulate approval decision
      const isApproved = Math.random() > 0.3; // 70% approval rate
      
      toast({
        title: isApproved ? "Application Approved! 🎉" : "Additional Documents Required",
        description: isApproved
          ? "Your loan has been approved. Disbursement will be processed within 24 hours."
          : "We need to verify a few more details. Our team will contact you shortly.",
      });

      setTimeout(() => {
        navigate(isApproved ? "/disbursement" : "/");
      }, 2000);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Apply for Stock 24/7</h1>
            <p className="text-muted-foreground">Complete your application in 4 simple steps</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      s <= step
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle2 size={20} /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`h-1 w-12 sm:w-20 mx-1 ${
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
            </div>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Business Details"}
                {step === 2 && "Distributor Details"}
                {step === 3 && "Loan Details"}
                {step === 4 && "Contact & Verification"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about your liquor business"}
                {step === 2 && "Who is your preferred distributor?"}
                {step === 3 && "How much do you need and why?"}
                {step === 4 && "Your contact information for verification"}
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
                      <p className="text-xs text-destructive mt-1">{errors.distributorName}</p>
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
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Application Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Business:</strong> {formData.businessName}</p>
                        <p><strong>Years Operating:</strong> {formData.yearsInOperation}</p>
                        <p><strong>Distributor:</strong> {formData.distributorName}</p>
                        <p><strong>Loan Amount:</strong> KSh {parseInt(formData.loanAmount).toLocaleString()}</p>
                        <p><strong>Total Repayment:</strong> KSh {(parseInt(formData.loanAmount) * 1.1).toLocaleString()}</p>
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
                  >
                    <ArrowLeft />
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button variant="hero" onClick={handleNext} className="flex-1">
                    Next
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button variant="hero" onClick={handleSubmit} className="flex-1">
                    Submit Application
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
