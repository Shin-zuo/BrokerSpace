# BrokerSpace Project Plan & Overview

BrokerSpace is a platform designed to connect real estate brokers with prospective clients. It provides brokers with tools to list and manage their properties, while offering clients an intuitive marketing page to browse, filter, and inquire about properties. A standout feature is the seamless WhatsApp integration, which bridges the gap between client interest and direct broker communication.

## Implementation Plan (Next.js, TypeScript, Node.js)

### Phase 1: Foundation & Database
- Initialize the Next.js project with TypeScript.
- Set up the custom `src/` folder structure incorporating MVC concepts (Controllers, Models, Views).
- Design and initialize the database schema (Users, Properties, Images, Inquiries).
- Set up the ORM (e.g., Prisma or Mongoose) for database interactions within the Next.js API.

### Phase 2: Broker Portal & Authentication
- Implement secure login/registration for brokers utilizing the `src/app/(auth)` route group.
- Develop the broker dashboard layout and sidebar.
- Implement profile management (crucial for storing the broker's WhatsApp number).

### Phase 3: Property Management & Media
- Create CRUD interfaces for properties in the broker dashboard.
- Implement image upload functionality for property listings (storing image URLs in the database).
- Ensure the property creation form includes detailed address fields for frontend filtering.

### Phase 4: Client-Facing Marketing Page
- Develop the landing page showcasing available properties in the root/marketing pages.
- Implement robust search and location-based filtering.
- Design the detailed property view page featuring image galleries.

### Phase 5: Inquiry & WhatsApp Integration
- Create the inquiry form on the property details page.
- Create a Next.js API route (`src/app/api/inquiries`) to handle saving the inquiry to the DB.
- Frontend JavaScript logic to intercept the success response and instantly redirect the client to the generated WhatsApp Click-to-Chat URL.

### Phase 6: Super Admin (Future Phase)
- Implement role-based access control (RBAC) to differentiate between Brokers and Admins.
- Develop a Super Admin dashboard to oversee all brokers, manage platform settings, and moderate properties.

---

## Database Schema

### 1. `User` (Brokers & Admins)
- `id` (Primary Key)
- `role` (Enum: 'Broker', 'SuperAdmin') - *Default 'Broker'*
- `name` (String)
- `email` (String, Unique)
- `password` (String)
- `whatsapp_number` (String) - *Essential for the WhatsApp redirect feature*
- `company_name` (String, Nullable)
- `created_at`, `updated_at`

### 2. `Property`
- `id` (Primary Key)
- `broker_id` (Foreign Key -> User.id)
- `title` (String)
- `description` (Text)
- `price` (Decimal)
- `status` (Enum: 'Available', 'Sold', 'Draft')
- **Address Fields (For Frontend Filtering):**
  - `address_line_1` (String)
  - `city` (String)
  - `state_province` (String)
  - `postal_code` (String)
  - `country` (String)
- `created_at`, `updated_at`

### 3. `PropertyImage`
- `id` (Primary Key)
- `property_id` (Foreign Key -> Property.id)
- `url` (String) - *Path or URL to the uploaded image*
- `is_primary` (Boolean) - *Indicates the main cover image for the listing*
- `created_at`, `updated_at`

### 4. `Inquiry`
- `id` (Primary Key)
- `property_id` (Foreign Key -> Property.id)
- `client_name` (String)
- `client_email` (String, Nullable)
- `client_phone` (String, Nullable)
- `message` (Text) - *The pre-filled message sent to WhatsApp*
- `created_at`, `updated_at`

---

## Folder Structure (Next.js MVC Custom Architecture)

We will use a hybrid structure that leverages the Next.js App Router for routing while utilizing MVC patterns for clean separation of concerns inside the `src/` directory.

```text
src/
├── api/             # Client-side API fetch wrappers and utility functions for making requests
├── components/      # Reusable React UI components (Buttons, Cards, Modals, Forms)
├── controllers/     # Business logic handlers used by Next.js API Routes (Server-side)
├── models/          # Database schemas / ORM models (e.g., Prisma schema, Mongoose models)
├── views/           # Large page-level composition components or complex layouts
└── app/             # Next.js App Router (Routing)
    ├── (auth)/      # Route group for authentication
    │   ├── login/
    │   └── register/
    ├── (broker)/    # Route group for the broker dashboard
    │   ├── dashboard/
    │   ├── properties/
    │   └── settings/
    ├── api/         # Next.js API Routes (Backend Endpoints)
    │   ├── properties/
    │   ├── inquiries/
    │   └── auth/
    ├── property/    # Public property details pages (e.g., /property/[id])
    └── page.tsx     # The main marketing landing page
```

---

## Broker Dashboard Sidebar

The sidebar will be the primary navigation tool for authenticated brokers in their dashboard.

```text
Main Navigation
 ├── 📊 Dashboard (Overview of stats: Total Active Properties, Recent Inquiries)
 ├── 🏢 Properties
 │    ├── View All Properties
 │    ├── Add New Property (with multi-image upload support)
 │    └── Drafts
 ├── 💬 Inquiries (Log of all form submissions that were saved to the DB)
 └── ⚙️ Settings
      ├── Profile (Update WhatsApp Number and details here)
      └── Account Security
```
