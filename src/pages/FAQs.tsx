import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Who is eligible for Stock 24/7 loans?",
    answer: "You must have a registered liquor business (bar, liquor store, restaurant, wines & spirits shop) that has been operating for at least 2 years. You'll also need to provide valid distributor details where funds will be disbursed.",
  },
  {
    question: "How much can I borrow?",
    answer: "You can borrow between KSh 5,000 and KSh 300,000 depending on your business needs and creditworthiness. First-time borrowers may have lower limits which increase as you build your repayment history.",
  },
  {
    question: "What is the interest rate?",
    answer: "We charge a flat 10% interest on the loan amount. For example, if you borrow KSh 50,000, you'll repay KSh 55,000 after 7 days. There are no hidden fees or charges.",
  },
  {
    question: "How quickly can I get the funds?",
    answer: "Once your application is approved, funds are typically disbursed within 24 hours. In many cases, disbursement happens within a few hours. The funds are sent directly to your distributor's M-PESA till or paybill.",
  },
  {
    question: "Why are funds sent to the distributor instead of me?",
    answer: "Direct-to-distributor disbursement ensures the loan is used for its intended purpose (restocking inventory), reduces default risk, and builds trust with your suppliers. This model allows us to offer faster approvals and better rates.",
  },
  {
    question: "How do I repay the loan?",
    answer: "Repayment is done via M-PESA paybill within 7 days of disbursement. You'll receive the paybill number and your account details after loan approval. We'll send SMS and WhatsApp reminders 24 hours before and on the due date.",
  },
  {
    question: "What happens if I repay late?",
    answer: "We understand business challenges and offer a 2-day grace period. After that, late fees of 2% per day apply on the outstanding amount. Consistent late payments may affect your ability to access higher loan limits in the future.",
  },
  {
    question: "Can I borrow again after repaying?",
    answer: "Yes! Once you've successfully repaid your loan, you can immediately apply for another one. Good repayment history can qualify you for higher loan amounts and potentially better terms.",
  },
  {
    question: "What documents do I need?",
    answer: "You'll need your business registration number, years in operation, physical address, distributor details (name, till/paybill, contact), and your contact information. All documents are submitted through our online application form.",
  },
  {
    question: "Is my information secure?",
    answer: "Absolutely. We use bank-level encryption to protect your data. Your information is never shared with third parties except for verification purposes with your consent. All payments are processed through secure M-PESA channels.",
  },
  {
    question: "What if my application is rejected?",
    answer: "If your application is not approved immediately, our team may request additional documentation or information. Common reasons for rejection include insufficient operating history, incomplete distributor details, or issues with business verification. You can reapply after addressing these concerns.",
  },
  {
    question: "Can I access other services through Stock 24/7?",
    answer: "Yes! Visit our Market page to explore distributor deals, business tools (POS & inventory systems), insurance cover, growth loans for expansion, and our partner network. We're building a comprehensive ecosystem for liquor businesses.",
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach us via phone at +254 723 037650 or +254 112 876759, email at support@zionlinks.example, or WhatsApp at +254 723 037650. Our office is located at Kimson Plaza, Eastern Bypass, 2nd Floor.",
  },
];

const FAQs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Stock 24/7
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg px-6 shadow-elegant border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-card rounded-lg p-8 shadow-elegant">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you understand how Stock 24/7 works
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="hero" size="lg">
                  Contact Us
                </Button>
              </Link>
              <a
                href="https://wa.me/254723037650"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg">
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
