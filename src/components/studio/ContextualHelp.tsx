
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export function ContextualHelp() {
  return (
    <div className="p-4 h-full">
        <Card className="bg-accent/50 border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb />
                    Contextual Help
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                    Welcome to the AI Studio! Select an agent on the left or create a new one to get started.
                </p>
                <p>
                    Use the tabs in the central panel to configure your agent's profile, capabilities, knowledge, and to test its responses.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
