# Implementation Plan: Dynamic LCNC Dashboard

This plan outlines the architecture and implementation steps to create a fully customizable, Low-Code/No-Code (LCNC) dashboard system where each user can design their own workspace.

## 1. Architectural Overview

The system will allow users to create multiple dashboards, add widgets from a shared report library, and arrange them using a drag-and-drop interface.

### Key Components
- **Dashboard Engine**: Manages the grid layout and widget lifecycle.
- **Report Designer**: A tool to create "Report Definitions" (SQL-lite configurations) that power widgets.
- **Widget Library**: A searchable catalog of available visualizations.
- **Dynamic Query Builder**: Backend service that converts JSON configurations into safe SQL.

## 2. Data Model (PostgreSQL)

We will use the schema defined in `dashboard_lcnc.md` with minor enhancements for user-specific defaults.

```sql
-- dashboards table (already defined in reference)
-- Added 'is_default' to handle user preferences
ALTER TABLE dashboards ADD COLUMN is_default BOOLEAN DEFAULT FALSE;

-- dashboard_permissions (to handle sharing)
CREATE TABLE dashboard_shares (
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  user_id      UUID, -- or role_id
  access_level VARCHAR(20) DEFAULT 'VIEW', -- 'VIEW', 'EDIT'
  PRIMARY KEY (dashboard_id, user_id)
);
```

## 3. Backend Implementation (Spring Boot)

### Dynamic Query Execution
The `ReportQueryBuilder` (as seen in the reference) is the core. It must:
1. **Validate Permissions**: Ensure the user has access to the `data_source` (entity or form).
2. **Contextual Filtering**: Automatically inject user-specific filters (e.g., `WHERE created_by = current_user`) if the report is "Personal".
3. **Caching**: Use the `report_cache` table to prevent heavy re-computation of common widgets.

### API Endpoints
- `GET /api/dashboards`: List dashboards available to the user (owned + shared).
- `POST /api/dashboards`: Create a new dashboard (often by cloning a template).
- `PUT /api/dashboards/{id}/layout`: Save the updated `react-grid-layout` JSON.
- `GET /api/reports`: Browse the "Widget Catalog".

## 4. Frontend UI/UX Design

### The "Workspace" Concept
Instead of a static page, the Dashboard becomes a "Workspace" with two modes:

#### View Mode (Standard)
- Clean, focused UI.
- Widgets update automatically based on `refresh_secs`.
- Interactions: Hover for tooltips, click to "Drill Down" into the raw data.

#### Design Mode (LCNC)
- **Grid Overlay**: Visual grid lines appear to help alignment.
- **Widget Controls**: Handles for resizing and dragging.
- **The "Plus" Button**: Floating Action Button (FAB) or Toolbar item to open the **Widget Gallery**.
- **Widget Settings Drawer**: A slide-out panel to configure:
    - Chart types (Bar, Line, KPI, etc.)
    - Data filters (e.g., "Last 30 Days")
    - Visual styles (Colors, Legend position)

### Premium Aesthetics
- **Color Palette**: Use a professional "Slate" or "Zinc" base with vibrant "Electric Blue" or "Indigo" accents.
- **Glassmorphism**: Use `backdrop-filter: blur(10px)` on widgets for a modern, depth-heavy look.
- **Animations**: Use `framer-motion` for widget entrance (staggered) and layout transitions.

## 6. Realized Implementation Details

### Two-Phase Widget Selection (LCNC)
We moved from a simple list to a guided "Selection Wizard":
1. **Visualization First**: User picks the "how" (Bar Chart, KPI, etc.). This ensures they think about the UX first.
2. **Data Source Second**: Filtered list of reports from the backend that provide the "what".

### Data Persistence Strategy
- **Layout Sync**: The `react-grid-layout` JSON is synced to the `dashboards` table `layout` JSONB column.
- **Deep Save**: The `Dashboard` entity manages a collection of `DashboardWidget` entities. Saving the dashboard in the UI triggers a deep update in Spring Boot, handling new widget creation and orphan removal.
- **Transactional Consistency**: Database constraints ensure that widgets cannot exist without a valid dashboard or report definition.

### Multi-Dashboard Support
- Users can create multiple dashboards (e.g., "Daily Ops", "Quarterly Sales").
- A "New Dashboard" flow allows cloning existing layouts or starting from a blank canvas.
- Dashboards can be toggled between "Personal" and "Shared" (Shared dashboards become visible to others based on role permissions).

### UI/UX Polish
- **Glassmorphism**: Heavy use of `backdrop-blur-md` and semi-transparent Zinc backgrounds for a premium ERP feel.
- **Responsive Grid**: Replaced `WidthProvider` with a custom `ResizeObserver` for robust, flicker-free resizing.
- **Grid Overlay**: A visual dotted grid appears in Edit Mode to guide widget placement.

--------------------------------
# UI Design: Premium Dynamic Dashboard

This document details the visual and interactive elements of the customizable LCNC dashboard.

## 1. Visual Style: "Modern Enterprise"
The dashboard will use a **sleek, high-contrast** design that balances professional utility with modern aesthetics.

- **Background**: Deep Zinc (`#09090b`) with a subtle radial gradient.
- **Widgets**: Semi-transparent backgrounds (`rgba(255, 255, 255, 0.05)`) with a `1px` border (`rgba(255, 255, 255, 0.1)`) and subtle outer glow.
- **Typography**: `Inter` or `Geist` for a clean, technical feel.

## 2. The "Edit Mode" Experience

### Entering Design Mode
A prominent "Customize Dashboard" button in the top right. Clicking it triggers:
1. **Layout Grid Overlay**: A subtle dotted grid appears in the background.
2. **Widget Isolation**: Non-widget elements (like the sidebar) fade slightly.
3. **Control Handles**: Each widget gains a "Drag Handle" in the top left and a "Resize Handle" in the bottom right.

### The Widget Gallery (LCNC Core)
When the user clicks "Add Widget", a right-side drawer slides in with:
- **Search Bar**: Quick search for report names.
- **Categories**: "Sales", "Inventory", "System Health", etc.
- **Preview Cards**: Small, non-interactive previews of what the widget looks like (e.g., a tiny Bar Chart icon).
- **Drag-to-Add**: Users can literally drag a widget from the gallery onto the dashboard grid.

## 3. Interaction Design (Micro-Animations)

- **Layout Shifts**: When a widget is dragged, others should "flow" out of the way using `framer-motion`'s layout animations (no jarring snaps).
- **Loading States**: Each widget has its own "Shimmer" effect while data is fetching.
- **Refresh Pulse**: A tiny green dot that pulses when a widget successfully auto-refreshes.

## 4. Widget Components

### KPI Card
- Large, bold metric.
- Small sparkline chart (line chart with no axes) showing the trend for the last 7 days.
- Percentage change badge (Green for up, Red for down).

### Dynamic Chart Widget
- **Settings Icon**: Opens a popup to change:
    - **Visualization**: Toggle between Bar, Line, and Area charts for the same data.
    - **Time Grain**: Change grouping from "Daily" to "Weekly" or "Monthly" on the fly.
- **Export Menu**: Download as CSV or PNG.

## 5. Dashboard Navigation
A horizontal "Tabs" bar at the top allows users to switch between:
1. **My Workspace** (Personal)
2. **Operations Hub** (Shared by Admin)
3. **Sales Performance** (Team Shared)

Users can "Pin" their favorite dashboard to be their landing page.

###############

I have developed a comprehensive plan to implement the **Dynamic LCNC Dashboard** features. Based on the reference material provided, I've outlined two key documents that cover both the technical architecture and the premium user experience.

### 📋 [Implementation Plan](file:///C:/Users/Rizer/.gemini/antigravity/brain/93b42845-2c17-40eb-88a8-faa5aad611db/dashboard_implementation_plan.md)
This plan focuses on the backend and structural foundations:
*   **Data Model**: Enhancements to the `dashboards` and `dashboard_widgets` tables to support user-specific defaults and sharing.
*   **Dynamic Query Builder**: A Spring Boot service using `JdbcTemplate` to safely execute JSON-defined reports.
*   **Permissions**: A logic layer to ensure users only see data and widgets they are authorized to access.

### ✨ [UI Design Walkthrough](file:///C:/Users/Rizer/.gemini/antigravity/brain/93b42845-2c17-40eb-88a8-faa5aad611db/ui_design_walkthrough.md)
This document defines the "Modern Enterprise" look and feel:
*   **Edit Mode**: A dedicated design state with a grid overlay and drag-and-drop handles using `react-grid-layout`.
*   **Widget Gallery**: A slide-out drawer where users can search for and add pre-defined reports to their dashboard.
*   **Micro-interactions**: Smooth transitions with `framer-motion`, glassmorphism styles, and real-time status indicators.

### Key Approaches Proposed:
1.  **Personal Workspace**: Every user gets a default personal dashboard they can modify without affecting others.
2.  **Shared Templates**: Admins can create "Master Dashboards" that users can clone as a starting point.
3.  **Role-Based Widget Library**: The "Add Widget" gallery dynamically filters available reports based on the user's role permissions.

**Which part would you like to start with?** I can begin by setting up the **Database Schema** and **Spring Boot services**, or we can dive into the **React Frontend** to build the grid layout.

Listed directory erp-with-LCNC
Listed directory backend
Ran command: `dir /s /b backend\src\main\java`
Listed directory java
Listed directory demo
Listed directory com
Listed directory demo
Ran command: `Get-ChildItem -Path backend\src\main\java -Recurse -Directory | Select-Object -First 5 -ExpandProperty FullName`
Listed directory erpWithLCNC
Listed directory modules
Listed directory lcnc
Listed directory entity
Viewed pom.xml:1-170
Viewed LcncEntityExtendedData.java:1-52
Listed directory migration
Viewed V1__init_core_tables.sql:1-29
Edited V9__dashboard_lcnc.sql
Edited ReportDefinition.java
Edited Dashboard.java
Edited DashboardWidget.java
Edited ReportCache.java
Edited ReportDefinitionRepository.java
Edited DashboardRepository.java
Edited ReportQueryBuilder.java
Listed directory service
Listed directory service
Ran command: `mv backend\src\main\java\com\example\erpWithLCNC\service\ReportQueryBuilder.java backend\src\main\java\com\example\erpWithLCNC\modules\lcnc\service\ReportQueryBuilder.java`
Edited ReportQueryBuilder.java
Viewed ReportQueryBuilder.java:1-126
Edited ReportQueryBuilder.java
Edited ReportService.java
Edited DashboardService.java
Searched for "@AuthenticationPrincipal"
Listed directory controller
Viewed LcncConfigController.java:1-71
Listed directory service
Viewed UserDetailsServiceImpl.java:1-33
Viewed User.java:1-35
Viewed BaseEntity.java:1-37
Edited DashboardController.java
Edited ReportController.java
Listed directory frontend
Listed directory src
Viewed package.json:1-42
Listed directory features
Listed directory dashboard
Listed directory lcnc
Ran command: `npm install react-grid-layout recharts @tanstack/react-query @types/react-grid-layout`
Edited dashboard.ts
Edited DashboardWidget.tsx
Edited DynamicDashboard.tsx
Viewed App.tsx:1-22
Viewed Dashboard.tsx:1-219
Viewed DashboardOverview.tsx:1-79
Viewed main.tsx:1-11
Edited main.tsx
Edited DashboardOverview.tsx
Edited WidgetGallery.tsx
Edited DynamicDashboard.tsx
Edited DynamicDashboard.tsx
Listed directory dto

I have successfully implemented the **Dynamic LCNC Dashboard** features, providing a fully customizable workspace for each user.

### 🚀 Implementation Highlights

#### 1. Backend Foundation (Spring Boot & PostgreSQL)
*   **Database Schema**: Created `V9__dashboard_lcnc.sql` migration with 4 new tables: `report_definitions`, `dashboards`, `dashboard_widgets`, and `report_cache`.
*   **Dynamic Query Engine**: Implemented `ReportQueryBuilder`, a service that constructs safe, parameterized SQL queries from JSON configurations, supporting dynamic filtering, grouping, and aggregation.
*   **API Layer**: 
    *   `DashboardController`: Manage personal and shared dashboards.
    *   `ReportController`: Execute dynamic reports and manage the widget library.
*   **Ownership Logic**: Integrated user ownership so dashboards can be private, shared, or set as system defaults.

#### 2. Premium Frontend UI (React, Vite, Tailwind)
*   **Interactive Grid**: Integrated `react-grid-layout` to allow users to drag and resize widgets in "Customize Mode".
*   **LCNC Widget Gallery**: Built a sleek slide-out drawer (`WidgetGallery`) where users can browse and instantly add new reports to their dashboard.
*   **Data Visualization**: Implemented `DashboardWidget` using `recharts`, supporting Bar Charts, Line Charts, and KPI Cards with automatic refresh intervals.
*   **Modern Aesthetics**: 
    *   **Palette**: Used a deep Zinc/Slate theme with vibrant blue accents.
    *   **Depth**: Applied glassmorphism effects (`backdrop-blur`) and subtle borders to widgets.
    *   **Motion**: Added fluid transitions for layout changes and gallery entries using `framer-motion`.

### 📂 Key Files Created/Modified
*   **Backend**: 
    *   [DashboardController.java](file:///c:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/backend/src/main/java/com/example/erpWithLCNC/modules/lcnc/controller/DashboardController.java)
    *   [ReportQueryBuilder.java](file:///c:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/backend/src/main/java/com/example/erpWithLCNC/modules/lcnc/service/ReportQueryBuilder.java)
    *   [V9__dashboard_lcnc.sql](file:///c:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/backend/src/main/resources/db/migration/V9__dashboard_lcnc.sql)
*   **Frontend**:
    *   [DynamicDashboard.tsx](file:///c:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/frontend/src/features/dashboard/DynamicDashboard.tsx)
    *   [DashboardWidget.tsx](file:///c:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/frontend/src/features/dashboard/components/DashboardWidget.tsx)
    *   [WidgetGallery.tsx](file:///c:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/frontend/src/features/dashboard/components/WidgetGallery.tsx)

You can now navigate to the **Dashboard** section in the portal to see the new dynamic interface. Clicking **"Customize"** will enable the drag-and-drop grid and the **"Add Widget"** gallery.