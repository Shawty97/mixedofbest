
import { Link } from "react-router-dom";
import { Github, Cpu, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <span className="h-8 w-8 bg-gradient-to-r from-quantum-600 to-neural-600 rounded-md flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">A</span>
              </span>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-quantum-600 to-neural-600">
                AImpact Genesis Forge
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Building the next generation of AI and quantum computing ecosystems.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-quantum-500">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-quantum-500">
                <Cpu className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-quantum-500">
                <Terminal className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/core-platform" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  Core Platform
                </Link>
              </li>
              <li>
                <Link to="/studio" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  AImpact Studio
                </Link>
              </li>
              <li>
                <Link to="/agent-store" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  Agent Store
                </Link>
              </li>
              <li>
                <Link to="/knowledge-builder" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  Knowledge Auto-Builder
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/specs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  API Specifications
                </Link>
              </li>
              <li>
                <Link to="/ci-cd" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  CI/CD Pipeline
                </Link>
              </li>
              <li>
                <Link to="/helm" className="text-sm text-gray-600 dark:text-gray-400 hover:text-quantum-500 dark:hover:text-quantum-400">
                  Helm Charts
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            &copy; {new Date().getFullYear()} AImpact Genesis Forge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
