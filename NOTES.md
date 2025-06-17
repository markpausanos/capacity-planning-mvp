# Capacity Planning MVP - Development Notes

## Setting Up

Ensure you have the following environment variables set in your .env.local file:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Time Spent

**Total Development Time: 225 minutes (3 hours 45 minutes)**

### Time Breakdown

- **Setup & Authentication (45 min):** Supabase setup, authentication flow implementation
- **Database Schema & Types (30 min):** Type definitions, database structure planning
- **Core CRUD Operations (60 min):** Server actions for consultants, clients, projects, allocations
- **Dashboard Implementation (45 min):** Charts, summary table, capacity visualization
- **Data Manager UI (30 min):** Tables, forms, modal dialogs
- **Styling & Polish (15 min):** UI refinements, responsive design

## AI Prompts & Workflows Used

### Key Cursor Prompts

1. **Initial Setup:**
   ```
   This is the context for what we will be building. We will provide a dashboard for data manager.
   The stack will be the following:
       Next.js
       Supabase
       Tailwind Shadcn
       Recharts
       Zustand
   Save this as context and direction for the project.
   ```

2. **Database Schema Design:**
   ```
   Given this sample seed data, generate the database schema for the project.
   It must have correct relationships between the tables, and RLS policies for user isolation.
   It also must auto-update the updated_at column for each table when a row is updated. Lastly, 
   it must use a UUID for the id column for each table.
   ```

3. **Component Generation:**
   ```
   Given this image, create data table components with CRUD operations for [consultants/clients/projects/allocations] 
   using shadcn/ui components and server actions. Provide proper validation for each form using zod and react-hook-form.
   ```

4. **Chart Implementation:**
   ```
   Build a stacked bar chart using Recharts showing 12-week capacity utilization per consultant with color coding: 
   green ≤100%, amber 101-120%, red >120%
   ```

5. **Complex Calculations:**
   ```
   Implement capacity planning calculations: cost (hours × cost_per_hour), revenue (hourly: hours × bill_rate, 
   flat: fee ÷ project weeks), profit (revenue - cost)
   ```

### AI Workflow Strategy

- Used **Cursor** for rapid scaffolding and component generation
- Leveraged **Claude** and **ChatGPT** for complex business logic and calculations
- Used AI to generate consistent TypeScript interfaces and Zod schemas

## Design Trade-offs

### Architecture Decisions

1. **Next.js App Router vs Pages Router:**
   - **Chosen:** App Router for better modern React patterns and server components
   - **Trade-off:** Learning curve and some middleware complexity

2. **Server Actions vs API Routes:**
   - **Chosen:** Server Actions for direct database access and better type safety
   - **Trade-off:** Less flexibility for external API consumption

3. **Supabase RLS vs Application-level Security:**
   - **Chosen:** RLS for database-level security and better data isolation
   - **Trade-off:** Complex policy debugging and potential performance impact

4. **Client-side vs Server-side Rendering:**
   - **Chosen:** Mixed approach using server components for data fetching and client components for interactivity
   - **Trade-off:** Hydration complexity and state management across boundaries

### UI/UX Decisions

1. **Modal Forms vs Inline Editing:**
   - **Chosen:** Modals for better validation UX and cleaner data flow
   - **Trade-off:** Extra clicks and less immediate feedback

2. **shadcn/ui vs Custom Components:**
   - **Chosen:** shadcn/ui for consistent design system and accessibility
   - **Trade-off:** Bundle size considerations and customization constraints

## Data Flow Architecture

```
User Input → Form Validation → Server Action → Supabase RLS → Database
                ↓
UI Update ← Revalidation ← Response ← Query Result ← Filtered Data
```

### Key Implementation Patterns

- **Optimistic Updates:** Immediate UI feedback before server confirmation
- **Error Boundaries:** Graceful error handling with toast notifications
- **Type Safety:** End-to-end TypeScript from database to UI
- **Data Revalidation:** Automatic cache invalidation after mutations

## What I'd Do Next

### Immediate Improvements (Next 8 hours)

1. **Enhanced Dashboard Features:**
   - Real-time capacity alerts and notifications

2. **Advanced Data Management:**
   - Bulk operations (import/export consultants, allocations)
   - Inline editing for allocations table
   - Advanced filtering and search capabilities

3. **Performance Optimizations:**
   - Implement React Query for better caching
   - Add pagination for large datasets
   - Optimize chart rendering for large data sets

### Medium-term Enhancements (1-2 weeks)

1. **Advanced Analytics:**
   - Trend analysis and forecasting
   - Resource utilization heatmaps
   - Profit margin analysis by consultant/project

2. **Collaboration Features:**
   - Team workspaces with role-based permissions
   - Comments and notes on allocations
   - Approval workflows for capacity changes

3. **Integration Capabilities:**
   - Calendar integration (Google/Outlook)
   - Time tracking system connectivity
   - Slack/Teams notifications

## Technical Debt & Known Issues

### Current Limitations

- **Error Handling:** Could be more granular with specific error types
- **Loading States:** Some operations lack proper loading indicators
- **Validation:** Client-side validation could be more comprehensive
- **Testing:** No unit/integration tests implemented due to time constraints