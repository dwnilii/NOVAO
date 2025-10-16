'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import type { PricingPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getPricingPlans, addPricingPlan, updatePricingPlan, deletePricingPlan } from '@/lib/api';

const defaultPlan: Partial<PricingPlan> = {
  title: '',
  price: '',
  period: '/month',
  data: '',
  devices: '',
  duration: '',
  features: [],
  popular: false,
  available: true,
  showOnLanding: false,
  sortOrder: 0,
};

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingPlan>>(defaultPlan);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
        setIsLoading(true);
        const fetchedPlans = await getPricingPlans();
        setPlans(fetchedPlans);
      } catch (error) {
        toast({ title: "Error", description: "Could not fetch pricing plans.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setEditForm(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value) || 0 : value }));
  };

  const handleCheckboxChange = (id: keyof PricingPlan, checked: boolean) => {
    setEditForm(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSaveChanges = async () => {
    try {
        const dataToSave = {
            ...editForm,
            price: editForm.price ? `$${editForm.price}` : '',
            data: editForm.data ? `${editForm.data} GB` : '',
            duration: editForm.duration ? `${editForm.duration} Days` : '',
            devices: editForm.devices ? `${editForm.devices} Devices` : '',
        };

      if (isEditDialogOpen) {
        await updatePricingPlan(dataToSave as PricingPlan);
        toast({ title: "Success", description: "Plan updated successfully." });
      } else {
        await addPricingPlan(dataToSave as Omit<PricingPlan, 'id'>);
        toast({ title: "Success", description: "New plan added successfully." });
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save plan.", variant: "destructive" });
    }
  };

  const handleToggleLandingPage = async (plan: PricingPlan) => {
    try {
      const updatedPlanData = { ...plan, showOnLanding: !plan.showOnLanding };
      const updatedPlan = await updatePricingPlan(updatedPlanData);
      setPlans(plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      toast({ 
          title: "Visibility Updated",
          description: `${plan.title} is now ${updatedPlan.showOnLanding ? 'visible' : 'hidden'} on the landing page.`
      });
    } catch(e) {
      toast({ title: "Error", description: "Failed to update plan visibility.", variant: "destructive"});
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePricingPlan(planId);
      setPlans(plans.filter((p) => p.id !== planId));
      toast({ title: "Success", description: "Plan deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete plan.", variant: "destructive" });
    }
  };
  
  const openEditDialog = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setEditForm({
      ...plan,
      price: plan.price.toString().replace('$', ''),
      data: plan.data.toString().replace(' GB', ''),
      duration: plan.duration.toString().replace(' Days', ''),
      devices: plan.devices.toString().replace(' Devices', ''),
    });
    setIsEditDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setSelectedPlan(null);
    setEditForm({...defaultPlan, sortOrder: plans.length > 0 ? Math.max(...plans.map(p => p.sortOrder)) + 1 : 1 });
    setIsAddDialogOpen(true);
  };

  const renderForm = () => (
    <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Plan Name</Label>
            <Input id="title" value={editForm.title} onChange={handleTextChange} className="col-span-3" />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <div className="col-span-3 flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input id="price" type="text" value={editForm.price} onChange={handleTextChange} placeholder="10" />
                 <Input id="period" value={editForm.period} onChange={handleTextChange} placeholder="/month" />
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration</Label>
            <div className="col-span-3 flex items-center gap-2">
                <Input id="duration" type="text" value={editForm.duration} onChange={handleTextChange} placeholder="30" />
                <span className="text-muted-foreground">Days</span>
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data" className="text-right">Data/Bandwidth</Label>
            <div className="col-span-3 flex items-center gap-2">
                <Input id="data" type="text" value={editForm.data} onChange={handleTextChange} placeholder="100" />
                <span className="text-muted-foreground">GB</span>
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="devices" className="text-right">Devices/Users</Label>
             <div className="col-span-3 flex items-center gap-2">
                <Input id="devices" type="text" value={editForm.devices} onChange={handleTextChange} placeholder="3" />
                <span className="text-muted-foreground">Devices</span>
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="features" className="text-right">Features</Label>
            <Input 
                id="features" 
                value={(editForm.features || []).join(', ')} 
                onChange={(e) => setEditForm({...editForm, features: e.target.value.split(',').map(f => f.trim())})} 
                className="col-span-3" 
                placeholder="Feature 1, Feature 2"
            />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sortOrder" className="text-right">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={editForm.sortOrder}
                onChange={handleTextChange}
                className="col-span-3"
              />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2 justify-center">
                <Checkbox id="popular" checked={editForm.popular} onCheckedChange={(checked) => handleCheckboxChange('popular', !!checked)}/>
                <label htmlFor="popular" className="text-sm font-medium leading-none">Mark as Popular</label>
            </div>
            <div className="flex items-center space-x-2 justify-center">
                <Checkbox id="showOnLanding" checked={editForm.showOnLanding} onCheckedChange={(checked) => handleCheckboxChange('showOnLanding', !!checked)}/>
                <label htmlFor="showOnLanding" className="text-sm font-medium leading-none">Show on Landing Page</label>
            </div>
        </div>
    </div>
);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pricing Plan Management</h1>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Plan' : 'Add New Pricing Plan'}</DialogTitle>
            <DialogDescription>{isEditDialogOpen ? 'Update the details for this plan.' : "Fill in the details for the new plan."}</DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sort</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>On Landing</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                     <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-mono text-center">{plan.sortOrder}</TableCell>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>
                    {plan.price}
                    <span className="text-muted-foreground">{plan.period}</span>
                  </TableCell>
                  <TableCell>{plan.data}</TableCell>
                  <TableCell>
                      <Switch
                        checked={plan.showOnLanding}
                        onCheckedChange={() => handleToggleLandingPage(plan)}
                        aria-label="Show on landing page"
                      />
                  </TableCell>
                  <TableCell>
                    {plan.popular ? (
                       <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-2 h-4 w-4" />
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={async () => await handleDeletePlan(plan.id!)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
