# Tailwind CSS v4 - Utility-First CSS Framework

A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup. Tailwind CSS v4 is a complete rewrite optimized for performance and modern web development.

## Core Concepts and Philosophy

- **Utility-First**: Build complex components from a constrained set of primitive utilities
- **Performance-First**: Just-In-Time compilation with instant builds and tiny file sizes
- **Design Tokens**: CSS-first configuration with native CSS variables
- **Modern Web Platform**: Built for modern browsers with cutting-edge features
- **Developer Experience**: No configuration needed to get started, fully customizable when needed

## Installation and Setup

### Basic Installation

```bash
# Install Tailwind CSS v4
npm install tailwindcss@next
```

### Basic Setup (v4)

```css
/* styles/globals.css */
@import "tailwindcss";

/* Your custom CSS here */
```

```typescript
// next.config.js (for Next.js)
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = nextConfig;
```

### Configuration (tailwind.config.ts)

```typescript
// tailwind.config.ts (optional in v4)
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### CSS-First Configuration (v4 Feature)

```css
/* styles/theme.css */
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  --font-family-display: 'Inter', system-ui, sans-serif;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

## Key API Methods and Patterns

### Layout and Flexbox

```html
<!-- Flexbox Layout -->
<div class="flex items-center justify-between p-4">
  <div class="flex-shrink-0">
    <img class="h-10 w-10 rounded-full" src="/avatar.jpg" alt="Avatar">
  </div>
  <div class="ml-4 flex-1">
    <h3 class="text-lg font-medium text-gray-900">John Doe</h3>
    <p class="text-sm text-gray-500">Software Engineer</p>
  </div>
  <div class="ml-4 flex-shrink-0">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Follow
    </button>
  </div>
</div>

<!-- CSS Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-xl font-semibold mb-2">Card 1</h3>
    <p class="text-gray-600">Card content goes here.</p>
  </div>
  <!-- More cards... -->
</div>

<!-- Container Queries (v4 Feature) -->
<div class="@container">
  <div class="@sm:flex @md:grid @md:grid-cols-2 @lg:grid-cols-3">
    <!-- Responsive based on container size -->
  </div>
</div>
```

### Responsive Design

```html
<!-- Mobile-First Responsive Design -->
<div class="
  w-full 
  sm:w-1/2 
  md:w-1/3 
  lg:w-1/4 
  xl:w-1/6 
  p-4
">
  <img class="
    w-full 
    h-48 
    sm:h-32 
    md:h-40 
    lg:h-48 
    object-cover 
    rounded-lg
  " src="/image.jpg" alt="Responsive image">
</div>

<!-- Complex Responsive Layout -->
<div class="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  xl:grid-cols-6 
  gap-4 
  p-4 
  mx-auto 
  max-w-7xl
">
  <!-- Grid items adapt to screen size -->
</div>

<!-- Responsive Typography -->
<h1 class="
  text-2xl 
  sm:text-3xl 
  md:text-4xl 
  lg:text-5xl 
  xl:text-6xl 
  font-bold 
  text-center 
  mb-8
">
  Responsive Heading
</h1>
```

### Color System and Dark Mode

```html
<!-- Color System -->
<div class="bg-slate-50 dark:bg-slate-900">
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
    <h2 class="text-slate-900 dark:text-slate-100 text-xl font-semibold">
      Dark Mode Support
    </h2>
    <p class="text-slate-600 dark:text-slate-400 mt-2">
      Content adapts to light and dark themes automatically.
    </p>
    <button class="
      bg-blue-500 
      hover:bg-blue-600 
      dark:bg-blue-600 
      dark:hover:bg-blue-700 
      text-white 
      px-4 
      py-2 
      rounded-md 
      mt-4
    ">
      Action Button
    </button>
  </div>
</div>

<!-- Color Palette Usage -->
<div class="space-y-4">
  <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
    Error state with consistent color palette
  </div>
  <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
    Warning state
  </div>
  <div class="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
    Success state
  </div>
</div>
```

### Typography and Content

```html
<!-- Typography Scale -->
<div class="prose prose-lg max-w-none">
  <h1>The quick brown fox jumps over the lazy dog</h1>
  <h2>Typography hierarchy</h2>
  <h3>Consistent spacing and sizing</h3>
  
  <p class="lead">
    This is a lead paragraph that stands out from regular content.
  </p>
  
  <p>
    Regular paragraph text with proper line height and spacing.
    <a href="#" class="text-blue-600 hover:text-blue-800 underline">
      This is a link
    </a> within the text.
  </p>
  
  <blockquote class="border-l-4 border-gray-300 pl-4 italic">
    This is a blockquote with proper styling and spacing.
  </blockquote>
  
  <ul class="list-disc list-inside space-y-2">
    <li>First list item</li>
    <li>Second list item with more content</li>
    <li>Third list item</li>
  </ul>
</div>

<!-- Code Typography -->
<div class="bg-gray-900 text-gray-100 p-4 rounded-lg">
  <code class="text-sm font-mono">
    const greeting = "Hello, World!";
  </code>
</div>
```

### Modern Features (v4)

```html
<!-- 3D Transforms -->
<div class="
  transform-style-3d 
  rotate-x-12 
  rotate-y-12 
  perspective-1000
">
  <div class="bg-blue-500 w-32 h-32 rounded-lg shadow-lg">
    3D transformed element
  </div>
</div>

<!-- Advanced Gradients -->
<div class="
  bg-gradient-to-r 
  from-purple-400 
  via-pink-500 
  to-red-500 
  bg-gradient-conic 
  from-yellow-200 
  via-red-500 
  to-purple-800
">
  <!-- Gradient backgrounds -->
</div>

<!-- Container Queries -->
<div class="@container">
  <div class="@xs:text-sm @sm:text-base @md:text-lg @lg:text-xl">
    Text size based on container width
  </div>
</div>

<!-- Starting Styles for Animations -->
<div class="
  opacity-0 
  scale-95 
  @starting-style:opacity-100 
  @starting-style:scale-100 
  transition-all 
  duration-300
">
  Element with enter animation
</div>
```

### Component Patterns

```html
<!-- Card Component -->
<div class="
  bg-white 
  rounded-xl 
  shadow-lg 
  overflow-hidden 
  hover:shadow-xl 
  transition-shadow 
  duration-300
">
  <div class="relative">
    <img 
      class="w-full h-48 object-cover" 
      src="/card-image.jpg" 
      alt="Card image"
    >
    <div class="absolute top-4 right-4">
      <span class="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
        New
      </span>
    </div>
  </div>
  
  <div class="p-6">
    <h3 class="text-xl font-semibold text-gray-900 mb-2">
      Card Title
    </h3>
    <p class="text-gray-600 mb-4">
      Card description that provides context and information about the content.
    </p>
    <div class="flex items-center justify-between">
      <span class="text-2xl font-bold text-blue-600">$29.99</span>
      <button class="
        bg-blue-500 
        hover:bg-blue-600 
        text-white 
        px-4 
        py-2 
        rounded-lg 
        font-semibold 
        transition-colors 
        duration-200
      ">
        Add to Cart
      </button>
    </div>
  </div>
</div>

<!-- Navigation Component -->
<nav class="bg-white shadow-lg sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <img class="h-8 w-auto" src="/logo.svg" alt="Logo">
        <div class="hidden md:block ml-10">
          <div class="flex items-baseline space-x-4">
            <a href="#" class="
              text-gray-900 
              hover:text-blue-600 
              px-3 
              py-2 
              rounded-md 
              text-sm 
              font-medium 
              transition-colors 
              duration-200
            ">
              Home
            </a>
            <a href="#" class="
              text-gray-500 
              hover:text-gray-900 
              px-3 
              py-2 
              rounded-md 
              text-sm 
              font-medium 
              transition-colors 
              duration-200
            ">
              About
            </a>
          </div>
        </div>
      </div>
      
      <div class="flex items-center">
        <button class="
          md:hidden 
          inline-flex 
          items-center 
          justify-center 
          p-2 
          rounded-md 
          text-gray-400 
          hover:text-gray-500 
          hover:bg-gray-100 
          focus:outline-none 
          focus:ring-2 
          focus:ring-inset 
          focus:ring-blue-500
        ">
          <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>
```

## TypeScript Usage Examples

### Theme Configuration

```typescript
// types/tailwind.d.ts
import { Config } from 'tailwindcss';

export interface CustomTheme {
  colors: {
    primary: {
      50: string;
      100: string;
      500: string;
      900: string;
    };
    secondary: {
      50: string;
      500: string;
      900: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// tailwind.config.ts
import type { Config } from 'tailwindcss';
import type { CustomTheme } from './types/tailwind';

const theme: CustomTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f0fdf4',
      500: '#22c55e',
      900: '#14532d',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
};

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: theme,
  },
  plugins: [],
};

export default config;
```

### Typed Component Classes

```typescript
// utils/cn.ts (Class Name utility)
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// components/Button.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        buttonVariants[variant],
        buttonSizes[size],
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
          'cursor-wait': loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className={cn('animate-spin -ml-1 mr-2 h-4 w-4')}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// Usage
export default function ExamplePage() {
  return (
    <div className="space-y-4">
      <Button variant="primary" size="lg">
        Primary Button
      </Button>
      <Button variant="outline" loading>
        Loading Button
      </Button>
    </div>
  );
}
```

### Responsive Hooks

```typescript
// hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = breakpoints[breakpoint];
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, breakpoint]);

  return matches;
}

// hooks/useResponsiveValue.ts
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>> & { default: T }
): T {
  const isXl = useBreakpoint('xl');
  const isLg = useBreakpoint('lg');
  const isMd = useBreakpoint('md');
  const isSm = useBreakpoint('sm');

  if (isXl && values.xl) return values.xl;
  if (isLg && values.lg) return values.lg;
  if (isMd && values.md) return values.md;
  if (isSm && values.sm) return values.sm;
  
  return values.default;
}

// Usage in components
export function ResponsiveComponent() {
  const isMobile = !useBreakpoint('md');
  const columns = useResponsiveValue({
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
  });

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}
```

## Best Practices and Common Patterns

### Component Composition

```typescript
// components/Layout.tsx
interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function Layout({ children, sidebar, header }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="hidden lg:block w-64 bg-white shadow-sm">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
              {sidebar}
            </div>
          </aside>
        )}
        
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Form Patterns

```typescript
// components/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// components/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
        {
          'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': error,
        },
        className
      )}
      {...props}
    />
  );
}

// Usage
export function ContactForm() {
  return (
    <form className="space-y-6 max-w-md">
      <FormField label="Email" required>
        <Input 
          type="email" 
          placeholder="Enter your email"
        />
      </FormField>
      
      <FormField label="Message" error="This field is required">
        <textarea 
          className="block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          rows={4}
          placeholder="Enter your message"
        />
      </FormField>
      
      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
}
```

### Animation Patterns

```typescript
// components/AnimatedCard.tsx
import { useState } from 'react';

interface AnimatedCardProps {
  title: string;
  content: string;
  image: string;
}

export function AnimatedCard({ title, content, image }: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1',
        'transform-gpu' // Enable GPU acceleration
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className={cn(
            'h-48 w-full object-cover transition-transform duration-500',
            'group-hover:scale-110'
          )}
        />
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )} />
      </div>
      
      <div className="p-6">
        <h3 className={cn(
          'text-xl font-semibold text-gray-900 transition-colors duration-200',
          'group-hover:text-blue-600'
        )}>
          {title}
        </h3>
        
        <p className={cn(
          'mt-2 text-gray-600 transition-all duration-300',
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'
        )}>
          {content}
        </p>
        
        <div className={cn(
          'mt-4 transform transition-all duration-300',
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}>
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Integration with Other Tools

### Next.js Integration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack for better performance with Tailwind v4
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = nextConfig;

// app/globals.css
@import "tailwindcss";

/* Custom CSS using Tailwind's theme */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### React Hook Form Integration

```typescript
// components/FormComponents.tsx
import { useController, Control } from 'react-hook-form';

interface ControlledInputProps {
  name: string;
  control: Control<any>;
  label: string;
  type?: string;
  placeholder?: string;
  rules?: object;
}

export function ControlledInput({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  rules,
}: ControlledInputProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <FormField label={label} error={error?.message}>
      <Input
        {...field}
        type={type}
        placeholder={placeholder}
        error={!!error}
      />
    </FormField>
  );
}

// Usage with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export function StyledForm() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Form</h2>
      
      <form onSubmit={handleSubmit(console.log)} className="space-y-6">
        <ControlledInput
          name="name"
          control={control}
          label="Full Name"
          placeholder="Enter your name"
          rules={{ required: 'Name is required' }}
        />
        
        <ControlledInput
          name="email"
          control={control}
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        
        <Button type="submit" className="w-full">
          Submit Form
        </Button>
      </form>
    </div>
  );
}
```

### Component Library Integration

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { FormField } from './FormField';
export { Layout } from './Layout';

// lib/tailwind-config.ts
export const tailwindTheme = {
  colors: {
    primary: {
      50: 'rgb(var(--color-primary-50) / <alpha-value>)',
      500: 'rgb(var(--color-primary-500) / <alpha-value>)',
      900: 'rgb(var(--color-primary-900) / <alpha-value>)',
    },
  },
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  },
};

// Usage in component library
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        '--color-primary-50': '239 246 255',
        '--color-primary-500': '59 130 246',
        '--color-primary-900': '30 58 138',
        '--spacing-xs': '0.5rem',
        '--spacing-sm': '1rem',
        '--spacing-md': '1.5rem',
        '--spacing-lg': '2rem',
        '--spacing-xl': '3rem',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
```

Tailwind CSS v4 represents a significant advancement in utility-first CSS frameworks, offering improved performance, modern web platform features, and enhanced developer experience. Its CSS-first configuration and native variable support make it ideal for building scalable, maintainable design systems in 2025.