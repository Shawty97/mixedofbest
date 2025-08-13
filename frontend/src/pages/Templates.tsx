import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import HealthcareTemplates from '@/components/templates/HealthcareTemplates';
import GeneralTemplates from '@/components/templates/GeneralTemplates';
import { toast } from 'sonner';

const Templates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('healthcare');

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    toast.success('Template ausgewählt! Weiterleitung zum Setup...');
    // Hier würde normalerweise eine Weiterleitung zum Agent Builder erfolgen
  };

  const templateStats = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: '15+',
      subtitle: 'Healthcare Templates',
      description: 'Spezialisierte Vorlagen für Gesundheitswesen'
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: '20+',
      subtitle: 'Business Templates',
      description: 'Branchenspezifische Lösungen für Unternehmen'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: '10K+',
      subtitle: 'Aktive Nutzer',
      description: 'Vertrauen auf unsere Template-Bibliothek'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: '95%',
      subtitle: 'Erfolgsrate',
      description: 'Durchschnittliche Implementierungsrate'
    }
  ];

  const benefits = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Sofort einsatzbereit',
      description: 'Vorkonfigurierte Templates für schnelle Implementierung'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Branchenspezifisch',
      description: 'Maßgeschneiderte Lösungen für verschiedene Industrien'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Compliance-konform',
      description: 'Erfüllt alle relevanten Datenschutz- und Sicherheitsstandards'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Anpassbar',
      description: 'Vollständig konfigurierbar für individuelle Anforderungen'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-100 dark:from-purple-950 dark:to-blue-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Agent Templates
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Starten Sie mit 
              <span className="text-primary"> vorgefertigten Templates</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Nutzen Sie unsere umfangreiche Bibliothek von branchenspezifischen AI-Agent-Templates 
              für eine schnelle und effiziente Implementierung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Template auswählen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Eigenes Template erstellen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {templateStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 text-primary">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{stat.title}</h3>
                  <p className="font-semibold text-muted-foreground mb-1">{stat.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Wählen Sie Ihre Template-Kategorie</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entdecken Sie spezialisierte Templates für verschiedene Branchen und Anwendungsfälle
            </p>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="healthcare" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Healthcare
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Business
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="healthcare" className="mt-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Healthcare Templates</h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                HIPAA-konforme AI-Agenten für Gesundheitsorganisationen - von Krankenhäusern 
                bis hin zu Pflegeheimen und Apotheken.
              </p>
            </div>
            <HealthcareTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="business" className="mt-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Business Templates</h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Branchenspezifische AI-Agenten für E-Commerce, Bildung, Immobilien, 
                Finanzdienstleistungen und viele weitere Bereiche.
              </p>
            </div>
            <GeneralTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Warum unsere Templates verwenden?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sparen Sie Zeit und Ressourcen mit unseren bewährten Template-Lösungen
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {benefit.icon}
                    <div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit loszulegen?</h2>
          <p className="text-xl mb-8 opacity-90">
            Wählen Sie ein Template und starten Sie in wenigen Minuten mit Ihrem AI-Agenten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Kostenlosen Account erstellen
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Demo vereinbaren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;