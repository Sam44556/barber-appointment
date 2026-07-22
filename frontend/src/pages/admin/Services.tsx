import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Service } from '@/types';

const AdminServices = () => {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editService, setEditService] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getServices();
      setServicesList(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editService.name || !editService.duration || !editService.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editService.id) {
        // Update existing service
        const updatedService = await apiService.updateService(editService.id, {
          name: editService.name,
          description: editService.description || '',
          duration: editService.duration,
          price: editService.price,
        });
        
        setServicesList((prev) => 
          prev.map((s) => (s.id === editService.id ? updatedService : s))
        );
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const newService = await apiService.createService({
          name: editService.name,
          description: editService.description || '',
          duration: editService.duration,
          price: editService.price,
        });
        
        setServicesList((prev) => [...prev, newService]);
        toast.success('Service created successfully');
      }
      
      setPanelOpen(false);
      setEditService({});
    } catch (error: any) {
      console.error('Failed to save service:', error);
      toast.error(error.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiService.deleteService(id);
      setServicesList((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      toast.success('Service deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete service:', error);
      toast.error(error.message || 'Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const openAddPanel = () => {
    setEditService({
      name: '',
      description: '',
      duration: 30,
      price: 25,
      isActive: true,
    });
    setPanelOpen(true);
  };

  const openEditPanel = (service: Service) => {
    setEditService(service);
    setPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Services</h1>
          <p className="text-sm text-muted-foreground">Manage your barbershop services</p>
        </div>
        <Button onClick={openAddPanel} className="gap-2">
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      {servicesList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <p className="mb-4">No services found</p>
              <Button onClick={openAddPanel} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Add your first service
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {servicesList.map((service) => (
              <motion.div key={service.id} variants={FADE_UP} exit={{ height: 0, opacity: 0 }} layout>
                <Card className={`${deleteConfirm === service.id ? 'border-dashed border-red-300' : ''} ${!service.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    {deleteConfirm === service.id ? (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <p className="text-sm font-medium">Delete "{service.name}"?</p>
                        <p className="text-xs text-muted-foreground text-center">This action cannot be undone.</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(service.id)}
                            disabled={deleting}
                          >
                            {deleting ? 'Deleting...' : 'Delete'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-bold">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                            )}
                            {!service.isActive && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => openEditPanel(service)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700" 
                              onClick={() => setDeleteConfirm(service.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <span className="font-mono text-sm text-muted-foreground">{service.duration} min</span>
                          <span className="font-display text-lg font-bold">${service.price}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Slide-in panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40"
              onClick={() => !saving && setPanelOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl">
                  {editService.id ? 'Edit Service' : 'Add Service'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setPanelOpen(false)}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={editService.name || ''}
                    onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                    placeholder="e.g., Classic Haircut"
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editService.description || ''}
                    onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                    placeholder="Brief description of the service..."
                    rows={3}
                    disabled={saving}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (min) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      max="180"
                      value={editService.duration || ''}
                      onChange={(e) => setEditService({ ...editService, duration: Number(e.target.value) })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editService.price || ''}
                      onChange={(e) => setEditService({ ...editService, price: Number(e.target.value) })}
                      disabled={saving}
                    />
                  </div>
                </div>

                {editService.id && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editService.isActive !== false}
                      onChange={(e) => setEditService({ ...editService, isActive: e.target.checked })}
                      disabled={saving}
                    />
                    <Label htmlFor="isActive" className="text-sm">Active (visible to customers)</Label>
                  </div>
                )}

                <Button 
                  className="w-full mt-6" 
                  onClick={handleSave}
                  disabled={saving || !editService.name || !editService.duration || !editService.price}
                >
                  {saving ? 'Saving...' : editService.id ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
