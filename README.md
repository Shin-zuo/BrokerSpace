# BrokerSpace

BrokerSpace is a modern, full-stack real estate broker platform designed to manage property listings efficiently. It features a premium, interactive UI with glassmorphism effects, a bento-grid dashboard, and seamless property management capabilities.

## Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/)
- **Language:** TypeScript
- **Frontend UI:** React
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/) & [SweetAlert2](https://sweetalert2.github.io/)

## Features

- 🏡 **Property Management:** Full CRUD (Create, Read, Update, Delete) operations for real estate listings.
- 🖼️ **Image Handling:** Seamless drag-and-drop image uploads with carousel previews.
- ✨ **Modern UI:** Premium design utilizing glassmorphism, bento grids, and smooth micro-animations.
- 📍 **Location Autocomplete:** Dynamic region, province, and municipality selection (Philippines).

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- A running PostgreSQL database (or a connection string from a provider like Supabase/Prisma Postgres)

## Getting Started

Follow these steps to run the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shin-zuo/BrokerSpace.git
   cd sg-brokerspace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root of your project and add your database connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/brokerspace?schema=public"
   ```

4. **Set up the database:**
   Run Prisma migrations to generate the database schema and Prisma Client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **View the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Architecture Pattern

This project follows an **MVC (Model-View-Controller)** inspired architecture within the Next.js App Router structure:
- **Models:** Handled by Prisma (`prisma/schema.prisma`).
- **Views:** React components located in `src/views/` and `src/components/`.
- **Controllers:** Business logic separated into `src/controllers/` (e.g., `propertyController.ts`), which are consumed by the Next.js API route handlers in `src/app/api/`.
