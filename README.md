# GoldPlus - Personal Finance Management App

## Overview

GoldPlus is a modern web-based personal finance management application built with Next.js 15.3.3, React 18.3.1, and TypeScript. The app provides users with comprehensive tools to track income, expenses, and receive AI-powered budget optimization suggestions.

## 🚀 Features

### Core Functionality
- **Income/Expense Tracking**: Easy-to-use interface for inputting and managing financial transactions
- **Interactive Charts**: Visual representation of spending patterns using Recharts
- **AI Budget Tool**: AI-driven budget suggestions powered by Google Genkit to optimize savings
- **Personalized Tips**: Custom financial advice based on individual spending habits
- **Dashboard**: Comprehensive overview displaying spending, income, and savings at a glance
- **Data Persistence**: Local storage integration for data retention

### Technical Features
- **Modern UI Components**: Built with Radix UI components for accessibility and consistency
- **Responsive Design**: Fully responsive layout using Tailwind CSS
- **Form Management**: Advanced form handling with React Hook Form and Zod validation
- **Theme Support**: Light/dark mode support with next-themes
- **Database Integration**: Supabase integration for cloud data storage
- **Animations**: Smooth transitions and animations using Framer Motion

## 🎨 Design System

### Color Palette
- **Primary Color**: Deep Blue (#3F51B5) - Conveys trust and security
- **Background Color**: Light Blue (#E8EAF6) - Light, less saturated variant of primary
- **Accent Color**: Purple (#7E57C2) - Highlights interactive elements

### Typography
- **Font Family**: 'PT Sans', sans-serif for both body text and headlines

### Design Principles
- Clean and intuitive layout focused on user-friendly data input
- Financial-themed iconography
- Smooth transitions and subtle animations for enhanced UX

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15.3.3
- **Runtime**: React 18.3.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI component library
- **Animations**: Framer Motion 12.18.1
- **Charts**: Recharts 2.15.1

### Backend & AI
- **AI Integration**: Google Genkit 1.8.0 for AI-powered features
- **Database**: Supabase with SSR support
- **Email**: Nodemailer 7.0.3

### Development Tools
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod 3.24.2
- **Date Handling**: Date-fns 3.6.0 and Day.js 1.11.13
- **State Management**: Built-in React state management
- **Build Tool**: Next.js with Turbopack support

## 📦 Installation & Setup

### Prerequisites
- Node.js (version 20 or higher)
- npm package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jacobwechuli/webapp_mire
   cd webapp_mire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file and configure:
   - Supabase credentials
   - Google AI API keys
   - Other environment variables as needed

4. **Database Setup**
   Run the Supabase schema:
   ```bash
   # Use the provided supabase_profiles_schema.sql
   ```

## 🚀 Development

### Available Scripts

- **Development Server**
  ```bash
  npm run dev
  ```
  Starts the development server on port 9002 with Turbopack

- **AI Development**
  ```bash
  npm run genkit:dev
  ```
  Starts Genkit development server

- **AI Watch Mode**
  ```bash
  npm run genkit:watch
  ```
  Starts Genkit in watch mode for development

- **Build**
  ```bash
  npm run build
  ```
  Creates production build

- **Type Checking**
  ```bash
  npm run typecheck
  ```
  Runs TypeScript type checking

## 📁 Project Structure

## 🔧 Configuration Files

- **Next.js**: `next.config.ts`
- **TypeScript**: `tsconfig.json`
- **Tailwind CSS**: `tailwind.config.ts`
- **PostCSS**: `postcss.config.mjs`
- **UI Components**: `components.json`
- **App Hosting**: `apphosting.yaml`

## 📊 Key Dependencies

### UI & Styling
- Radix UI components for accessible UI elements
- Tailwind CSS for utility-first styling
- Lucide React for icons
- Class Variance Authority for component variants

### Functionality
- React Hook Form for form management
- Zod for schema validation
- Recharts for data visualization
- Date-fns/Day.js for date manipulation

### AI & Backend
- Google Genkit for AI features
- Supabase for database and authentication
- Firebase for additional backend services

## 🤝 Contributing

1. Follow the established code style and patterns
2. Ensure TypeScript types are properly defined
3. Maintain the design system consistency
4. Test thoroughly before submitting changes

## 📄 License

This project is private and proprietary.

---

*For more detailed information about specific features or implementation details, please refer to the source code and inline documentation.*
