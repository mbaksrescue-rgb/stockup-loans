import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Building2, Phone, Mail, DollarSign, CheckCircle, XCircle, FileText, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Distributor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  paybill: string;
  bank_details: string;
  license_number: string;
  tax_id: string;
  address: string;
  verified: boolean;
  total_transactions: number;
  total_amount: number;
  rating: number;
}

const Distributors = () => {
  const { toast } = useToast();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    paybill: '',
    bank_details: '',
    license_number: '',
    tax_id: '',
    address: '',
  });

  useEffect(() => {
    fetchDistributors();
  }, []);

  useEffect(() => {
    filterDistributors();
  }, [searchQuery, distributors]);

  const fetchDistributors = async () => {
    try {
      // Fetch from distributors table
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to expected format
      const transformedDistributors: Distributor[] = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        contact_person: d.contact_person,
        phone: d.phone,
        email: d.email,
        paybill: d.paybill_number || '',
        bank_details: d.bank_name && d.account_number ? `${d.bank_name} - ${d.account_number}` : '',
        license_number: d.license_number || '',
        tax_id: '',
        address: d.physical_address || '',
        verified: d.status === 'active',
        total_transactions: Math.floor(Number(d.total_payments || 0) / 100000), // Estimate transactions
        total_amount: Number(d.total_payments || 0),
        rating: d.status === 'active' ? 4.5 : 3.0,
      }));

      setDistributors(transformedDistributors);
    } catch (error) {
      console.error('Error fetching distributors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load distributors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDistributors = () => {
    if (!searchQuery) {
      setFilteredDistributors(distributors);
      return;
    }

    const filtered = distributors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredDistributors(filtered);
  };

  const handleAddDistributor = async () => {
    try {
      const { error } = await supabase
        .from('distributors')
        .insert([{
          name: form.name,
          contact_person: form.contact_person,
          phone: form.phone,
          email: form.email,
          paybill_number: form.paybill,
          bank_name: form.bank_details.split('-')[0]?.trim() || '',
          account_number: form.bank_details.split('-')[1]?.trim() || '',
          license_number: form.license_number,
          physical_address: form.address,
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Distributor added successfully',
      });

      setAddDialog(false);
      resetForm();
      fetchDistributors();
    } catch (error: any) {
      console.error('Error adding distributor:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add distributor',
        variant: 'destructive',
      });
    }
  };

  const handleEditDistributor = async () => {
    try {
      if (!selectedDistributor) return;

      const { error } = await supabase
        .from('distributors')
        .update({
          name: form.name,
          contact_person: form.contact_person,
          phone: form.phone,
          email: form.email,
          paybill_number: form.paybill,
          bank_name: form.bank_details.split('-')[0]?.trim() || '',
          account_number: form.bank_details.split('-')[1]?.trim() || '',
          license_number: form.license_number,
          physical_address: form.address,
        })
        .eq('id', selectedDistributor.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Distributor updated successfully',
      });

      setEditDialog(false);
      setSelectedDistributor(null);
      resetForm();
      fetchDistributors();
    } catch (error: any) {
      console.error('Error updating distributor:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update distributor',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      paybill: '',
      bank_details: '',
      license_number: '',
      tax_id: '',
      address: '',
    });
  };

  const openEditDialog = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setForm({
      name: distributor.name,
      contact_person: distributor.contact_person,
      phone: distributor.phone,
      email: distributor.email,
      paybill: distributor.paybill,
      bank_details: distributor.bank_details,
      license_number: distributor.license_number,
      tax_id: distributor.tax_id,
      address: distributor.address,
    });
    setEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Distributor Management</h1>
          <p className="text-muted-foreground">Manage liquor distributors and suppliers</p>
        </div>
        <Button onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Distributor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Distributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {distributors.filter((d) => d.verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {distributors.reduce((sum, d) => sum + d.total_transactions, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {distributors.length > 0
                ? (distributors.reduce((sum, d) => sum + d.rating, 0) / distributors.length).toFixed(1)
                : '0.0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search distributors by name, contact, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Distributors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Paybill</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDistributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No distributors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDistributors.map((distributor) => (
                  <TableRow key={distributor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {distributor.name}
                      </div>
                    </TableCell>
                    <TableCell>{distributor.contact_person || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {distributor.phone}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{distributor.paybill}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{distributor.total_transactions}</Badge>
                    </TableCell>
                    <TableCell>
                      {distributor.verified ? (
                        <Badge className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(distributor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Distributor Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Distributor</DialogTitle>
            <DialogDescription>Enter distributor details and verification information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Distributor Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter distributor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={form.contact_person}
                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                placeholder="Enter contact person"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label>Paybill Number *</Label>
              <Input
                value={form.paybill}
                onChange={(e) => setForm({ ...form, paybill: e.target.value })}
                placeholder="Enter paybill number"
              />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input
                value={form.license_number}
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
            <div className="space-y-2">
              <Label>Tax ID</Label>
              <Input
                value={form.tax_id}
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                placeholder="Enter tax ID"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Bank Details</Label>
              <Textarea
                value={form.bank_details}
                onChange={(e) => setForm({ ...form, bank_details: e.target.value })}
                placeholder="Enter bank name, account number, etc."
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter physical address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDistributor} disabled={!form.name || !form.phone || !form.paybill}>
              <Plus className="h-4 w-4 mr-2" />
              Add Distributor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Distributor Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Distributor</DialogTitle>
            <DialogDescription>Update distributor details and verification information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Distributor Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter distributor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={form.contact_person}
                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                placeholder="Enter contact person"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label>Paybill Number *</Label>
              <Input
                value={form.paybill}
                onChange={(e) => setForm({ ...form, paybill: e.target.value })}
                placeholder="Enter paybill number"
              />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input
                value={form.license_number}
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
            <div className="space-y-2">
              <Label>Tax ID</Label>
              <Input
                value={form.tax_id}
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                placeholder="Enter tax ID"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Bank Details</Label>
              <Textarea
                value={form.bank_details}
                onChange={(e) => setForm({ ...form, bank_details: e.target.value })}
                placeholder="Enter bank name, account number, etc."
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter physical address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDistributor} disabled={!form.name || !form.phone || !form.paybill}>
              <Edit className="h-4 w-4 mr-2" />
              Update Distributor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Distributors;
