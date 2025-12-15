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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react';

interface Founder {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  image_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const Founders = () => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    image_url: '',
    linkedin_url: '',
    email: '',
    phone: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch founders');
      console.error(error);
    } else {
      setFounders(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (founder?: Founder) => {
    if (founder) {
      setEditingFounder(founder);
      setFormData({
        name: founder.name,
        title: founder.title,
        bio: founder.bio || '',
        image_url: founder.image_url || '',
        linkedin_url: founder.linkedin_url || '',
        email: founder.email || '',
        phone: founder.phone || '',
        display_order: founder.display_order,
        is_active: founder.is_active,
      });
    } else {
      setEditingFounder(null);
      setFormData({
        name: '',
        title: '',
        bio: '',
        image_url: '',
        linkedin_url: '',
        email: '',
        phone: '',
        display_order: founders.length,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      toast.error('Name and title are required');
      return;
    }

    setSaving(true);

    try {
      if (editingFounder) {
        const { error } = await supabase
          .from('founders')
          .update({
            name: formData.name,
            title: formData.title,
            bio: formData.bio || null,
            image_url: formData.image_url || null,
            linkedin_url: formData.linkedin_url || null,
            email: formData.email || null,
            phone: formData.phone || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', editingFounder.id);

        if (error) throw error;
        toast.success('Founder updated successfully');
      } else {
        const { error } = await supabase
          .from('founders')
          .insert({
            name: formData.name,
            title: formData.title,
            bio: formData.bio || null,
            image_url: formData.image_url || null,
            linkedin_url: formData.linkedin_url || null,
            email: formData.email || null,
            phone: formData.phone || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast.success('Founder added successfully');
      }

      setDialogOpen(false);
      fetchFounders();
    } catch (error: any) {
      toast.error('Failed to save founder: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this founder?')) return;

    const { error } = await supabase
      .from('founders')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete founder');
    } else {
      toast.success('Founder deleted');
      fetchFounders();
    }
  };

  const handleToggleActive = async (founder: Founder) => {
    const { error } = await supabase
      .from('founders')
      .update({ is_active: !founder.is_active })
      .eq('id', founder.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      fetchFounders();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Founders & Directors</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Founder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : founders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No founders added yet. Click "Add Founder" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {founders.map((founder) => (
                  <TableRow key={founder.id}>
                    <TableCell>{founder.display_order}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {founder.image_url && (
                          <img
                            src={founder.image_url}
                            alt={founder.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        {founder.name}
                      </div>
                    </TableCell>
                    <TableCell>{founder.title}</TableCell>
                    <TableCell>{founder.email || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={founder.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(founder)}
                      >
                        {founder.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(founder)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(founder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFounder ? 'Edit Founder' : 'Add Founder'}
            </DialogTitle>
            <DialogDescription>
              {editingFounder
                ? 'Update founder information'
                : 'Add a new founder or director'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="CEO & Founder"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Brief biography..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/photo.jpg or /assets/filename.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Use local paths like /assets/omar-laisa.png for bundled images, or external URLs
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin_url: e.target.value })
                }
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Active Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingFounder ? (
                  'Update'
                ) : (
                  'Add Founder'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Founders;
