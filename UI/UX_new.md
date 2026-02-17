You are a senior frontend architect and clinical UX engineer.

Build a production-ready frontend for a real-world Electronic Medical Record (E-Rekam Medis) system.

This system will be used daily by doctors in high-volume clinical environments.

The system MUST prioritize:
- Speed of input (≤3 minutes per common patient)
- Error prevention
- Clinical safety
- Clear visual hierarchy
- Subtle depth separation
- Long-term maintainability (5+ years)
- Strict component reusability

Tech Stack:
- NextJS (App Router)
- React
- TypeScript
- TailwindCSS
- Axios
- TanStack Query
- Zod
- Zustand

========================================
🎯 CLINICAL UX PRIORITY
========================================

Primary user: DOCTOR

Design must:
- Reduce typing
- Avoid long scroll forms
- Prevent medical errors
- Keep patient identity always visible
- Use structured medical inputs
- Maintain strong visual clarity

Target workflow:
Antrian → Open Patient → Examination → Diagnosis → Prescription → Complete

No unnecessary navigation.
No decorative UI.
No clutter.

========================================
🎨 VISUAL HIERARCHY & DEPTH RULES (IMPORTANT)
========================================

This system must NOT look flat and lifeless.

1. Background and components must not visually merge.
2. Use subtle shadow to create depth separation.
3. Cards and tables must have soft elevation.
4. Maintain a professional clinical tone.

Shadow Rules:
- Use subtle shadow only:
  shadow-sm or equivalent
- No heavy shadow
- No glow
- No dramatic elevation

Tables:
- Must have:
  - White background
  - Subtle shadow
  - Rounded 12px
  - Clear header row
- Must visually stand out from page background

Sidebar:
- Use dark slate tone background (e.g. slate-900 equivalent)
- Text must maintain accessibility contrast
- Active item uses primary color indicator
- Sidebar must feel stable and structured

Main Content:
- Light background (#F8FAFC)
- Cards white with soft shadow
- Clear spacing between sections
- Avoid visual blending

========================================
🎨 DESIGN SYSTEM
========================================

Primary: #2563EB
Background: #F8FAFC
Card: #FFFFFF
Border: #E2E8F0
Text Primary: #0F172A
Text Secondary: #475569

Status:
Success: #16A34A
Warning: #F59E0B
Danger: #DC2626
Info: #0EA5E9
Neutral: #94A3B8

Rules:
- No gradients
- No flashy UI
- No additional random colors
- Subtle depth allowed
- No excessive animation

Border radius: 12px
Spacing: 4px scale only
Typography:
- Inter
- H1: 24px
- H2: 20px
- Body: 14–16px

========================================
🧠 CLINICAL SAFETY RULES
========================================

1. Sticky Patient Header (always visible)
2. Persistent allergy alert banner
3. Structured prescription form only
4. ICD autocomplete only
5. Cannot submit without primary diagnosis
6. SOAP Assessment required
7. Lock record after verification
8. Addendum system required

========================================
🏗️ ARCHITECTURE RULES
========================================

- Strict modular architecture
- No business logic inside UI components
- Centralized reusable component system
- No inline UI in pages
- Separation of UI / modules / services / store

Folder Structure:

/app
/components
/components/ui
/components/forms
/components/layout
/modules
/modules/patient
/modules/visit
/modules/examination
/modules/prescription
/services
/types
/hooks
/store

========================================
🧱 REQUIRED REUSABLE COMPONENTS
========================================

Core UI:
- Button
- Input
- Textarea
- Select
- Autocomplete
- Badge
- AlertBanner
- Card (with subtle shadow)
- Modal
- Tabs
- Accordion
- StickyHeader
- DataTable (with soft elevation)
- Layout (Dark Sidebar + Top Header + Content)

Form Components:
- FormField
- FormSection
- FormActions
- ValidationMessage

========================================
📋 FEATURE IMPLEMENTATION
========================================

1. Authentication (role-based)

2. Dashboard
   - Max 5 metric cards
   - Cards have subtle elevation
   - Clean spacing

3. Patient Module

4. Visit Module

5. Doctor Examination Page

Layout:
Left 70% → Active form
Right 30% → Real-time summary

Use:
- Tabs or Accordion
- Avoid long scroll
- Structured fields
- Compact TTV grid
- ICD autocomplete
- Structured prescription

6. Prescription Module
   - Structured
   - Allergy blocking
   - Status lifecycle
   - Lock after Sent

========================================
⚙️ DATA MANAGEMENT
========================================

- React Query
- Error boundaries
- Skeleton loading
- Optimistic update where safe
- Query key standardization

========================================
🔐 MEDICAL UX RULES
========================================

- No emoji
- No decorative illustration
- No childish UI
- Professional and clinical tone
- Strong readability
- Strong hierarchy
- Subtle depth separation
- Prevent invalid submission

========================================
📦 OUTPUT REQUIREMENTS
========================================

Generate:

1. Complete folder structure
2. All reusable components
3. Example pages (Dashboard, Patient Detail, Visit Detail)
4. TypeScript types
5. API service layer
6. Zustand store
7. React Query integration
8. Zod schemas
9. StickyHeader implementation
10. DataTable with subtle shadow
11. Sidebar with dark slate background

System must be:
- Scalable
- Modular
- Clinical-safe
- Visually structured
- Professional
- Maintainable 5+ years