'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUploadedFiles, deleteUploadedFile, deleteAllUploadedFiles } from '@/lib/api';
import { Loader2, Trash2, RefreshCw, XOctagon } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface UploadedFile {
    name: string;
    url: string;
    size: number;
    createdAt: string;
}

export default function UploadsPage() {
    const { toast } = useToast();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | 'all' | null>(null);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const uploadedFiles = await getUploadedFiles();
            setFiles(uploadedFiles);
        } catch (error: any) {
            toast({
                title: 'Error Fetching Files',
                description: error.message || 'Could not load uploaded files.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDelete = async (filename: string) => {
        setIsDeleting(filename);
        try {
            const result = await deleteUploadedFile(filename);
            if (result.success) {
                toast({
                    title: 'Delete Successful',
                    description: `File '${filename}' has been deleted.`,
                });
                await fetchFiles();
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
    
    const handleDeleteAll = async () => {
        setIsDeleting('all');
        try {
            const result = await deleteAllUploadedFiles();
            if (result.success) {
                toast({
                    title: 'All Files Deleted',
                    description: 'All uploaded receipt files have been cleared.',
                });
                await fetchFiles();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({
                title: 'Operation Failed',
                description: error.message || 'Could not delete all files.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(null);
        }
    };
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const anyActionInProgress = isLoading || !!isDeleting;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold">Uploaded Receipts</h1>
                 <div className='flex gap-2 justify-end'>
                     <Button variant="outline" onClick={fetchFiles} disabled={anyActionInProgress}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={anyActionInProgress || files.length === 0}>
                                {isDeleting === 'all' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XOctagon className="mr-2 h-4 w-4" />}
                                Delete All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently delete all uploaded receipt files from the server. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteAll}>
                                    Yes, delete all files
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>File Manager</CardTitle>
                    <CardDescription>
                        Here you can view and delete uploaded payment receipts. Files are stored in the `public/uploads` directory.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="h-48 flex items-center justify-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : files.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {files.map(file => (
                                <Card key={file.name} className="overflow-hidden group">
                                    <CardContent className="p-0">
                                        <div className="aspect-square w-full relative">
                                            <Image
                                                src={file.url}
                                                alt={`Receipt ${file.name}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <p className="text-xs font-mono break-all text-muted-foreground">{file.name}</p>
                                             <div className="text-xs text-muted-foreground/80 space-y-1">
                                                <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
                                                <p><strong>Date:</strong> {new Date(file.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" className="w-full" disabled={anyActionInProgress}>
                                                        {isDeleting === file.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                        <AlertDialogDescription>Are you sure you want to delete this file? This cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(file.name)}>
                                                            Yes, delete it
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No uploaded files found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
