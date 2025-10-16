'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { createBackup, getBackups, restoreBackup, uploadBackup, deleteBackup } from '@/lib/api';
import { type BackupFile } from '@/lib/types';
import { Download, RefreshCw, Loader2, Server, History, Upload, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function BackupPage() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const backupFiles = await getBackups();
      setBackups(backupFiles);
    } catch (error: any) {
      toast({
        title: 'Error Fetching Backups',
        description: error.message || 'Could not load backup files.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const result = await createBackup();
      if (result.success) {
        toast({
          title: 'Backup Successful',
          description: `Backup file '${result.filename}' created.`,
        });
        await fetchBackups(); // Refresh the list
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Backup Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (filename: string) => {
    setIsRestoring(filename);
    try {
      const result = await restoreBackup(filename);
      if (result.success) {
        toast({
          title: 'Restore Successful',
          description: 'Database has been restored. You may need to refresh the page or restart the app to see changes.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Restore Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(null);
    }
  };
  
  const handleDelete = async (filename: string) => {
    setIsDeleting(filename);
    try {
      const result = await deleteBackup(filename);
      if (result.success) {
        toast({
          title: 'Delete Successful',
          description: `Backup file '${filename}' has been deleted.`,
        });
        await fetchBackups(); // Refresh the list
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
        toast({
            title: 'Invalid File Type',
            description: 'Only .db backup files can be uploaded.',
            variant: 'destructive',
        });
        return;
    }

    setIsUploading(true);
    try {
        const result = await uploadBackup(file);
        if (result.success) {
            toast({
                title: 'Upload Successful',
                description: `Backup '${result.filename}' has been uploaded.`,
            });
            await fetchBackups(); // Refresh the list
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({
            title: 'Upload Failed',
            description: error.message || 'An unknown error occurred during upload.',
            variant: 'destructive',
        });
    } finally {
        setIsUploading(false);
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const anyActionInProgress = isLoading || isCreating || isUploading || !!isRestoring || !!isDeleting;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Backup & Restore</h1>
          <div className='flex gap-2 justify-end'>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".db"
              />
               <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className='md:hidden' onClick={fetchBackups} disabled={anyActionInProgress}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh List</TooltipContent>
                </Tooltip>
                 <Button variant="outline" className='hidden md:flex' onClick={fetchBackups} disabled={anyActionInProgress}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>

                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button onClick={handleUploadClick} size="icon" variant="outline" className='md:hidden' disabled={anyActionInProgress}>
                           {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload Backup</TooltipContent>
                </Tooltip>
                 <Button onClick={handleUploadClick} variant="outline" className='hidden md:flex' disabled={anyActionInProgress}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Backup
                </Button>

                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button onClick={handleCreateBackup} size="icon" className='md:hidden' disabled={anyActionInProgress}>
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create Backup</TooltipContent>
                </Tooltip>
                 <Button onClick={handleCreateBackup} className='hidden md:flex' disabled={anyActionInProgress}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Server className="mr-2 h-4 w-4" />}
                    Create New Backup
                </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Backups</CardTitle>
            <CardDescription>
              Here you can create, restore, download, upload, or delete a manual backup of your database. Backups are stored on the server in the `backups` directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Table for larger screens */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Backup File</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>File Size</TableHead>
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
                ) : backups.length > 0 ? (
                  backups.map((backup) => (
                    <TableRow key={backup.name}>
                      <TableCell className="font-mono">{backup.name}</TableCell>
                      <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{formatFileSize(backup.size)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="sm" disabled={anyActionInProgress}>
                            <Link href={`/api/backups/download/${backup.name}`} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Link>
                        </Button>
                        <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" disabled={anyActionInProgress}>
                                      {isRestoring === backup.name ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                          <History className="mr-2 h-4 w-4" />
                                      )}
                                      Restore
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action will permanently overwrite the current database with the backup from <span className='font-bold'>{new Date(backup.createdAt).toLocaleString()}</span>. This cannot be undone.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRestore(backup.name)}>
                                      Yes, restore this backup
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={anyActionInProgress}>
                                      {isDeleting === backup.name ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                          <Trash2 className="mr-2 h-4 w-4" />
                                      )}
                                      Delete
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Are you sure you want to permanently delete the backup file <span className='font-bold font-mono'>{backup.name}</span>? This action cannot be undone.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(backup.name)}>
                                      Yes, delete this backup
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No backups found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Card layout for smaller screens */}
            <div className='md:hidden space-y-4'>
                {isLoading ? (
                     <div className="h-24 flex items-center justify-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : backups.length > 0 ? (
                    backups.map(backup => (
                        <Card key={backup.name} className="bg-muted/30">
                            <CardContent className="p-4 space-y-4">
                                <div className="font-mono text-sm break-all">{backup.name}</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p><strong>Date:</strong> {new Date(backup.createdAt).toLocaleString()}</p>
                                    <p><strong>Size:</strong> {formatFileSize(backup.size)}</p>
                                </div>
                                <Separator />
                                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                                     <Button asChild variant="outline" size="sm" className="w-full" disabled={anyActionInProgress}>
                                        <Link href={`/api/backups/download/${backup.name}`} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full" disabled={anyActionInProgress}>
                                                {isRestoring === backup.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
                                                Restore
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action will permanently overwrite the current database with this backup. This cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRestore(backup.name)}>Yes, restore</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" className="w-full col-span-2 sm:col-span-1" disabled={anyActionInProgress}>
                                                {isDeleting === backup.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                <AlertDialogDescription>Are you sure you want to permanently delete this backup? This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(backup.name)}>Yes, delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="h-24 text-center flex items-center justify-center">
                        <p>No backups found. Create one to get started.</p>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

    