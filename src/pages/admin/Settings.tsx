import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Building2, DollarSign, Mail, Bell, Shield, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const [companySettings, setCompanySettings] = useState({
    name: 'Zion Link Technologies',
    email: 'info@zionlink.com',
    phone: '+254 700 000 000',
    address: 'Nairobi, Kenya',
    logo: '',
  });

  const [loanSettings, setLoanSettings] = useState({
    defaultInterestRate: 10,
    minLoanAmount: 10000,
    maxLoanAmount: 1000000,
    defaultTermLength: 30,
    gracePeriodDays: 3,
    lateFeePercentage: 5,
    processingFeePercentage: 2,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    paymentReminders: true,
    applicationAlerts: true,
    overdueAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    require2FA: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
  });

  const handleSaveCompanySettings = () => {
    toast({
      title: 'Success',
      description: 'Company settings saved successfully',
    });
  };

  const handleSaveLoanSettings = () => {
    toast({
      title: 'Success',
      description: 'Loan policy settings saved successfully',
    });
  };

  const handleSaveNotificationSettings = () => {
    toast({
      title: 'Success',
      description: 'Notification settings saved successfully',
    });
  };

  const handleSaveSecuritySettings = () => {
    toast({
      title: 'Success',
      description: 'Security settings saved successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings & Configuration</h1>
        <p className="text-muted-foreground">Manage platform settings and policies</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="loan">Loan Policies</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Company Information</CardTitle>
              </div>
              <CardDescription>Manage your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone *</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    placeholder="Enter phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Logo URL</Label>
                  <Input
                    id="companyLogo"
                    value={companySettings.logo}
                    onChange={(e) => setCompanySettings({ ...companySettings, logo: e.target.value })}
                    placeholder="Enter logo URL"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="companyAddress">Address *</Label>
                  <Textarea
                    id="companyAddress"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                    placeholder="Enter company address"
                  />
                </div>
              </div>
              <Button onClick={handleSaveCompanySettings}>
                <Building2 className="h-4 w-4 mr-2" />
                Save Company Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Policy Settings */}
        <TabsContent value="loan">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <CardTitle>Loan Policy Settings</CardTitle>
              </div>
              <CardDescription>Configure default loan terms and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Default Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={loanSettings.defaultInterestRate}
                    onChange={(e) => setLoanSettings({ ...loanSettings, defaultInterestRate: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Applied to new loans by default</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termLength">Default Term Length (days)</Label>
                  <Input
                    id="termLength"
                    type="number"
                    value={loanSettings.defaultTermLength}
                    onChange={(e) => setLoanSettings({ ...loanSettings, defaultTermLength: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Standard loan duration</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLoan">Minimum Loan Amount (KES)</Label>
                  <Input
                    id="minLoan"
                    type="number"
                    value={loanSettings.minLoanAmount}
                    onChange={(e) => setLoanSettings({ ...loanSettings, minLoanAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoan">Maximum Loan Amount (KES)</Label>
                  <Input
                    id="maxLoan"
                    type="number"
                    value={loanSettings.maxLoanAmount}
                    onChange={(e) => setLoanSettings({ ...loanSettings, maxLoanAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={loanSettings.gracePeriodDays}
                    onChange={(e) => setLoanSettings({ ...loanSettings, gracePeriodDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Days after due date before late fees</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Fee (%)</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    value={loanSettings.lateFeePercentage}
                    onChange={(e) => setLoanSettings({ ...loanSettings, lateFeePercentage: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Penalty for overdue payments</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="processingFee">Processing Fee (%)</Label>
                  <Input
                    id="processingFee"
                    type="number"
                    value={loanSettings.processingFeePercentage}
                    onChange={(e) => setLoanSettings({ ...loanSettings, processingFeePercentage: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">One-time fee charged at disbursement</p>
                </div>
              </div>
              <Button onClick={handleSaveLoanSettings}>
                <DollarSign className="h-4 w-4 mr-2" />
                Save Loan Policies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>Configure email and SMS notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <p className="font-medium">Email Notifications</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <p className="font-medium">SMS Notifications</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Automated reminders for upcoming payments</p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentReminders}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Application Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify when new applications are submitted</p>
                  </div>
                  <Switch
                    checked={notificationSettings.applicationAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, applicationAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Overdue Alerts</p>
                    <p className="text-sm text-muted-foreground">Alert when payments become overdue</p>
                  </div>
                  <Switch
                    checked={notificationSettings.overdueAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, overdueAlerts: checked })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotificationSettings}>
                <Bell className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>Configure security and access control policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Require Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Enforce 2FA for all admin users</p>
                  </div>
                  <Switch
                    checked={securitySettings.require2FA}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, require2FA: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Force password change after this period</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Lock account after failed attempts</p>
                </div>
              </div>
              <Button onClick={handleSaveSecuritySettings}>
                <Shield className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>System Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Platform Version</p>
              <p className="font-medium">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Backup</p>
              <p className="font-medium">2 hours ago</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Database Status</p>
              <p className="font-medium text-green-600">Healthy</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="font-medium">245 MB / 10 GB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
