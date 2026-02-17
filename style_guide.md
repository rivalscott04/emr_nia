You are a senior frontend architect and UI engineer.

Build a production-ready frontend for a professional E-Rekam Medis (Electronic Medical Record) system.

This system will be used in a real clinical environment, therefore:
- Must be clean
- Must be scalable
- Must follow reusable component architecture
- Must follow strict design consistency
- Must be easy to maintain long-term

Tech Stack:
- React (NextJS App Router)
- TypeScript
- TailwindCSS
- Component-based architecture
- Axios for API
- React Query (TanStack Query) for data fetching
- Zod for validation
- Zustand (or Context API) for state management

========================================
🎨 DESIGN SYSTEM (MANDATORY)
========================================

Primary Color: #2563EB
Background: #F8FAFC
Card: #FFFFFF
Border: #E2E8F0
Text Primary: #0F172A
Text Secondary: #475569

Status Colors:
- Success: #16A34A
- Warning: #F59E0B
- Danger: #DC2626
- Info: #0EA5E9
- Neutral: #94A3B8

Rules:
- DO NOT create new colors.
- DO NOT use gradients.
- DO NOT create duplicate components.
- Reuse existing components.

Border radius:
- Default: 12px

Spacing system:
- 4px scale only (4,8,12,16,24,32)

Typography:
- Inter
- H1 24px
- H2 20px
- Body 14-16px

========================================
🏗️ ARCHITECTURE RULES
========================================

1. Controllers exist only in backend.
2. Frontend must be modular.
3. All UI elements must be reusable components.
4. Do NOT hardcode buttons or inputs inside pages.
5. Use a centralized component library.

Folder Structure:

/app
/components
/components/ui
/components/forms
/components/layout
/modules
/services
/types
/hooks

========================================
🧱 REQUIRED REUSABLE COMPONENTS
========================================

Create the following reusable components:

1. Button
   - Variants: primary, secondary, danger, outline, ghost
   - Sizes: sm, md, lg

2. Input
3. Textarea
4. Select
5. FormField (wrapper with label + error)
6. Card
7. Modal
8. Badge (status)
9. DataTable (with pagination, search, sorting)
10. Layout (Sidebar + Header + Content)

Do NOT create custom button per page.
All pages must use these components.

========================================
📋 FEATURES TO IMPLEMENT
========================================

1. Authentication
   - Login page
   - Role-based access

2. Dashboard
   - Total pasien hari ini
   - Total kunjungan hari ini
   - Jumlah resep hari ini
   - Top diagnosa
   - Top obat

3. Pasien Module
   - Search by NIK
   - Create pasien
   - Detail pasien
   - Riwayat kunjungan

4. Kunjungan Module
   - Create kunjungan
   - Status (Open, Completed, Cancelled)
   - Detail kunjungan

5. TTV Form
   - TD
   - Nadi
   - RR
   - Suhu
   - SpO2
   - Berat
   - Tinggi

6. SOAP Form
   - Subjective
   - Objective
   - Assessment
   - Plan
   - Lock after verification
   - Addendum section

7. Diagnosa ICD-10
   - Multiple entries
   - One primary

8. Tindakan ICD-9
   - Multiple entries
   - One primary

9. Resep Module
   - Multiple resep per kunjungan
   - Status:
     - Draft
     - Sent
     - Processed
     - Completed
     - Cancelled
   - Cannot edit after Sent
   - API-ready structure

========================================
⚙️ DATA MANAGEMENT
========================================

- Use React Query for API calls
- Use proper loading states
- Use error boundaries
- Use optimistic update when possible
- Avoid unnecessary re-renders
- Avoid duplicate fetching

========================================
🔐 UX RULES (MEDICAL SYSTEM)
========================================

- Clean layout
- Focus on readability
- No decorative UI
- No heavy animation
- No flashy colors
- Minimal transitions

========================================
📦 OUTPUT FORMAT
========================================

Generate:

1. Full folder structure
2. All reusable components
3. Example page implementations
4. Proper TypeScript types
5. API service layer
6. Clean modular code
7. Production-ready structure

DO NOT skip components.
DO NOT generate partial code.
Make it scalable and enterprise-ready.

This system must be maintainable for at least 5+ years.