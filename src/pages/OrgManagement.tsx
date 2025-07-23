import React from 'react';
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrgManagement = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">Manage your organization settings and team members</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Organization management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default OrgManagement;