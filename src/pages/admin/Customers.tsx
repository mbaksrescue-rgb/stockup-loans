import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, MessageSquare } from 'lucide-react';

interface Customer {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  physical_address: string | null;
  business_type: string | null;
  status: string;
  total_loans: number;
  successful_repayments: number;
  created_at: string;
}

interface Interaction {
  id: string;
  interaction_type: string;
  subject: string;
  notes: string | null;
  created_at: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    physical_address: '',
    business_type: 'bar',
  });

  const [newInteraction, setNewInteraction] = useState({
    interaction_type: 'note',
    subject: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch customers');
    } else {
      setCustomers(data || []);
    }
  };

  const fetchInteractions = async (customerId: string) => {
    const { data, error } = await supabase
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch interactions');
    } else {
      setInteractions(data || []);
    }
  };

  const handleCreateCustomer = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('customers')
      .insert([newCustomer]);

    if (error) {
      toast.error('Failed to create customer');
    } else {
      toast.success('Customer created successfully');
      setShowCreateDialog(false);
      setNewCustomer({
        business_name: '',
        contact_person: '',
        phone: '',
        email: '',
        physical_address: '',
        business_type: 'bar',
      });
      fetchCustomers();
    }
    setLoading(false);
  };

  const handleCreateInteraction = async () => {
    if (!selectedCustomer) return;

    setLoading(true);
    const { error } = await supabase
      .from('customer_interactions')
      .insert([{
        customer_id: selectedCustomer.id,
        ...newInteraction,
      }]);

    if (error) {
      toast.error('Failed to create interaction');
    } else {
      toast.success('Interaction logged successfully');
      setShowInteractionDialog(false);
      setNewInteraction({
        interaction_type: 'note',
        subject: '',
        notes: '',
      });
      fetchInteractions(selectedCustomer.id);
    }
    setLoading(false);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchInteractions(customer.id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: 'default',
      inactive: 'secondary',
      blacklisted: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">CRM - Customers</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Customer
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Loans</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.business_name}</TableCell>
                  <TableCell>{customer.contact_person}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="capitalize">
                    {customer.business_type?.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>KSh {customer.total_loans.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to the CRM system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={newCustomer.business_name}
                onChange={(e) => setNewCustomer({ ...newCustomer, business_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={newCustomer.contact_person}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Physical Address</Label>
              <Input
                value={newCustomer.physical_address}
                onChange={(e) => setNewCustomer({ ...newCustomer, physical_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select
                value={newCustomer.business_type}
                onValueChange={(value) => setNewCustomer({ ...newCustomer, business_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="liquor_store">Liquor Store</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="wines_spirits">Wines & Spirits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreateCustomer} disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View and manage customer information and interactions
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Business Name</Label>
                  <p>{selectedCustomer.business_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Contact Person</Label>
                  <p>{selectedCustomer.contact_person}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone</Label>
                  <p>{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p>{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div>{getStatusBadge(selectedCustomer.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Total Loans</Label>
                  <p>KSh {selectedCustomer.total_loans.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Interactions History</h3>
                  <Button size="sm" onClick={() => setShowInteractionDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Interaction
                  </Button>
                </div>
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <Card key={interaction.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {interaction.interaction_type}
                            </Badge>
                            <h4 className="font-semibold">{interaction.subject}</h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(interaction.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        {interaction.notes && (
                          <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {interactions.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No interactions recorded yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>
              Record a customer interaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interaction Type</Label>
              <Select
                value={newInteraction.interaction_type}
                onValueChange={(value) => setNewInteraction({ ...newInteraction, interaction_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newInteraction.subject}
                onChange={(e) => setNewInteraction({ ...newInteraction, subject: e.target.value })}
                placeholder="Brief summary of interaction"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newInteraction.notes}
                onChange={(e) => setNewInteraction({ ...newInteraction, notes: e.target.value })}
                placeholder="Detailed notes about the interaction..."
                rows={4}
              />
            </div>

            <Button onClick={handleCreateInteraction} disabled={loading} className="w-full">
              {loading ? 'Logging...' : 'Log Interaction'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
