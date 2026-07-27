# BrokerSpace Project Plan & Overview

BrokerSpace is a private, closed-network platform designed exclusively for real estate brokers, featuring a UI/UX heavily inspired by social and developer platforms like Facebook and GitHub. It provides a feed-centric internal repository where verified brokers can discover properties, communicate via direct chat, and view personal analytics on their profiles. The public-facing application acts purely as a marketing landing page to drive broker registrations.

## Implementation Plan (Next.js, TypeScript, Node.js)

### Phase 1: Foundation & Database Pivot
- Initialize the Next.js project with TypeScript.
- Set up the custom `src/` folder structure incorporating MVC concepts.
- Update the database schema: Remove the `Inquiry` model and replace it with a Chat/Messaging architecture (`Conversation`, `Message`).
- Set up the ORM (Prisma) for database interactions.

### Phase 2: Authentication & Global Navigation (GitHub Style)
- Implement secure login/registration for brokers.
- **Actionable Task:** Remove the legacy dashboard sidebar layout. Implement a global Top Navigation Bar (Logo, Feed, Messages, Avatar Dropdown for Profile/Settings).
- Ensure the sign-in form properly redirects brokers into the authenticated feed upon successful authentication using Next.js `redirect()`.

### Phase 3: Public SaaS Landing Page 
- **Actionable Task:** Strip all public property listings from the root `src/app/page.tsx`.
- Redesign the root page as a pure marketing landing page explaining the benefits of the platform.

### Phase 4: The Global Feed (Logged-in Home)
- Develop the main authenticated feed (e.g., `/feed` or `/home`) where brokers see a stream of all listings on the platform.
- Include quick action buttons (Create Property, Search) directly on this page, similar to a GitHub dashboard.
- **Actionable Task (Todo #1):** Fix the messy UI during multiple image uploads by refactoring the image preview container to utilize CSS Grid or flexbox with fixed aspect-ratio constraints.
- **Actionable Task (Todo #3):** Upgrade `PropertyCard.tsx` in the feed to include an interactive image slider (carousel) using Framer Motion.

### Phase 5: Direct Chat System
- Remove the old form-based inquiry system.
- Create a real-time (or polling-based) chat interface accessible via `/messages`.
- Brokers can click a "Message Broker" button on a property card to initiate a chat thread with the listing owner.

### Phase 6: Personal Profile Pages & Analytics
- Implement the `/[username]` dynamic route.
- Display the broker's public information and active listings to all authenticated users.
- **Conditional Analytics:** If the `currentUser.id` matches the profile owner's ID, reveal a private "Analytics/Sales Reports" section on the page (similar to viewing your own GitHub contribution graph or Facebook private insights).

### Phase 7: Settings & Configurations
- Create a dedicated `/settings` page accessible exclusively via the avatar dropdown in the top navbar.
- Allow brokers to update their profile picture, bio, contact info, and password here.

---

## Database Schema (Updated)

### 1. `User` (Brokers)
- `id` (Primary Key)
- `username` (String, Unique) - *Used for the `/[username]` profile route*
- `name` (String)
- `email` (String, Unique)
- `password` (String)
- `profile_picture_url` (String, Nullable)
- `bio` (String, Nullable)
- `created_at`, `updated_at`

### 2. `Property`
- `id` (Primary Key)
- `broker_id` (Foreign Key -> User.id)
- `title` (String)
- `description` (Text)
- `price` (Decimal)
- `status` (Enum: 'Available', 'Sold', 'Draft')
- **Address Fields:** `address_line_1`, `city`, `state_province`, `country`
- `views_count` (Int) - *For personal analytics*
- `created_at`, `updated_at`

### 3. `PropertyImage`
- `id` (Primary Key)
- `property_id` (Foreign Key -> Property.id)
- `url` (String)
- `is_primary` (Boolean)
- `created_at`, `updated_at`

### 4. `Conversation` (Replaces Inquiries)
- `id` (Primary Key)
- `participant_one_id` (Foreign Key -> User.id)
- `participant_two_id` (Foreign Key -> User.id)
- `property_id` (Optional Foreign Key -> Property.id, to link chat context)
- `updated_at` (For sorting inbox)

### 5. `Message`
- `id` (Primary Key)
- `conversation_id` (Foreign Key -> Conversation.id)
- `sender_id` (Foreign Key -> User.id)
- `content` (Text)
- `is_read` (Boolean)
- `created_at`

---

## Folder Structure (Social-Inspired MVC)

```text
src/
├── api/             
├── components/      
├── controllers/     
├── models/          
├── views/           
└── app/             
    ├── (auth)/      
    │   ├── login/
    │   └── register/
    ├── (app)/       # Authenticated layout featuring the Top Navbar (No Sidebar)
    │   ├── feed/    # The main global feed (Logged-in Home)
    │   ├── messages/# Chat inbox
    │   ├── settings/# Account configuration
    │   └── [username]/ # Personal profile & private analytics route
    ├── api/         
    └── page.tsx     # The main marketing landing page (No Listings)
```
