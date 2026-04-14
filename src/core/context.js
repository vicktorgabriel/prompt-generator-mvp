/**
 * Context reference detector.
 * Identifies mentions of existing artifacts in the user input:
 *   - repos   : GitHub/GitLab URLs, "this repo", "my repo"
 *   - folders : filesystem paths like src/, ./components, /api
 *   - apis    : existing API names or base URLs
 *   - models  : data model / entity references
 *   - tables  : database table references
 *   - components : UI component references
 *   - functions  : function / method references
 *   - configs    : configuration file references
 */

const CONTEXT_PATTERNS = [
  {
    type: 'repo',
    patterns: [
      /https?:\/\/(github|gitlab|bitbucket)\.com\/[\w.-]+\/[\w.-]+/i,
      /\b(this\s+repo|my\s+repo|existing\s+repo|our\s+repo|the\s+project)\b/i,
      /\b(git\s+clone|git\s+remote|origin)\b/i,
    ],
  },
  {
    type: 'folder',
    patterns: [
      /\b(src\/|app\/|components\/|pages\/|api\/|lib\/|utils\/|hooks\/|services\/|controllers\/|models\/|routes\/|tests?\/|\.\/\w+\/)/i,
      /\bfolder\s+(called|named)\s+\w+/i,
      /\bin\s+the\s+\w+\s+folder\b/i,
    ],
  },
  {
    type: 'api',
    patterns: [
      /https?:\/\/[^\s]+\/api[^\s]*/i,
      /\b(existing\s+api|current\s+api|our\s+api|the\s+api|the\s+endpoint)\b/i,
      /\/(v\d+)\/([\w-]+)/,
      /\bapi\s+key\b/i,
    ],
  },
  {
    type: 'model',
    patterns: [
      /\b(model|entity|class|interface|type)\s+\w+/i,
      /\b(user|product|order|cart|invoice|profile|post|comment|category|tag)\s+(model|entity|schema)/i,
      /\bexisting\s+(model|entity|schema)\b/i,
    ],
  },
  {
    type: 'table',
    patterns: [
      /\btable\s+(called|named)\s+\w+/i,
      /\b(users|products|orders|sessions|posts|comments|categories|tags|payments|subscriptions|invoices)\s+table\b/i,
      /\bexisting\s+table\b/i,
      /\b(select|insert|update|delete)\s+from\s+\w+/i,
    ],
  },
  {
    type: 'component',
    patterns: [
      /\b(component|widget)\s+(called|named)\s+\w+/i,
      /<[A-Z]\w+/,
      /\bexisting\s+component\b/i,
      /\b(Button|Header|Footer|Sidebar|Modal|Form|Table|Card|List|Nav|Layout)\b/,
    ],
  },
  {
    type: 'function',
    patterns: [
      /\bfunction\s+\w+/i,
      /\b\w+\(\)\s+(that|which|to)\b/i,
      /\bexisting\s+function\b/i,
      /\bthe\s+\w+\s+(function|method|handler|hook)\b/i,
    ],
  },
  {
    type: 'config',
    patterns: [
      /\.env\b/i,
      /\bconfig\.(js|ts|json|yaml|yml)\b/i,
      /\b(tsconfig|vite\.config|webpack\.config|jest\.config|package\.json|docker-?compose)\b/i,
      /\bexisting\s+config(uration)?\b/i,
      /\bin\s+my\s+(config|settings)\b/i,
    ],
  },
];

/**
 * Extracts all context references from user input.
 * @param {string} input
 * @returns {{ refs: Array<{ type: string, raw: string }>, hasExistingContext: boolean }}
 */
function detectContextRefs(input) {
  const refs = [];

  for (const { type, patterns } of CONTEXT_PATTERNS) {
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        refs.push({ type, raw: match[0] });
        break; // one match per type is enough
      }
    }
  }

  const hasExistingContext = refs.length > 0;

  return { refs, hasExistingContext };
}

export { detectContextRefs, CONTEXT_PATTERNS };
