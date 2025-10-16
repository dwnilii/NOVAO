import { getOrders, getUsers } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wifi, ShoppingCart, Server } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User, Order } from "@/lib/types";

export default async function AdminDashboardPage() {
  const users: User[] = await getUsers();
  const orders: Order[] = await getOrders();

  const totalUsers = users.length;
  const activeSubscriptions = users.filter(u => u.subscription === 'active').length;
  const totalOrders = orders.length;

  const stats = [
    { title: "Total Users", value: totalUsers, icon: Users },
    { title: "Active Subscriptions", value: activeSubscriptions, icon: Wifi },
    { title: "Total Orders", value: totalOrders, icon: ShoppingCart },
    { title: "Server Status", value: 'Online', icon: Server },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Server Status' && (
                <div className="text-xs text-muted-foreground flex items-center">
                   <span className={cn(
                       "flex h-2 w-2 rounded-full mr-2",
                       stat.value === 'Online' ? 'bg-green-500' : 'bg-red-500'
                   )}></span>
                    {stat.value === 'Online' ? 'All systems normal' : 'Service degradation'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client ID (UUID)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{user.uuid}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
