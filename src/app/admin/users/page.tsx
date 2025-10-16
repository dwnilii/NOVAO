'use client';

import { useState, useEffect } from "react";
import { type User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AddUserForm } from "@/components/add-user-form";
import { EditUserForm } from "@/components/edit-user-form";
import { ManageSubscriptionForm } from "@/components/manage-subscription-form";
import { getUsers, addUser, updateUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isManageSubOpen, setIsManageSubOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        toast({
          title: "Error fetching users",
          description: "Could not load user data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleAddUser = async (newUser: Omit<User, 'id' | 'registered' | 'usage' | 'total'>) => {
    try {
        const userWithDefaults = {
            ...newUser,
            usage: 0,
            total: 100, 
        };
        const addedUser = await addUser(userWithDefaults);
        setUsers(prevUsers => [addedUser, ...prevUsers]);
        toast({
            title: 'User Added',
            description: `${addedUser.name} has been successfully added.`,
        });
        setIsAddUserOpen(false); // Close the dialog on success
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to add user.',
            variant: 'destructive',
        });
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
        const result = await updateUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === result.id ? result : u));
        toast({
            title: 'User Updated',
            description: `${result.name}'s details have been successfully updated.`,
        });
        // Close whichever modal was open
        setIsEditUserOpen(false);
        setIsManageSubOpen(false);
        setSelectedUser(null);
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to update user.',
            variant: 'destructive',
        });
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };
  
  const openManageSubModal = (user: User) => {
    setSelectedUser(user);
    setIsManageSubOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <AddUserForm onUserAdd={handleAddUser} open={isAddUserOpen} onOpenChange={setIsAddUserOpen} />

       {selectedUser && (
        <>
          <EditUserForm
            user={selectedUser}
            onUserUpdate={handleUpdateUser}
            open={isEditUserOpen}
            onOpenChange={setIsEditUserOpen}
          />
          <ManageSubscriptionForm
            user={selectedUser}
            onUserUpdate={handleUpdateUser}
            open={isManageSubOpen}
            onOpenChange={setIsManageSubOpen}
          />
        </>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{user.password}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscription === "active"
                          ? "default"
                          : user.subscription === "inactive"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {user.subscription}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <Progress value={(user.usage / user.total) * 100} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {user.usage}GB / {user.total}GB
                      </span>
                    </div>
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
                        <DropdownMenuItem onClick={() => openEditModal(user)}>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openManageSubModal(user)}>Manage Subscription</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Disable</DropdownMenuItem>
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
