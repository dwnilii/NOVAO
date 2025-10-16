'use client';

import { useState, useEffect } from 'react';
import type { Feature } from '@/lib/types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getFeatures, addFeature, updateFeature, deleteFeature } from '@/lib/api';
import { Textarea } from './ui/textarea';

export function FeaturesSettings() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Partial<Feature>>({});
  const { toast } = useToast();

  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      const fetchedFeatures = await getFeatures();
      setFeatures(fetchedFeatures);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch features.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [toast]);

  const handleOpenDialog = (feature?: Feature) => {
    if (feature) {
      setSelectedFeature(feature);
      setIsEditing(true);
    } else {
      setSelectedFeature({
        icon: 'Star',
        title: '',
        description: '',
        sortOrder: features.length > 0 ? Math.max(...features.map(f => f.sortOrder)) + 1 : 1,
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      if (isEditing) {
        await updateFeature(selectedFeature as Feature);
        toast({ title: "Success", description: "Feature updated successfully." });
      } else {
        await addFeature(selectedFeature as Omit<Feature, 'id'>);
        toast({ title: "Success", description: "New feature added." });
      }
      setIsDialogOpen(false);
      fetchFeatures(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to save feature.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFeature(id);
      toast({ title: "Success", description: "Feature deleted." });
      fetchFeatures(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete feature.", variant: "destructive" });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Features Section</CardTitle>
            <CardDescription>Manage the features displayed on the landing page.</CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell className="font-mono text-xs">{feature.icon}</TableCell>
                <TableCell className="font-medium">{feature.title}</TableCell>
                <TableCell className="text-muted-foreground">{feature.description}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(feature)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={async () => await handleDelete(feature.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Feature' : 'Add New Feature'}</DialogTitle>
            <DialogDescription>Fill in the details for the feature item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Icon Name</Label>
              <Input
                id="icon"
                value={selectedFeature.icon || ''}
                onChange={(e) => setSelectedFeature({ ...selectedFeature, icon: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Zap, ShieldCheck"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={selectedFeature.title || ''}
                onChange={(e) => setSelectedFeature({ ...selectedFeature, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={selectedFeature.description || ''}
                onChange={(e) => setSelectedFeature({ ...selectedFeature, description: e.target.value })}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sortOrder" className="text-right">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={selectedFeature.sortOrder || 0}
                onChange={(e) => setSelectedFeature({ ...selectedFeature, sortOrder: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
