import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

const Disbursement = () => {
  const [status, setStatus] = useState<"processing" | "completed">("processing");
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate disbursement process
    const timer = setTimeout(() => {
      setStatus("completed");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {status === "processing" ? (
                  <Loader2 className="w-16 h-16 text-accent animate-spin" />
                ) : (
                  <CheckCircle2 className="w-16 h-16 text-success" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {status === "processing" ? "Processing Disbursement..." : "Disbursement Complete!"}
              </CardTitle>
              <CardDescription>
                {status === "processing"
                  ? "We're sending your funds to the distributor"
                  : "Funds have been successfully disbursed"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    status === "completed" ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"
                  }`}>
                    {status === "completed" ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Payment to Distributor</p>
                    <p className="text-sm text-muted-foreground">
                      {status === "processing" ? "In progress..." : "Completed"}
                    </p>
                  </div>
                </div>

                {status === "completed" && (
                  <>
                    <Card className="bg-success/10 border-success/20">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="text-success" size={20} />
                          Transaction Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Amount Disbursed:</strong> KSh 50,000</p>
                          <p><strong>Transaction ID:</strong> MPX{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                          <p><strong>Distributor Till:</strong> 123456</p>
                          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange/10 border-orange/20">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold mb-2">Repayment Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Amount to Repay:</strong> KSh 55,000 (10% interest)</p>
                          <p><strong>Due Date:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                          <p><strong>Paybill:</strong> 4567890</p>
                          <p><strong>Account Number:</strong> Your phone number</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          You will receive SMS reminders 24 hours before the due date and on the due date.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                        Back to Home
                      </Button>
                      <Button variant="hero" onClick={() => window.print()} className="flex-1">
                        Print Receipt
                      </Button>
                    </div>
                  </>
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

export default Disbursement;
