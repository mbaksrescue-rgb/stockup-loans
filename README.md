# Stock 24/7 - Instant Liquor Business Loans

A Progressive Web App (PWA) for Zion Links Technologies providing instant short-term loans to liquor businesses in Kenya.

## 🚀 Features

- **Instant Loan Applications**: Multi-step form with validation
- **Loan Range**: KSh 5,000 - 300,000
- **Interest Rate**: 10% flat
- **Duration**: 7 days
- **Disbursement**: Direct to supplier till/paybill via M-PESA
- **Admin Dashboard**: Manage applications with authentication
- **Market Page**: Showcase additional products and services
- **PWA Support**: Installable, offline-capable, mobile-first

## 📱 Pages

1. **Home**: Hero section with quick stats and CTAs
2. **How It Works**: 4-step process explanation
3. **Market**: Product/service cards for business ecosystem
4. **Apply**: Multi-step application form with validation
5. **Disbursement**: Transaction confirmation and repayment info
6. **FAQs**: Comprehensive Q&A about loans
7. **Contact**: Contact form and company information
8. **Terms & Privacy**: Legal documentation
9. **Admin**: Dashboard for managing applications

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **PWA**: Vite PWA plugin with service worker
- **Build**: Vite
- **State Management**: React Query

## 🎨 Design System

### Colors (HSL)
- **Primary**: Deep blue (220, 70%, 25%)
- **Accent**: Teal (180, 70%, 45%)
- **Orange**: (25, 85%, 55%)
- **Purple**: (270, 60%, 55%)
- **Success**: Green (145, 70%, 45%)

### Gradients
- Hero gradient: Primary blue to lighter blue
- Card gradients: Teal, orange, purple variations

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd stock247

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📦 Deployment

### Static Hosting (Vercel/Netlify)
1. Connect your Git repository
2. Build command: `npm run build`
3. Output directory: `dist`

### PWA Installation
- Visit the deployed site on mobile
- Tap browser menu → "Add to Home Screen"
- App installs and works offline

## 🔐 Admin Access

**Default Credentials** (CHANGE IN PRODUCTION):
- Email: `admin@example.com`
- Password: `ChangeMe123!`

**Admin Features**:
- View all applications
- Approve/reject applications
- Mark as disbursed
- Export to CSV

## 💳 M-PESA Integration

### Disbursement
The app simulates direct-to-distributor payments. To integrate real M-PESA:

1. **Get Credentials**: Register for M-PESA API (Safaricom Daraja)
2. **Backend API**: Create endpoint to handle disbursements
3. **API Call**: Use B2B or B2C API depending on distributor account type

```typescript
// Example endpoint structure
POST /api/disburse
{
  "amount": 50000,
  "phoneNumber": "254712345678", // Distributor till/paybill
  "accountReference": "APP001",
  "transactionDesc": "Stock 24/7 Loan Disbursement"
}
```

4. **Webhook**: Set up callback URL for transaction status updates
5. **Environment Variables**: Store credentials in `.env` (never commit!)

### Repayment
Similar setup for collecting payments via M-PESA paybill.

## 📧 SMS/WhatsApp Notifications

### Integration Points
1. **Application Approval**: Send confirmation message
2. **Disbursement Confirmation**: Transaction receipt
3. **Payment Reminder**: 24 hours before due date
4. **Due Date Reminder**: On repayment due date

### Recommended Services
- **Africa's Talking**: SMS + WhatsApp API for Africa
- **Twilio**: Global SMS/WhatsApp service

```typescript
// Example notification endpoint
POST /api/send-notification
{
  "phone": "+254712345678",
  "message": "Your Stock 24/7 loan of KSh 50,000 has been disbursed...",
  "channel": "sms" // or "whatsapp"
}
```

## 🔒 Security Considerations

### Required for Production
1. **HTTPS**: Enable SSL certificate
2. **Input Validation**: All forms validated client & server-side
3. **Rate Limiting**: Prevent abuse of application endpoints
4. **Authentication**: JWT tokens for admin, secure session management
5. **Data Encryption**: Encrypt sensitive data at rest and in transit
6. **KYC/AML Compliance**: Verify business registration, owner identity
7. **Credit Bureau Integration**: Check creditworthiness
8. **Fraud Detection**: Monitor for suspicious patterns

### Environment Variables
```env
VITE_API_URL=https://api.yourdomain.com
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=your_shortcode
SMS_API_KEY=your_sms_key
```

## 📊 Testing

### Acceptance Criteria Checklist
- [x] All pages render on mobile and desktop
- [x] PWA install prompt works
- [x] Apply flow validates eligibility (≥2 years, loan range)
- [x] Application submission shows decision
- [x] Admin can view/export applications
- [x] Contact info correct (+254 723 037650, +254 112 876759)
- [x] WhatsApp link functional
- [x] Address displayed (Kimson Plaza, Eastern Bypass, 2nd Floor)

### Manual Testing
1. **Application Flow**: Fill form, test validation
2. **Admin Dashboard**: Login, approve applications
3. **Responsive Design**: Test on various screen sizes
4. **PWA Install**: Test on mobile device
5. **Navigation**: All links work correctly

## 📝 License

Copyright © 2025 Zion Links Technologies. All rights reserved.

## 📞 Contact

**Zion Links Technologies**
- Phone: +254 723 037650 / +254 112 876759
- Email: support@zionlinks.example
- Location: Kimson Plaza, Eastern Bypass, 2nd Floor
- WhatsApp: +254 723 037650

## 🤝 Contributing

This is a proprietary project for Zion Links Technologies. For partnership inquiries, contact us through the channels above.
