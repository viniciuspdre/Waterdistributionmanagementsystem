# C4 Frontend Documentation Specification

## 🎯 Objective

Generate C4 Model diagrams (Context, Container, Component) focusing ONLY on the frontend React application.

---

## 📂 Source Scope

Analyze ONLY:

- /src/app
- /src/styles
- src/App.tsx
- src/routes.tsx
- src/types.ts

Ignore:
- backend
- infra

---

## 🧠 Architecture Assumption

The frontend follows a React architecture:

- components → UI components
- services → API communication
- context → global state
- utils → helper functions
- routes.tsx → routing definition
- App.tsx → application entry point

---

## 🌍 Context Diagram (C1)

Identify:

### Users:
- "User"

### External Systems:

- Backend API (always assume exists if services folder exists)
- External APIs (if detected in services)

---

## 🧱 Container Diagram (C2)

Represent ONE main container:

- "Frontend App" (React)

Also include:

- Backend API (external system)
- Browser (optional)

---

## 🧠 Component Diagram (C3 - MAIN FOCUS)

Inside Frontend App:

### Components Layer
- Each major component (from /components)
- Group small components if necessary

### Services Layer
- API service files

### State Management
- Context providers

### Routing
- routes.tsx → "Routing Component"

### App Root
- App.tsx → "Application Root"

---

## 🧩 Mapping Rules

- components → UI Components
- services → API Layer
- context → State Management
- utils → Utility Layer

---

## 🔗 Relationships

Infer:

- Components → Services (API calls)
- Components → Context (state usage)
- Routes → Components
- App → Routes

---

## 🧱 Required Outputs

Generate:

/docs/c4/frontend-context.puml  
/docs/c4/frontend-containers.puml  
/docs/c4/frontend-components.puml  

---

## 🎨 PlantUML Standard

Use:

- C4-PlantUML
- LAYOUT_WITH_LEGEND()

Includes:

- C4_Context
- C4_Container
- C4_Component

---

## 📛 Naming Rules

Use file/module names:

- "UserService"
- "AuthContext"
- "LoginComponent"

---

## 🚫 Constraints

- DO NOT invent backend internals
- DO NOT assume microfrontends
- DO NOT create multiple containers

---

## 🔄 Update Strategy

- Detect new components/services/context
- Update diagrams incrementally

---

## ✅ Quality Rules

- Avoid clutter
- Max ~15 components per diagram
- Group when necessary