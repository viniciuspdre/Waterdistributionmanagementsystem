# C4 Frontend Code Level Specification

## 🎯 Objective

Generate code-level diagrams (C4 Level 4) for the React frontend.

Focus on structure and relationships between components, services, and state.

---

## 📂 Source Scope

Analyze:

- /src/app/components
- /src/app/services
- /src/app/context
- /src/app/utils
- routes.tsx
- App.tsx

---

## 🧠 Diagram Types

### 1. Component Structure Diagrams (REQUIRED)

Group by feature/module.

Each diagram must include:

- React components
- Services used
- Context providers (if used)

---

### 2. State Management Diagram (REQUIRED if context exists)

Show:

- Context providers
- Components consuming state

---

### 3. Routing Diagram (REQUIRED)

From routes.tsx:

- Routes → Components mapping

---

### 4. Sequence Diagrams (OPTIONAL)

For key flows:

- Login
- Data fetching
- Form submission

Limit to 2–3 diagrams

---

## 🧩 Grouping Strategy

Group by feature:

Examples:

- auth
- user
- dashboard

---

## 🧱 Required Outputs

/docs/c4/frontend-code/
  auth-components.puml
  user-components.puml
  routing.puml
  state-management.puml
  (optional) sequence-*.puml

---

## 🎨 Diagram Rules

Use PlantUML:

### Components
- rectangle or component

### Relationships
- --> (dependency)
- ..> (usage)

---

## 🔗 Relationships

Infer:

- Component → Service (API calls)
- Component → Context (state)
- Routes → Components
- App → Routes

---

## 📛 Naming Rules

Use real file/component names:

- LoginPage
- AuthService
- UserContext

---

## 🚫 Constraints

- DO NOT include UI details (CSS, styles)
- DO NOT include trivial helper functions
- DO NOT create one huge diagram

---

## 🔄 Update Strategy

- Detect new components
- Detect new routes
- Detect context usage changes

---

## ✅ Quality Rules

- Max ~15 elements per diagram
- Prefer multiple small diagrams
- Keep readability high