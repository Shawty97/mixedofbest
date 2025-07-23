
import { useState } from 'react';
import { useAgentBuilder } from '@/hooks/use-agent-builder';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AvatarUploadModal } from '@/components/studio/AvatarUploadModal';
import { Bot, Edit } from 'lucide-react';

export default function AgentProfileTab() {
  const { selectedAgent, updateAgent } = useAgentBuilder();
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);

  if (!selectedAgent) return null;

  const handleProfileChange = (field: string, value: any) => {
    updateAgent({ profile: { ...selectedAgent.profile, [field]: value } });
  };
  
  const handlePersonalityChange = (field: string, value: any) => {
    updateAgent({ profile: { ...selectedAgent.profile, personality: { ...selectedAgent.profile.personality, [field]: value } } });
  }

  return (
    <div className="space-y-6">
       <div className="flex items-start gap-6">
        <div className="relative group">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={selectedAgent.profile.avatar} alt={selectedAgent.profile.name} />
            <AvatarFallback className="text-muted-foreground">
              <Bot className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="outline"
            className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setAvatarModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="agent-name">Agent Name</Label>
          <Input
            id="agent-name"
            value={selectedAgent.profile.name}
            onChange={(e) => handleProfileChange('name', e.target.value)}
            className="text-lg font-semibold"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-description">Description</Label>
        <Textarea
          id="agent-description"
          placeholder="What does this agent do?"
          value={selectedAgent.profile.description}
          onChange={(e) => handleProfileChange('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Tone: {selectedAgent.profile.personality.tone}</Label>
          <Select
            value={selectedAgent.profile.personality.tone}
            onValueChange={(value) => handlePersonalityChange('tone', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="informal">Informal</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Helpfulness: {selectedAgent.profile.personality.helpfulness}</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[selectedAgent.profile.personality.helpfulness]}
            onValueChange={([value]) => handlePersonalityChange('helpfulness', value)}
          />
        </div>
      </div>
      <AvatarUploadModal
        open={isAvatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSelect={(avatarUrl) => handleProfileChange('avatar', avatarUrl)}
      />
    </div>
  );
}
