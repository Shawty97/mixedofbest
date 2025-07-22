
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODELS } from "../constants/voice-agent-options";
import { AdvancedSettingsProps } from "../types/voice-agent-creator";

export function AdvancedSettings({
  apiKeyInput,
  setApiKeyInput,
  selectedModel,
  setSelectedModel
}: AdvancedSettingsProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">ElevenLabs API Key</Label>
        <Input 
          id="api-key" 
          type="password" 
          placeholder="Enter your API key" 
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Required for voice synthesis. Get your key from ElevenLabs.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model-select">Voice Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger id="model-select">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div>
                  <div>{model.name}</div>
                  <div className="text-xs text-gray-500">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="live-learning"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="live-learning">Enable Live Learning</Label>
        </div>
        <p className="text-xs text-gray-500">
          Allow your agent to learn from conversations and improve over time.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="multimodal"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="multimodal">Enable Multimodal Input</Label>
        </div>
        <p className="text-xs text-gray-500">
          Allow your agent to process images and other media types.
        </p>
      </div>
    </div>
  );
}
