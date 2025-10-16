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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { getTrafficPacks, addTrafficPack, updateTrafficPack, deleteTrafficPack } from '@/lib/api';

const defaultPack: Partial<PricingPlan> = {
    title: '',
    price: '0',
    data: '0',
    available: true,
};

export default function AdminTrafficPage() {
  const [packs, setPacks] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PricingPlan | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingPlan>>(defaultPack);
  const { toast } = useToast();

  const fetchPacks = async () => {
    try {
        setIsLoading(true);
        const fetchedPacks = await getTrafficPacks();
        setPacks(fetchedPacks);
      } catch (error) {
        toast({ title: "Error", description: "Could not fetch traffic packs.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSavePack = async () => {
    try {
      const dataToSave = {
        ...editForm,
        price: `$${editForm.price || 0}`,
        data: `${editForm.data || 0} GB`,
        duration: 'Never Expires',
      };
      
      if (isEditDialogOpen) {
        await updateTrafficPack(dataToSave as PricingPlan);
        toast({ title: "Success", description: "Traffic pack updated." });
      } else {
        await addTrafficPack(dataToSave as Omit<PricingPlan, 'id'>);
        toast({ title: "Success", description: "New traffic pack added." });
      }

      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      fetchPacks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save traffic pack.", variant: "destructive" });
    }
  };
  
  const handleDeletePack = async (packId: string) => {
    try {
      await deleteTrafficPack(packId);
      setPacks(packs.filter((p) => p.id !== packId));
      toast({ title: "Success", description: "Traffic pack deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete traffic pack.", variant: "destructive" });
    }
  };
  
  const openEditDialog = (pack: PricingPlan) => {
    setSelectedPack(pack);
    setEditForm({
      ...pack,
      price: String(pack.price).replace('$', ''),
      data: String(pack.data).replace(' GB', ''),
    });
    setIsEditDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setSelectedPack(null);
    setEditForm(defaultPack);
    setIsAddDialogOpen(true);
  };

  const renderForm = () => (
    <div className="grid gap-4 py-4">
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">Pack Name</Label>
        <Input 
            id="title" 
            value={editForm.title || ''} 
            onChange={handleTextChange} 
            className="col-span-3" 
            placeholder="e.g., 100 GB Pack"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price</Label>
        <div className="col-span-3 flex items-center gap-2">
            <Input 
                id="price" 
                type="text"
                value={editForm.price || ''} 
                onChange={handleTextChange} 
                placeholder="2.00" 
            />
            <span className="text-muted-foreground">$</span>
        </div>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="data" className="text-right">Data Amount</Label>
         <div className="col-span-3 flex items-center gap-2">
            <Input 
                id="data"
                type="text"
                value={editForm.data || ''} 
                onChange={handleTextChange} 
                placeholder="100"
            />
            <span className="text-muted-foreground">GB</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Extra Traffic Packs</h1>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Pack
        </Button>
      </div>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Pack' : 'Add New Traffic Pack'}</DialogTitle>
            <DialogDescription>{isEditDialogOpen ? 'Update the details for this pack.' : "Fill in the details for the new traffic pack."}</DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSavePack}>Save Pack</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pack Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                     <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : packs.map((pack) => (
                <TableRow key={pack.id}>
                  <TableCell className="font-medium">{pack.title}</TableCell>
                  <TableCell>{pack.price}</TableCell>
                  <TableCell className="text-muted-foreground">{pack.data}</TableCell>
                  <TableCell className="text-muted-foreground">{pack.duration}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(pack)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={async () => await handleDeletePack(pack.id!)}
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
