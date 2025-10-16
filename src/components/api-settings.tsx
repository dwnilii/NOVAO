'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

export function ApiSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3x-ui API Connection</CardTitle>
        <CardDescription>
          Live data synchronization with the panel has been removed for performance and simplicity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Feature Deprecated</AlertTitle>
          <AlertDescription>
            The ability to connect directly to the 3x-ui panel API from this dashboard has been removed. User data such as traffic usage and expiry dates are now managed solely within this application's database. Please update user details manually in the "Users" section.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
