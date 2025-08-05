import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Store, 
  Zap, 
  Cloud, 
  BarChart3, 
  Shield,
  Menu
} from 'lucide-react';

const navigation = [
  { name: 'Studio', href: '/studio', icon: Palette },
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Engine', href: '/engine', icon: Zap },
  { name: 'Deploy', href: '/deploy', icon: Cloud },
  { name: 'Monitor', href: '/monitor', icon: BarChart3 },
  { name: 'Access', href: '/access', icon: Shield },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-xl">AImpact</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Settings
            </Button>
            <Button size="sm">
              Account
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}