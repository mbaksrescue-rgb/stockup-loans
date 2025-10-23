import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <Card className="shadow-elegant">
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <p className="text-muted-foreground mb-6">
                Last Updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect the following information when you apply for a Stock 24/7 loan:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Business Information:</strong> Business name, registration number, years in operation, physical address</li>
                <li><strong>Distributor Information:</strong> Distributor name, contact, till/paybill number</li>
                <li><strong>Personal Information:</strong> Your name, phone number, email address</li>
                <li><strong>Transaction Data:</strong> Loan amounts, repayment records, disbursement details</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">Your information is used to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Process and assess your loan application</li>
                <li>Verify your business and distributor details</li>
                <li>Disburse funds to your specified distributor</li>
                <li>Send payment reminders and transaction notifications</li>
                <li>Improve our services and customer experience</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
              <p className="mb-4">
                We do not sell your personal information. Your data may be shared with:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Distributors:</strong> To verify your relationship and process disbursements</li>
                <li><strong>Payment Processors:</strong> M-PESA and other payment platforms for transactions</li>
                <li><strong>Credit Bureaus:</strong> To assess creditworthiness and report repayment history</li>
                <li><strong>Legal Authorities:</strong> When required by law or to prevent fraud</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We use industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure servers with access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee training on data protection</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="mb-4">Under Kenya's Data Protection Act, you have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Object to processing of your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to provide services and comply with legal obligations. Loan records are typically kept for 7 years as required by financial regulations.
              </p>

              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="mb-4">
                Our website uses cookies to improve user experience and analyze site performance. You can disable cookies in your browser settings, though some features may not function properly.
              </p>

              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
              <p className="mb-4">
                Our website may contain links to third-party sites. We are not responsible for the privacy practices of these sites. Please review their privacy policies before providing any information.
              </p>

              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy periodically. Changes will be posted on this page with an updated date. Continued use of our services constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="mb-4">
                For privacy-related questions or to exercise your data rights, contact us at:
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

export default Privacy;
