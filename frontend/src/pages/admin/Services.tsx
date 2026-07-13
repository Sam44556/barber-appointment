import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { services as initialServices } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { Service } from '@/types';

const AdminServices = () => {
  const [servicesList, setServicesList] = useState<Service[]>(initialServices);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editService, setEditService] = useState<Partial<Service>>({});

  const handleSave = () => {
    if (!editService.name) return;
    if (editService.id) {
      setServicesList((prev) => prev.map((s) => (s.id === editService.id ? { ...s, ...editService } as Service : s)));
    } else {
      setServicesList((prev) => [...prev, { ...editService, id: String(Date.now()) } as Service]);
    }
    setPanelOpen(false);
    setEditService({});
  };

  const handleDelete = (id: string) => {
    setServicesList((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Services</h1>
        <Button onClick={() => { setEditService({}); setPanelOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {servicesList.map((service) => (
            <motion.div key={service.id} variants={FADE_UP} exit={{ height: 0, opacity: 0 }} layout>
              <Card className={deleteConfirm === service.id ? 'border-dashed border-foreground' : ''}>
                <CardContent className="p-6">
                  {deleteConfirm === service.id ? (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <p className="text-sm font-medium">Are you sure?</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDelete(service.id)}>Delete</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditService(service); setPanelOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(service.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
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

      {/* Slide-in panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl">{editService.id ? 'Edit Service' : 'Add Service'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setPanelOpen(false)}><X className="h-4 w-4" /></Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editService.name || ''} onChange={(e) => setEditService({ ...editService, name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={editService.description || ''} onChange={(e) => setEditService({ ...editService, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (min)</Label>
                    <Input type="number" value={editService.duration || ''} onChange={(e) => setEditService({ ...editService, duration: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Price ($)</Label>
                    <Input type="number" value={editService.price || ''} onChange={(e) => setEditService({ ...editService, price: Number(e.target.value) })} />
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleSave}>Save Service</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
