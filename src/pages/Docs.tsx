
import PageLayout from "@/components/layout/PageLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";

const Docs = () => {
  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-quantum-50 to-neural-50 dark:from-gray-900 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            Technical guides and references for the AImpact Genesis Forge ecosystem
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-medium mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#installation" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Installation
                    </a>
                  </li>
                  <li>
                    <a href="#project-structure" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Project Structure
                    </a>
                  </li>
                  <li>
                    <a href="#docker" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Docker Setup
                    </a>
                  </li>
                  <li>
                    <a href="#kubernetes" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Kubernetes Deployment
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-medium mb-3">Core Services</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#core-platform" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Core Platform
                    </a>
                  </li>
                  <li>
                    <a href="#studio" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      AImpact Studio
                    </a>
                  </li>
                  <li>
                    <a href="#agent-store" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Agent Store
                    </a>
                  </li>
                  <li>
                    <a href="#knowledge-builder" className="text-quantum-600 hover:underline dark:text-quantum-400">
                      Knowledge Auto-Builder
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-12">
            <section id="installation" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Installation</h2>
              <p className="mb-4">
                Follow these steps to set up the AImpact Genesis Forge project:
              </p>
              <CodeBlock
                language="bash"
                code={`# Clone the repository
git clone https://github.com/aiimpact/genesis-forge.git
cd genesis-forge

# Install dependencies
npm install

# Start the development server
npm run dev`}
              />
            </section>

            <section id="project-structure" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Project Structure</h2>
              <p className="mb-4">
                The AImpact Genesis Forge follows a microservice architecture with the following structure:
              </p>
              <CodeBlock
                language="text"
                code={`aiimpact-genesis-forge/
├── services/
│   ├── core-platform/       # AI Workflow Creator
│   ├── studio-backend/      # No-Code Agent Designer
│   ├── agent-store/         # Marketplace for AI Agents
│   └── knowledge-auto-builder/  # Knowledge Base Generator
├── schemas/                 # API specifications
├── .github/workflows/       # CI/CD pipelines
├── helm/                    # Kubernetes deployment charts
├── docker-compose.yml       # Local development setup
├── .env.sample              # Environment variables template
└── README.md                # Project documentation`}
              />
            </section>

            <section id="docker" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Docker Setup</h2>
              <p className="mb-4">
                To run the AImpact Genesis Forge using Docker:
              </p>
              <CodeBlock
                language="bash"
                code={`# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down`}
              />
              <p className="mt-4">
                Each service has its own Dockerfile that defines the build process and runtime environment.
              </p>
            </section>

            <section id="kubernetes" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Kubernetes Deployment</h2>
              <p className="mb-4">
                Deploy to Kubernetes using the provided Helm charts:
              </p>
              <CodeBlock
                language="bash"
                code={`# Add the AImpact Helm repository
helm repo add aiimpact https://charts.aiimpact.com

# Update repositories
helm repo update

# Install the Core Platform chart
helm install core-platform aiimpact/core-platform \
  --namespace aiimpact \
  --create-namespace \
  --values helm/core-platform/values.yaml`}
              />
            </section>

            <section id="core-platform" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Core Platform</h2>
              <p className="mb-4">
                The Core Platform is the central component of the AImpact ecosystem, providing workflow orchestration and agent management.
              </p>
              <div>
                <h3 className="text-lg font-medium mb-2">API Specification</h3>
                <CodeBlock
                  language="yaml"
                  code={`openapi: 3.0.0
info:
  title: AImpact Core Platform API
  version: 1.0.0
  description: API for workflow orchestration and agent management

paths:
  /api/v1/workflows:
    get:
      summary: List workflows
      responses:
        '200':
          description: List of workflows
    post:
      summary: Create workflow
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                promptDsl:
                  type: string
              required:
                - promptDsl
      responses:
        '201':
          description: Workflow created successfully`}
                />
              </div>
              <div className="mt-6 text-center">
                <Button>
                  View Full API Documentation
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Docs;
