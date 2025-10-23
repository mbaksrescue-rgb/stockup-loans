import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          
          <Card className="shadow-elegant">
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <p className="text-muted-foreground mb-6">
                Last Updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="text-2xl font-semibold mb-4">1. Loan Agreement</h2>
              <p className="mb-4">
                By applying for and accepting a Stock 24/7 loan, you agree to repay the principal amount plus 10% flat interest within 7 days of disbursement. All loans are subject to approval and verification.
              </p>

              <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
              <p className="mb-4">
                To qualify for Stock 24/7 loans, you must:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Operate a registered liquor business (bar, liquor store, restaurant, or wines & spirits shop)</li>
                <li>Have been in operation for at least 2 years</li>
                <li>Provide valid distributor details including till/paybill number</li>
                <li>Be of legal age (18+ years) in Kenya</li>
                <li>Have a valid M-PESA account for repayment</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">3. Disbursement</h2>
              <p className="mb-4">
                Approved loan amounts are disbursed directly to the distributor's M-PESA till or paybill as specified in your application. You acknowledge that funds will not be disbursed to your personal account.
              </p>

              <h2 className="text-2xl font-semibold mb-4">4. Repayment</h2>
              <p className="mb-4">
                Loans must be repaid within 7 days via M-PESA paybill. A 2-day grace period is provided, after which late fees of 2% per day apply on the outstanding amount. Failure to repay may result in:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Reduced access to future loans</li>
                <li>Negative credit reporting</li>
                <li>Legal action to recover the debt</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">5. Interest and Fees</h2>
              <p className="mb-4">
                Stock 24/7 charges a flat 10% interest rate on all loans. There are no application fees, processing fees, or hidden charges. Late payment fees of 2% per day apply after the grace period.
              </p>

              <h2 className="text-2xl font-semibold mb-4">6. Data Privacy</h2>
              <p className="mb-4">
                We collect and process your personal and business information in accordance with Kenya's Data Protection Act. Your data is used solely for loan processing, verification, and communication purposes. See our Privacy Policy for details.
              </p>

              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="mb-4">
                Zion Links Technologies reserves the right to deny, suspend, or terminate loan applications or services at any time for violation of these terms, suspected fraud, or failure to meet eligibility criteria.
              </p>

              <h2 className="text-2xl font-semibold mb-4">8. Amendments</h2>
              <p className="mb-4">
                These terms may be updated from time to time. Continued use of Stock 24/7 services after updates constitutes acceptance of the revised terms.
              </p>

              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="mb-4">
                These terms are governed by the laws of Kenya. Any disputes shall be resolved in Kenyan courts.
              </p>

              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="mb-4">
                For questions about these terms, contact us at:
              </p>
              <ul className="list-none mb-4">
                <li>Email: support@zionlinks.example</li>
                <li>Phone: +254 723 037650 / +254 112 876759</li>
                <li>Address: Kimson Plaza, Eastern Bypass, 2nd Floor</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
