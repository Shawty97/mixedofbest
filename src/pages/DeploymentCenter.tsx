import React from 'react';
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DeploymentCenter = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deployment Center</h1>
          <p className="text-muted-foreground">Deploy and manage your agents across different environments</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Deployment Center</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Deployment functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DeploymentCenter;