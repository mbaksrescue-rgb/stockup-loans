import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Download } from "lucide-react";

interface Application {
  id: string;
  businessName: string;
  loanAmount: number;
  status: "pending" | "approved" | "rejected" | "disbursed";
  date: string;
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "APP001",
      businessName: "Nairobi Wines & Spirits",
      loanAmount: 150000,
      status: "pending",
      date: new Date().toISOString(),
    },
    {
      id: "APP002",
      businessName: "Eastlands Liquor Store",
      loanAmount: 75000,
      status: "approved",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "APP003",
      businessName: "Westgate Bar & Lounge",
      loanAmount: 200000,
      status: "disbursed",
      date: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@example.com" && password === "ChangeMe123!") {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    navigate("/");
  };

  const updateStatus = (id: string, newStatus: Application["status"]) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
    toast({
      title: "Status Updated",
      description: `Application ${id} marked as ${newStatus}`,
    });
  };

  const exportToCSV = () => {
    const csv = [
      ["ID", "Business Name", "Loan Amount", "Status", "Date"],
      ...applications.map((app) => [
        app.id,
        app.businessName,
        app.loanAmount,
        app.status,
        new Date(app.date).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Stock 24/7 Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ChangeMe123!"
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Stock 24/7 Admin</h1>
            <p className="text-sm opacity-90">Dashboard</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-primary-foreground text-primary">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-accent">
                {applications.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange">
                {applications.filter((a) => a.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {applications.filter((a) => a.status === "approved").length}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple">
                KSh{" "}
                {applications
                  .filter((a) => a.status === "disbursed")
                  .reduce((sum, a) => sum + a.loanAmount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>Manage and review applications</CardDescription>
              </div>
              <Button variant="outline" onClick={exportToCSV}>
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell>{app.businessName}</TableCell>
                    <TableCell>KSh {app.loanAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          app.status === "approved" || app.status === "disbursed"
                            ? "default"
                            : app.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(app.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateStatus(app.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(app.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === "approved" && (
                          <Button
                            size="sm"
                            variant="hero"
                            onClick={() => updateStatus(app.id, "disbursed")}
                          >
                            Disburse
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
