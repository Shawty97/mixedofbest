
import { CodeBlock } from "@/components/ui/code-block";

export function TechnicalDocs() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Technical Documentation</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Core Platform API Endpoints</h3>
          <CodeBlock
            language="yaml"
            code={`# Core Platform API Endpoints

GET /api/v1/workflows
  - List all workflows
  - Supports filtering and pagination

POST /api/v1/workflows
  - Create a new workflow
  - Requires prompt DSL in request body

GET /api/v1/workflows/{id}
  - Get workflow details by ID
  - Includes execution history

PUT /api/v1/workflows/{id}
  - Update an existing workflow

DELETE /api/v1/workflows/{id}
  - Delete a workflow

POST /api/v1/workflows/{id}/execute
  - Execute a workflow
  - Returns execution ID

GET /api/v1/executions/{id}
  - Get execution details
  - Includes result and performance metrics`}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Dockerfile</h3>
          <CodeBlock
            language="dockerfile"
            code={`FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]`}
          />
        </div>
      </div>
    </section>
  );
}
