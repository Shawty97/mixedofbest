import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  GraduationCap, 
  BookOpen, 
  Home, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  Utensils, 
  Hotel, 
  Car, 
  Wrench, 
  Scale, 
  FileText, 
  Users, 
  UserPlus,
  Clock,
  Shield,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  TrendingUp,
  Building,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface GeneralTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  useCase: string;
  compliance: string[];
  estimatedSetupTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface GeneralTemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
}

const GeneralTemplates: React.FC<GeneralTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const generalTemplates: GeneralTemplate[] = [
    // E-Commerce & Retail
    {
      id: 'ecommerce-customer-service',
      name: 'E-Commerce Kundenservice',
      description: 'Intelligenter Kundenservice für Online-Shops',
      category: 'E-Commerce & Retail',
      icon: <ShoppingCart className="h-6 w-6" />,
      features: [
        'Produktberatung und Empfehlungen',
        'Bestellstatus und Tracking',
        'Rückgabe- und Umtauschprozess',
        'Zahlungsprobleme lösen',
        'Größen- und Passformberatung',
        'Mehrsprachiger Support'
      ],
      useCase: 'Reduziere Supportkosten und verbessere Kundenzufriedenheit',
      compliance: ['DSGVO', 'PCI DSS', 'Verbraucherschutz'],
      estimatedSetupTime: '3-4 Stunden',
      difficulty: 'Beginner'
    },
    {
      id: 'order-tracking-assistant',
      name: 'Bestellverfolgung Assistant',
      description: 'Automatisierte Bestellverfolgung und Updates',
      category: 'E-Commerce & Retail',
      icon: <Package className="h-6 w-6" />,
      features: [
        'Echtzeit-Bestellstatus',
        'Lieferbenachrichtigungen',
        'Versandpartner-Integration',
        'Lieferprobleme melden',
        'Zustelloptionen ändern',
        'Proaktive Updates'
      ],
      useCase: 'Automatisiere Kundenanfragen zur Bestellverfolgung',
      compliance: ['DSGVO', 'Datenschutz'],
      estimatedSetupTime: '2-3 Stunden',
      difficulty: 'Beginner'
    },

    // Bildung & Training
    {
      id: 'learning-assistant',
      name: 'Lernassistent',
      description: 'Personalisierter AI-Tutor für Bildungseinrichtungen',
      category: 'Bildung & Training',
      icon: <GraduationCap className="h-6 w-6" />,
      features: [
        'Personalisierte Lernpfade',
        'Fortschrittsverfolgung',
        'Interaktive Quizzes',
        'Hausaufgabenhilfe',
        'Lernmaterialempfehlungen',
        'Mehrsprachige Unterstützung'
      ],
      useCase: 'Verbessere Lernergebnisse durch personalisierte Betreuung',
      compliance: ['DSGVO', 'Bildungsdatenschutz', 'COPPA'],
      estimatedSetupTime: '5-6 Stunden',
      difficulty: 'Advanced'
    },
    {
      id: 'course-management',
      name: 'Kursverwaltung Assistant',
      description: 'Automatisierte Kursverwaltung und Studentenbetreuung',
      category: 'Bildung & Training',
      icon: <BookOpen className="h-6 w-6" />,
      features: [
        'Kursanmeldungen verwalten',
        'Terminplanung und Erinnerungen',
        'Bewertungen und Feedback',
        'Zertifikatsverwaltung',
        'Dozentenkommunikation',
        'Lernressourcen bereitstellen'
      ],
      useCase: 'Streamline Kursverwaltung und Studentenkommunikation',
      compliance: ['DSGVO', 'Bildungsdatenschutz'],
      estimatedSetupTime: '4-5 Stunden',
      difficulty: 'Intermediate'
    },

    // Immobilien
    {
      id: 'property-advisor',
      name: 'Immobilienberater',
      description: 'Intelligente Immobilienberatung und Objektsuche',
      category: 'Immobilien',
      icon: <Home className="h-6 w-6" />,
      features: [
        'Objektsuche nach Kriterien',
        'Marktanalyse und Preisbewertung',
        'Finanzierungsberatung',
        'Besichtigungstermine',
        'Dokumentenverwaltung',
        'Nachbarschaftsinformationen'
      ],
      useCase: 'Automatisiere Erstberatung und Objektvorauswahl',
      compliance: ['DSGVO', 'Maklerrecht', 'Finanzaufsicht'],
      estimatedSetupTime: '6-7 Stunden',
      difficulty: 'Advanced'
    },
    {
      id: 'appointment-scheduler-real-estate',
      name: 'Besichtigungsplaner',
      description: 'Automatisierte Terminplanung für Immobilienbesichtigungen',
      category: 'Immobilien',
      icon: <MapPin className="h-6 w-6" />,
      features: [
        'Intelligente Terminplanung',
        'Kalenderintegration',
        'Automatische Erinnerungen',
        'Routenoptimierung',
        'Kundenpräferenzen berücksichtigen',
        'Absagen und Umplanungen'
      ],
      useCase: 'Optimiere Besichtigungstermine und reduziere No-Shows',
      compliance: ['DSGVO', 'Terminplanungsrecht'],
      estimatedSetupTime: '3-4 Stunden',
      difficulty: 'Intermediate'
    },

    // Finanzdienstleistungen
    {
      id: 'financial-advisor',
      name: 'Finanzberater Assistant',
      description: 'Automatisierte Finanzberatung und Produktempfehlungen',
      category: 'Finanzdienstleistungen',
      icon: <DollarSign className="h-6 w-6" />,
      features: [
        'Risikoanalyse und Profiling',
        'Produktempfehlungen',
        'Portfolioanalyse',
        'Marktinformationen',
        'Compliance-Checks',
        'Dokumentenerstellung'
      ],
      useCase: 'Skaliere Finanzberatung und verbessere Kundenerfahrung',
      compliance: ['MiFID II', 'BaFin', 'DSGVO', 'WpHG'],
      estimatedSetupTime: '8-10 Stunden',
      difficulty: 'Advanced'
    },
    {
      id: 'banking-support',
      name: 'Banking Support Agent',
      description: 'Umfassender Kundenservice für Bankdienstleistungen',
      category: 'Finanzdienstleistungen',
      icon: <CreditCard className="h-6 w-6" />,
      features: [
        'Kontoinformationen abrufen',
        'Transaktionshistorie',
        'Kartensperrung und -entsperrung',
        'Überweisungen initiieren',
        'Kreditanfragen bearbeiten',
        'Sicherheitsprüfungen'
      ],
      useCase: 'Reduziere Wartezeiten und automatisiere Standardanfragen',
      compliance: ['PCI DSS', 'BaFin', 'DSGVO', 'Bankgeheimnis'],
      estimatedSetupTime: '7-9 Stunden',
      difficulty: 'Advanced'
    },

    // Gastronomie & Hospitality
    {
      id: 'restaurant-reservations',
      name: 'Restaurant Reservierungen',
      description: 'Intelligentes Reservierungssystem für Restaurants',
      category: 'Gastronomie & Hospitality',
      icon: <Utensils className="h-6 w-6" />,
      features: [
        'Tischreservierungen verwalten',
        'Wartelisten-Management',
        'Menüempfehlungen',
        'Allergien und Diäten berücksichtigen',
        'Eventplanung',
        'Kundenpräferenzen speichern'
      ],
      useCase: 'Optimiere Tischauslastung und Kundenerfahrung',
      compliance: ['DSGVO', 'Lebensmittelhygiene', 'Gaststättenrecht'],
      estimatedSetupTime: '4-5 Stunden',
      difficulty: 'Intermediate'
    },
    {
      id: 'hotel-concierge',
      name: 'Hotel Concierge Service',
      description: '24/7 digitaler Concierge für Hotels',
      category: 'Gastronomie & Hospitality',
      icon: <Hotel className="h-6 w-6" />,
      features: [
        'Zimmerservice-Bestellungen',
        'Lokale Empfehlungen',
        'Transport-Organisation',
        'Event-Tickets buchen',
        'Housekeeping-Anfragen',
        'Check-in/Check-out Unterstützung'
      ],
      useCase: 'Verbessere Gästeerfahrung und reduziere Personalkosten',
      compliance: ['DSGVO', 'Hotelrecht', 'Tourismusrecht'],
      estimatedSetupTime: '5-6 Stunden',
      difficulty: 'Intermediate'
    },

    // Automotive
    {
      id: 'automotive-service',
      name: 'Kfz-Service Assistent',
      description: 'Automatisierte Terminplanung und Serviceberatung',
      category: 'Automotive',
      icon: <Car className="h-6 w-6" />,
      features: [
        'Service-Terminplanung',
        'Wartungsempfehlungen',
        'Kostenvoranschläge',
        'Ersatzteilbestellung',
        'Fahrzeughistorie verwalten',
        'Garantie-Informationen'
      ],
      useCase: 'Streamline Werkstatttermine und Kundenbetreuung',
      compliance: ['DSGVO', 'Kfz-Recht', 'Verbraucherschutz'],
      estimatedSetupTime: '4-5 Stunden',
      difficulty: 'Intermediate'
    },
    {
      id: 'car-sales-advisor',
      name: 'Autoverkauf Berater',
      description: 'Intelligente Fahrzeugberatung und Verkaufsunterstützung',
      category: 'Automotive',
      icon: <Wrench className="h-6 w-6" />,
      features: [
        'Fahrzeugempfehlungen',
        'Finanzierungsoptionen',
        'Probefahrt-Termine',
        'Inzahlungnahme-Bewertung',
        'Versicherungsberatung',
        'Zulassungsservice'
      ],
      useCase: 'Qualifiziere Leads und unterstütze Verkaufsprozess',
      compliance: ['DSGVO', 'Verbraucherschutz', 'Kfz-Handel'],
      estimatedSetupTime: '6-7 Stunden',
      difficulty: 'Advanced'
    },

    // Legal Services
    {
      id: 'legal-consultation',
      name: 'Rechtsberatung Erstberatung',
      description: 'Automatisierte Erstberatung und Falleinschätzung',
      category: 'Legal Services',
      icon: <Scale className="h-6 w-6" />,
      features: [
        'Rechtsgebiet-Identifikation',
        'Ersteinschätzung von Fällen',
        'Dokumentensammlung',
        'Kostenvoranschläge',
        'Anwaltsvermittlung',
        'Terminplanung'
      ],
      useCase: 'Qualifiziere Mandanten und optimiere Erstberatung',
      compliance: ['DSGVO', 'Anwaltsrecht', 'Berufsordnung', 'Mandantengeheimnis'],
      estimatedSetupTime: '7-8 Stunden',
      difficulty: 'Advanced'
    },
    {
      id: 'legal-appointment',
      name: 'Kanzlei Terminplanung',
      description: 'Intelligente Terminplanung für Anwaltskanzleien',
      category: 'Legal Services',
      icon: <FileText className="h-6 w-6" />,
      features: [
        'Anwalt-Verfügbarkeit prüfen',
        'Rechtsgebiet-spezifische Termine',
        'Dringlichkeitseinstufung',
        'Dokumentenvorbereitung',
        'Erinnerungen und Follow-ups',
        'Konfliktprüfung'
      ],
      useCase: 'Optimiere Kanzlei-Terminplanung und Mandantenkommunikation',
      compliance: ['DSGVO', 'Anwaltsrecht', 'Mandantengeheimnis'],
      estimatedSetupTime: '5-6 Stunden',
      difficulty: 'Intermediate'
    },

    // HR & Recruiting
    {
      id: 'recruitment-assistant',
      name: 'Recruiting Assistant',
      description: 'Automatisierte Bewerbervorselektion und -betreuung',
      category: 'HR & Recruiting',
      icon: <Users className="h-6 w-6" />,
      features: [
        'Bewerbervorselektion',
        'Interview-Terminplanung',
        'Skill-Assessment',
        'Referenzprüfung',
        'Onboarding-Vorbereitung',
        'Candidate Experience'
      ],
      useCase: 'Beschleunige Recruiting-Prozess und verbessere Candidate Experience',
      compliance: ['DSGVO', 'AGG', 'Arbeitsrecht', 'Datenschutz'],
      estimatedSetupTime: '6-7 Stunden',
      difficulty: 'Advanced'
    },
    {
      id: 'employee-onboarding',
      name: 'Mitarbeiter Onboarding',
      description: 'Digitaler Onboarding-Assistent für neue Mitarbeiter',
      category: 'HR & Recruiting',
      icon: <UserPlus className="h-6 w-6" />,
      features: [
        'Onboarding-Checklisten',
        'Dokumentensammlung',
        'IT-Setup Koordination',
        'Einarbeitungsplanung',
        'Buddy-System Integration',
        'Feedback-Sammlung'
      ],
      useCase: 'Standardisiere Onboarding und verbessere Mitarbeitererfahrung',
      compliance: ['DSGVO', 'Arbeitsrecht', 'Betriebsvereinbarungen'],
      estimatedSetupTime: '5-6 Stunden',
      difficulty: 'Intermediate'
    }
  ];

  const categories = ['all', ...Array.from(new Set(generalTemplates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'all' 
    ? generalTemplates 
    : generalTemplates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = async (templateId: string) => {
    setLoading(templateId);
    
    try {
      if (onSelectTemplate) {
        await onSelectTemplate(templateId);
      } else {
        // Default behavior
        const template = generalTemplates.find(t => t.id === templateId);
        toast.success(`${template?.name} Template ausgewählt`);
      }
    } catch (error) {
      toast.error('Fehler beim Auswählen des Templates. Bitte versuchen Sie es erneut.');
      console.error('Template selection error:', error);
    } finally {
      setLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Branchen-Templates</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Vorgefertigte Voice-Agent-Templates für verschiedene Branchen und Anwendungsfälle
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'Alle Templates' : category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>
              <CardDescription className="mt-3">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Hauptfunktionen:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                    {template.features.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{template.features.length - 3} weitere Funktionen
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedSetupTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {template.compliance.length} Compliance-Standards
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    <strong>Anwendungsfall:</strong> {template.useCase}
                  </p>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={loading === template.id}
                  >
                    {loading === template.id ? 'Wird eingerichtet...' : 'Template verwenden'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Notice */}
      <div className="mt-12 p-6 bg-muted rounded-lg max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Compliance & Rechtliches</h3>
            <p className="text-sm text-muted-foreground">
              Alle Templates sind mit Blick auf relevante Compliance-Anforderungen entwickelt. 
              Organisationen sind jedoch selbst dafür verantwortlich, dass ihre spezifische 
              Implementierung alle anwendbaren rechtlichen und regulatorischen Anforderungen erfüllt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTemplates;