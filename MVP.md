# BrokerSpace: Project Analysis & MVP Specification

## 1. Executive Summary
**BrokerSpace** is a modern, closed-network real estate platform designed exclusively for brokers, taking heavy UI/UX inspiration from social and developer platforms like Facebook and GitHub. It abandons traditional "admin dashboards" and sidebars in favor of a clean, feed-centric logged-in experience. Authenticated brokers can manage, discover, and collaborate on property listings via a global feed, communicate via direct chat (replacing traditional inquiries), and view private analytics on their personal profile pages. The public-facing site acts strictly as a SaaS-style marketing page to drive broker registrations.

## 2. Current State Analysis

### 2.1 Technology Stack
The project is built on a robust, modern stack:
- **Frontend/Framework:** Next.js 15+ (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS v4, Framer Motion (animations), Glassmorphism aesthetics, Lucide React (icons)
- **Backend/Database:** Prisma ORM, PostgreSQL (via `@prisma/adapter-pg`)
- **Map & Geolocation:** Leaflet, React-Leaflet, Nominatim API
- **Authentication/Security:** bcryptjs, jose (likely for JWT)

### 2.2 Identified Technical Debt & Major Architectural Pivots
To align with the new GitHub/Facebook-inspired vision, significant restructuring of the existing codebase is required:
1. **Scrap the Dashboard & Sidebar:** The traditional sidebar layout must be removed. Navigation will be handled by a global top navbar.
2. **Scrap the Inquiry System:** The form-based inquiry system must be completely removed and replaced with a direct Chat/Messaging system.
3. **Public Landing Page Pivot:** The public landing page currently exposes listings and must be converted into a pure marketing/signup page, moving all property discovery inside the authenticated feed.
4. **Fixing Existing UI Bugs:** Uploading multiple images currently breaks the property creation form UI. Property cards need a built-in image slider (carousel).

---

## 3. Minimum Viable Product (MVP) Definition

The MVP for BrokerSpace focuses on a private, social-network-style B2B model: **Brokers sign up -> Log in to a global feed of properties -> Directly chat with other brokers -> Manage their own listings and view private stats on their personal profile.**

### 3.1 Core MVP Features (Must Haves for Launch)
1. **SaaS Public Landing Page:** A marketing page highlighting the benefits of the platform. **Zero public property listings.**
2. **The Global Broker Feed (Logged-in Home):** Similar to a GitHub dashboard, upon login, brokers see a feed of all listings. Action buttons (Create Property, Search, Messages) are easily accessible from this feed and the top navbar.
3. **Direct Chat System:** Replaces the old inquiry forms. Brokers can initiate direct chats with other brokers regarding a property or general networking.
4. **Personal Profile Pages (`/[username]`):** A dedicated profile page for each broker showcasing their active listings.
    - **Private Analytics:** If a broker views their *own* profile, they see private sales reports and analytics (views, inquiries). Visitors to the profile will *only* see the broker's public properties and contact info.
5. **Property Listing Lifecycle:** A broker must be able to successfully create, view, edit, and delete their own properties without UI breakage.
6. **Dedicated Settings Page:** A separate page (`/settings`) accessible via a dropdown menu on the user's avatar in the navbar, used solely for account configuration.

### 3.2 Broker Repository Vision (Future Features & Recommendations)
1. **Document Vault:** A secure central repository for standard real estate contracts and templates.
2. **Co-Brokering Agreements:** Formalized digital handshakes inside the platform for splitting commissions on shared deals.

---

## 4. Gap Analysis & Actionable Roadmap to MVP Launch
*(Based on the architectural pivot and current `todo.md`)*

### Step 1: Restructure Navigation & The Public Landing Page
- **Solution:** Remove the `/(broker)` layout and its sidebar. Implement a global Top Navigation Bar for authenticated users. Redesign `app/page.tsx` as a pure marketing page directing users to `/signup`. 

### Step 2: Implement the Global Feed & Profile Pages
- **Solution:** Create the authenticated home page (`/feed` or `/home`) to display all properties. Create the dynamic profile route (`/[username]`) that selectively renders analytics if the viewing user matches the profile owner.

### Step 3: Replace Inquiries with Chat
- **Solution:** Delete the `Inquiry` Prisma model and replace it with `Conversation` and `Message` models. Build a chat interface accessible from the top navbar.

### Step 4: Fix the Property Creation UI (Todo #1)
- **Solution:** Refactor the image preview container in the Property creation form to use a flexible CSS Grid or flex-wrap with fixed aspect-ratio thumbnails. Add `overflow-x-auto` if it's meant to be a single row.

### Step 5: Implement Property Card Image Slider (Todo #3)
- **Solution:** Update `PropertyCard.tsx` in the private feed to include a simple carousel. Use Framer Motion to animate sliding between the `PropertyImage` array, with left/right chevron buttons.
