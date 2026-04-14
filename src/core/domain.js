'use strict';

/**
 * Domain detection module.
 * Identifies the technical domain(s) the user input belongs to.
 *
 * Supported domains:
 *   frontend   - UI, React, Vue, Angular, CSS, HTML
 *   backend    - servers, Node, Python, Java, APIs, Express, FastAPI
 *   database   - SQL, NoSQL, ORM, migrations, queries
 *   devops     - Docker, CI/CD, Kubernetes, deployment, infra
 *   mobile     - React Native, Flutter, iOS, Android
 *   ml         - ML, AI, models, datasets, training
 *   api        - REST, GraphQL, gRPC, OpenAPI design
 *   fullstack  - explicit full-stack or when multiple domains detected
 */

const DOMAIN_PATTERNS = [
  {
    domain: 'frontend',
    patterns: [
      /\b(react|vue|angular|svelte|next\.?js|nuxt|html|css|scss|sass|tailwind|bootstrap|styled.?compon|component|jsx|tsx|dom|browser|ui|ux|page|layout|responsive|animation|figma|storybook|webpack|vite|parcel)\b/i,
    ],
  },
  {
    domain: 'backend',
    patterns: [
      /\b(node\.?js|express|fastapi|django|flask|spring|laravel|rails|nestjs|hapi|koa|fastify|middleware|server|endpoint|route|handler|controller|service|repository|rest\s+api|http\s+server|microservice)\b/i,
    ],
  },
  {
    domain: 'database',
    patterns: [
      /\b(sql|nosql|postgres|postgresql|mysql|sqlite|mongodb|redis|cassandra|dynamodb|firebase|prisma|sequelize|typeorm|knex|drizzle|orm|migration|schema|table|column|row|query|index|transaction|relation|join|aggregate)\b/i,
    ],
  },
  {
    domain: 'devops',
    patterns: [
      /\b(docker|kubernetes|k8s|helm|ci\/cd|github\s+actions|gitlab\s+ci|jenkins|terraform|ansible|nginx|proxy|deploy|pipeline|container|image|pod|cluster|ingress|secret|configmap|cloud|aws|gcp|azure|vercel|netlify|heroku)\b/i,
    ],
  },
  {
    domain: 'mobile',
    patterns: [
      /\b(react\s+native|flutter|expo|ios|android|swift|kotlin|xcode|gradle|push\s+notification|app\s+store|play\s+store|mobile\s+app|navigation|screen|native)\b/i,
    ],
  },
  {
    domain: 'ml',
    patterns: [
      /\b(machine\s+learning|deep\s+learning|neural\s+network|model\s+train|dataset|feature\s+engineer|pytorch|tensorflow|keras|scikit|pandas|numpy|embedding|llm|gpt|fine.?tun|inference|vector\s+db|rag|langchain)\b/i,
    ],
  },
  {
    domain: 'api',
    patterns: [
      /\b(rest\s*ful|graphql|grpc|openapi|swagger|api\s+design|api\s+contract|api\s+versioning|webhook|endpoint|payload|request|response|status\s+code|authentication|authorization|jwt|oauth|rate\s+limit)\b/i,
    ],
  },
];

/**
 * Detects all matching domains from user input.
 * Returns primary domain + list of all matched domains.
 * @param {string} input
 * @returns {{ primary: string, all: string[] }}
 */
function detectDomain(input) {
  const matched = [];

  for (const { domain, patterns } of DOMAIN_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        if (!matched.includes(domain)) matched.push(domain);
        break;
      }
    }
  }

  if (matched.length === 0) {
    return { primary: 'general', all: [] };
  }

  if (matched.length >= 3) {
    return { primary: 'fullstack', all: matched };
  }

  // Prefer more specific domains over 'api' when combined
  const primary = matched.find((d) => d !== 'api') || matched[0];

  return { primary, all: matched };
}

module.exports = { detectDomain, DOMAIN_PATTERNS };
