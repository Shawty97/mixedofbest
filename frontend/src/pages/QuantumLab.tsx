import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Cpu, Database, Beaker } from "lucide-react";

const QuantumLab = () => {
  const quantumJobs = [
    {
      id: "1",
      name: "Optimization Algorithm",
      status: "running",
      qubits: 16,
      progress: 45,
      estimatedTime: "12 min"
    },
    {
      id: "2",
      name: "Pattern Recognition",
      status: "completed",
      qubits: 8,
      progress: 100,
      estimatedTime: "0 min"
    },
    {
      id: "3",
      name: "Neural Network Training",
      status: "queued",
      qubits: 32,
      progress: 0,
      estimatedTime: "25 min"
    }
  ];

  const capabilities = [
    { name: "Quantum Optimization", available: true, qubits: "Up to 64" },
    { name: "Pattern Matching", available: true, qubits: "Up to 32" },
    { name: "Neural Enhancement", available: false, qubits: "Coming Soon" },
    { name: "Cryptographic Processing", available: true, qubits: "Up to 16" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quantum Lab</h1>
          <p className="text-muted-foreground">Harness quantum computing for advanced AI capabilities</p>
        </div>
        <Button>
          <Beaker className="w-4 h-4 mr-2" />
          New Quantum Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Qubits</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">of 128 available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Jobs</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 running, 2 in queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Power</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 THz</div>
            <p className="text-xs text-muted-foreground">quantum frequency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Quantum Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quantumJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{job.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={
                        job.status === 'running' ? 'default' : 
                        job.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {job.qubits} qubits
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{job.progress}%</div>
                    <div className="text-xs text-muted-foreground">{job.estimatedTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {capabilities.map((capability, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{capability.name}</h4>
                    <span className="text-sm text-muted-foreground">{capability.qubits}</span>
                  </div>
                  <Badge variant={capability.available ? 'default' : 'secondary'}>
                    {capability.available ? 'Available' : 'Coming Soon'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuantumLab;