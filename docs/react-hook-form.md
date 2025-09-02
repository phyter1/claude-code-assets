# React Hook Form - Performant Forms with Easy Validation

A performant, flexible, and extensible form library for React and React Native with easy validation. React Hook Form reduces the amount of code you need to write while removing unnecessary re-renders.

## Core Concepts and Philosophy

- **Performance**: Minimizes re-renders and improves performance
- **Developer Experience**: Intuitive API with minimal learning curve
- **HTML Standard**: Leverages existing HTML form validation
- **Uncontrolled Components**: Reduces component re-renders
- **TypeScript**: First-class TypeScript support
- **Small Bundle Size**: Just 8.6kB minified and gzipped

## Installation and Setup

### Basic Installation

```bash
npm install react-hook-form
```

### Optional Validation Libraries

```bash
# For schema validation
npm install @hookform/resolvers zod
# or
npm install @hookform/resolvers yup
```

### Basic Setup

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="First Name" />
      <input {...register('lastName')} placeholder="Last Name" />
      <input {...register('email')} placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Key API Methods and Patterns

### Form Registration and Validation

**Basic Registration with Validation**
```typescript
import { useForm } from 'react-hook-form';

interface UserForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  terms: boolean;
}

function UserRegistrationForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 0,
      terms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: UserForm) => {
    try {
      await registerUser(data);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
          })}
          placeholder="Username"
        />
        {errors.username && (
          <span className="error">{errors.username.message}</span>
        )}
      </div>

      <div>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email format',
            },
          })}
          type="email"
          placeholder="Email"
        />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>

      <div>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          type="password"
          placeholder="Password"
        />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>

      <div>
        <input
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
          type="password"
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword.message}</span>
        )}
      </div>

      <div>
        <input
          {...register('age', {
            required: 'Age is required',
            min: {
              value: 18,
              message: 'Must be at least 18 years old',
            },
            max: {
              value: 100,
              message: 'Age must be less than 100',
            },
          })}
          type="number"
          placeholder="Age"
        />
        {errors.age && (
          <span className="error">{errors.age.message}</span>
        )}
      </div>

      <div>
        <input
          {...register('terms', {
            required: 'You must accept the terms and conditions',
          })}
          type="checkbox"
        />
        <label>I accept the terms and conditions</label>
        {errors.terms && (
          <span className="error">{errors.terms.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### Advanced Form Patterns

**Dynamic Form Fields**
```typescript
import { useForm, useFieldArray } from 'react-hook-form';

interface Contact {
  name: string;
  email: string;
}

interface ContactForm {
  contacts: Contact[];
}

function DynamicContactForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    defaultValues: {
      contacts: [{ name: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  const onSubmit = (data: ContactForm) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id} className="contact-group">
          <input
            {...register(`contacts.${index}.name`, {
              required: 'Name is required',
            })}
            placeholder="Name"
          />
          {errors.contacts?.[index]?.name && (
            <span className="error">
              {errors.contacts[index]?.name?.message}
            </span>
          )}

          <input
            {...register(`contacts.${index}.email`, {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email format',
              },
            })}
            placeholder="Email"
            type="email"
          />
          {errors.contacts?.[index]?.email && (
            <span className="error">
              {errors.contacts[index]?.email?.message}
            </span>
          )}

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: '', email: '' })}
      >
        Add Contact
      </button>

      <button type="submit">Submit</button>
    </form>
  );
}
```

**Nested Form Objects**
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  address: Address;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

function NestedForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfile>({
    defaultValues: {
      firstName: '',
      lastName: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      preferences: {
        newsletter: false,
        notifications: true,
      },
    },
  });

  const onSubmit = (data: UserProfile) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section>
        <h3>Personal Information</h3>
        <input
          {...register('firstName', { required: 'First name is required' })}
          placeholder="First Name"
        />
        {errors.firstName && (
          <span className="error">{errors.firstName.message}</span>
        )}

        <input
          {...register('lastName', { required: 'Last name is required' })}
          placeholder="Last Name"
        />
        {errors.lastName && (
          <span className="error">{errors.lastName.message}</span>
        )}
      </section>

      <section>
        <h3>Address</h3>
        <input
          {...register('address.street', { required: 'Street is required' })}
          placeholder="Street Address"
        />
        {errors.address?.street && (
          <span className="error">{errors.address.street.message}</span>
        )}

        <input
          {...register('address.city', { required: 'City is required' })}
          placeholder="City"
        />
        {errors.address?.city && (
          <span className="error">{errors.address.city.message}</span>
        )}

        <input
          {...register('address.state', { required: 'State is required' })}
          placeholder="State"
        />
        {errors.address?.state && (
          <span className="error">{errors.address.state.message}</span>
        )}

        <input
          {...register('address.zipCode', {
            required: 'ZIP code is required',
            pattern: {
              value: /^\d{5}(-\d{4})?$/,
              message: 'Invalid ZIP code format',
            },
          })}
          placeholder="ZIP Code"
        />
        {errors.address?.zipCode && (
          <span className="error">{errors.address.zipCode.message}</span>
        )}
      </section>

      <section>
        <h3>Preferences</h3>
        <label>
          <input
            {...register('preferences.newsletter')}
            type="checkbox"
          />
          Subscribe to newsletter
        </label>

        <label>
          <input
            {...register('preferences.notifications')}
            type="checkbox"
          />
          Enable notifications
        </label>
      </section>

      <button type="submit">Save Profile</button>
    </form>
  );
}
```

## TypeScript Usage Examples

### Schema Validation with Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18').max(100, 'Must be under 100'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

function ZodValidatedForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    // TypeScript knows the exact shape and validates at runtime
    await createUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('firstName')}
        placeholder="First Name"
      />
      {errors.firstName && (
        <span className="error">{errors.firstName.message}</span>
      )}

      <input
        {...register('lastName')}
        placeholder="Last Name"
      />
      {errors.lastName && (
        <span className="error">{errors.lastName.message}</span>
      )}

      <input
        {...register('email')}
        type="email"
        placeholder="Email"
      />
      {errors.email && (
        <span className="error">{errors.email.message}</span>
      )}

      <input
        {...register('age', { valueAsNumber: true })}
        type="number"
        placeholder="Age"
      />
      {errors.age && (
        <span className="error">{errors.age.message}</span>
      )}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
      />
      {errors.password && (
        <span className="error">{errors.password.message}</span>
      )}

      <input
        {...register('confirmPassword')}
        type="password"
        placeholder="Confirm Password"
      />
      {errors.confirmPassword && (
        <span className="error">{errors.confirmPassword.message}</span>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

### Custom Hooks and Reusable Patterns

```typescript
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Reusable form hook
function useTypedForm<TSchema extends z.ZodType>(
  schema: TSchema,
  defaultValues?: Partial<z.infer<TSchema>>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
}

// Custom validation hooks
function useAsyncValidation() {
  const validateEmailUnique = async (email: string) => {
    const response = await fetch(`/api/check-email?email=${email}`);
    const { isUnique } = await response.json();
    return isUnique || 'Email is already taken';
  };

  const validateUsernameUnique = async (username: string) => {
    const response = await fetch(`/api/check-username?username=${username}`);
    const { isUnique } = await response.json();
    return isUnique || 'Username is already taken';
  };

  return {
    validateEmailUnique,
    validateUsernameUnique,
  };
}

// Form component using custom hooks
const registrationSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

function RegistrationForm() {
  const { validateEmailUnique, validateUsernameUnique } = useAsyncValidation();
  
  const form = useTypedForm(registrationSchema, {
    username: '',
    email: '',
    password: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await registerUser(data);
    })}>
      <input
        {...register('username', {
          validate: validateUsernameUnique,
        })}
        placeholder="Username"
      />
      {errors.username && (
        <span className="error">{errors.username.message}</span>
      )}

      <input
        {...register('email', {
          validate: validateEmailUnique,
        })}
        type="email"
        placeholder="Email"
      />
      {errors.email && (
        <span className="error">{errors.email.message}</span>
      )}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
      />
      {errors.password && (
        <span className="error">{errors.password.message}</span>
      )}

      <button type="submit" disabled={isSubmitting}>
        Register
      </button>
    </form>
  );
}
```

## Best Practices and Common Patterns

### Error Handling and User Feedback

```typescript
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface LoginForm {
  email: string;
  password: string;
}

function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await login(data);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.field) {
          // Set field-specific error
          setError(errorData.field as keyof LoginForm, {
            type: 'server',
            message: errorData.message,
          });
        } else {
          // Set general server error
          setServerError(errorData.message);
        }
      } else {
        // Successful login
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div className="error-banner">{serverError}</div>
      )}

      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email format',
          },
        })}
        type="email"
        placeholder="Email"
        disabled={isLoading}
      />
      {errors.email && (
        <span className="error">{errors.email.message}</span>
      )}

      <input
        {...register('password', {
          required: 'Password is required',
        })}
        type="password"
        placeholder="Password"
        disabled={isLoading}
      />
      {errors.password && (
        <span className="error">{errors.password.message}</span>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Form State Management and Persistence

```typescript
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface DraftForm {
  title: string;
  content: string;
  tags: string[];
}

function DraftPostForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<DraftForm>({
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    },
  });

  const formData = watch();

  // Auto-save draft
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem('draft-post', JSON.stringify(formData));
        console.log('Draft saved');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData, isDirty]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft-post');
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      reset(draftData);
    }
  }, [reset]);

  const onSubmit = async (data: DraftForm) => {
    await publishPost(data);
    localStorage.removeItem('draft-post');
    reset();
  };

  const onSaveDraft = () => {
    localStorage.setItem('draft-post', JSON.stringify(formData));
    alert('Draft saved!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('title', { required: 'Title is required' })}
        placeholder="Post Title"
      />

      <textarea
        {...register('content', { required: 'Content is required' })}
        placeholder="Write your post content..."
        rows={10}
      />

      <input
        {...register('tags')}
        placeholder="Tags (comma separated)"
      />

      <div className="form-actions">
        <button type="button" onClick={onSaveDraft}>
          Save Draft
        </button>
        <button type="submit">Publish</button>
      </div>
    </form>
  );
}
```

### Conditional Fields and Dependencies

```typescript
import { useForm } from 'react-hook-form';

interface ShippingForm {
  shippingMethod: 'standard' | 'express' | 'overnight';
  address: string;
  city: string;
  expressDate?: string;
  overnightTime?: string;
  requiresSignature: boolean;
  signatureName?: string;
}

function ConditionalShippingForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingForm>();

  const shippingMethod = watch('shippingMethod');
  const requiresSignature = watch('requiresSignature');

  const onSubmit = (data: ShippingForm) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select
        {...register('shippingMethod', { required: 'Shipping method is required' })}
      >
        <option value="">Select shipping method</option>
        <option value="standard">Standard (5-7 days)</option>
        <option value="express">Express (2-3 days)</option>
        <option value="overnight">Overnight</option>
      </select>

      <input
        {...register('address', { required: 'Address is required' })}
        placeholder="Shipping Address"
      />

      <input
        {...register('city', { required: 'City is required' })}
        placeholder="City"
      />

      {shippingMethod === 'express' && (
        <input
          {...register('expressDate', { required: 'Preferred date is required for express shipping' })}
          type="date"
          min={new Date().toISOString().split('T')[0]}
        />
      )}

      {shippingMethod === 'overnight' && (
        <select
          {...register('overnightTime', { required: 'Time preference is required for overnight shipping' })}
        >
          <option value="">Select delivery time</option>
          <option value="morning">Before 10:30 AM</option>
          <option value="afternoon">Before 3:00 PM</option>
          <option value="evening">Before 8:00 PM</option>
        </select>
      )}

      <label>
        <input
          {...register('requiresSignature')}
          type="checkbox"
        />
        Signature required
      </label>

      {requiresSignature && (
        <input
          {...register('signatureName', { required: 'Signature name is required' })}
          placeholder="Name for signature"
        />
      )}

      <button type="submit">Submit Shipping Info</button>
    </form>
  );
}
```

## Integration with Other Tools

### Integration with UI Component Libraries

**With Material-UI**
```typescript
import { useForm, Controller } from 'react-hook-form';
import { TextField, Checkbox, FormControlLabel, Button } from '@mui/material';

interface MUIForm {
  name: string;
  email: string;
  subscribe: boolean;
}

function MaterialUIForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MUIForm>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Controller
        name="subscribe"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            label="Subscribe to newsletter"
          />
        )}
      />

      <Button type="submit" variant="contained" fullWidth>
        Submit
      </Button>
    </form>
  );
}
```

### Integration with React Query

```typescript
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreatePostForm {
  title: string;
  content: string;
  published: boolean;
}

function CreatePostForm() {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostForm>();

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostForm) => createPost(data),
    onSuccess: (newPost) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Optimistically update the cache
      queryClient.setQueryData(['posts'], (oldPosts: any[]) => [
        ...oldPosts,
        newPost,
      ]);
      
      reset(); // Reset form after successful submission
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('title', { required: 'Title is required' })}
        placeholder="Post Title"
        disabled={createPostMutation.isPending}
      />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea
        {...register('content', { required: 'Content is required' })}
        placeholder="Post Content"
        disabled={createPostMutation.isPending}
      />
      {errors.content && <span>{errors.content.message}</span>}

      <label>
        <input
          {...register('published')}
          type="checkbox"
          disabled={createPostMutation.isPending}
        />
        Publish immediately
      </label>

      <button 
        type="submit" 
        disabled={createPostMutation.isPending}
      >
        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
      </button>

      {createPostMutation.isError && (
        <div className="error">
          Error: {createPostMutation.error?.message}
        </div>
      )}
    </form>
  );
}
```

### Integration with Next.js

```typescript
// pages/api/users/create.ts (Pages Router)
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData = createUserSchema.parse(req.body);
    const user = await createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

// components/CreateUserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

type CreateUserData = z.infer<typeof createUserSchema>;

export function CreateUserForm() {
  const router = useRouter();
  
  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserData) => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/users');
      } else {
        const error = await response.json();
        console.error('Error creating user:', error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Advanced Validation Patterns

### Complex Conditional Validation
```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Dynamic validation based on user type
const createUserSchema = (userType: string) => {
  const baseSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    userType: z.enum(['individual', 'business', 'enterprise']),
  });

  if (userType === 'business' || userType === 'enterprise') {
    return baseSchema.extend({
      companyName: z.string().min(1, 'Company name is required'),
      taxId: z.string().regex(/^\d{9}$/, 'Tax ID must be 9 digits'),
      businessAddress: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
      }),
    });
  }

  if (userType === 'enterprise') {
    return baseSchema.extend({
      companyName: z.string().min(1, 'Company name is required'),
      taxId: z.string().regex(/^\d{9}$/, 'Tax ID must be 9 digits'),
      businessAddress: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
      }),
      annualRevenue: z.number().min(1000000, 'Annual revenue must be at least $1M'),
      employeeCount: z.number().min(50, 'Must have at least 50 employees'),
    });
  }

  return baseSchema;
};

function DynamicValidationForm() {
  const [userType, setUserType] = useState<'individual' | 'business' | 'enterprise'>('individual');
  
  const schema = useMemo(() => createUserSchema(userType), [userType]);
  
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const { register, handleSubmit, formState: { errors }, watch } = form;

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <select 
        {...register('userType')} 
        onChange={(e) => setUserType(e.target.value as any)}
      >
        <option value="individual">Individual</option>
        <option value="business">Business</option>
        <option value="enterprise">Enterprise</option>
      </select>

      <input {...register('name')} placeholder="Full Name" />
      {errors.name && <span className="error">{errors.name.message}</span>}

      <input {...register('email')} type="email" placeholder="Email" />
      {errors.email && <span className="error">{errors.email.message}</span>}

      {(userType === 'business' || userType === 'enterprise') && (
        <>
          <input {...register('companyName')} placeholder="Company Name" />
          {errors.companyName && <span className="error">{errors.companyName.message}</span>}

          <input {...register('taxId')} placeholder="Tax ID" />
          {errors.taxId && <span className="error">{errors.taxId.message}</span>}

          <fieldset>
            <legend>Business Address</legend>
            <input {...register('businessAddress.street')} placeholder="Street Address" />
            {errors.businessAddress?.street && <span className="error">{errors.businessAddress.street.message}</span>}

            <input {...register('businessAddress.city')} placeholder="City" />
            {errors.businessAddress?.city && <span className="error">{errors.businessAddress.city.message}</span>}

            <input {...register('businessAddress.state')} placeholder="State" />
            {errors.businessAddress?.state && <span className="error">{errors.businessAddress.state.message}</span>}

            <input {...register('businessAddress.zipCode')} placeholder="ZIP Code" />
            {errors.businessAddress?.zipCode && <span className="error">{errors.businessAddress.zipCode.message}</span>}
          </fieldset>
        </>
      )}

      {userType === 'enterprise' && (
        <>
          <input 
            {...register('annualRevenue', { valueAsNumber: true })} 
            type="number" 
            placeholder="Annual Revenue" 
          />
          {errors.annualRevenue && <span className="error">{errors.annualRevenue.message}</span>}

          <input 
            {...register('employeeCount', { valueAsNumber: true })} 
            type="number" 
            placeholder="Employee Count" 
          />
          {errors.employeeCount && <span className="error">{errors.employeeCount.message}</span>}
        </>
      )}

      <button type="submit">Create Account</button>
    </form>
  );
}
```

### File Upload with Validation
```typescript
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

// File validation schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported'
  );

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: fileSchema.optional(),
  documents: z.array(fileSchema).max(3, 'Maximum 3 files allowed'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function FileUploadForm() {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const avatarFile = watch('avatar');
  const documentFiles = watch('documents');

  // Generate preview URLs
  useEffect(() => {
    const newPreviews: { [key: string]: string } = {};

    if (avatarFile && avatarFile[0]) {
      newPreviews.avatar = URL.createObjectURL(avatarFile[0]);
    }

    if (documentFiles) {
      Array.from(documentFiles).forEach((file, index) => {
        newPreviews[`doc-${index}`] = URL.createObjectURL(file);
      });
    }

    setPreviews(newPreviews);

    // Cleanup URLs
    return () => {
      Object.values(newPreviews).forEach(URL.revokeObjectURL);
    };
  }, [avatarFile, documentFiles]);

  const onSubmit = async (data: ProfileFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.avatar?.[0]) {
      formData.append('avatar', data.avatar[0]);
    }

    if (data.documents) {
      Array.from(data.documents).forEach((file, index) => {
        formData.append(`document-${index}`, file);
      });
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      <div>
        <label>Avatar</label>
        <input 
          {...register('avatar')} 
          type="file" 
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
        />
        {errors.avatar && <span className="error">{errors.avatar.message}</span>}
        {previews.avatar && (
          <img src={previews.avatar} alt="Avatar preview" style={{ width: 100, height: 100 }} />
        )}
      </div>

      <div>
        <label>Documents (max 3)</label>
        <input 
          {...register('documents')} 
          type="file" 
          multiple 
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
        />
        {errors.documents && <span className="error">{errors.documents.message}</span>}
        <div style={{ display: 'flex', gap: '10px' }}>
          {documentFiles && Array.from(documentFiles).map((file, index) => (
            <div key={index}>
              <img 
                src={previews[`doc-${index}`]} 
                alt={`Document ${index + 1}`} 
                style={{ width: 50, height: 50 }} 
              />
              <p>{file.name}</p>
            </div>
          ))}
        </div>
      </div>

      <button type="submit">Upload Profile</button>
    </form>
  );
}
```

### Multi-Step Forms with Validation
```typescript
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

// Step-by-step schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().min(1, 'Country is required'),
});

const preferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  newsletter: z.boolean(),
});

// Combined schema for final validation
const fullRegistrationSchema = personalInfoSchema.merge(addressSchema).merge(preferencesSchema);

type RegistrationData = z.infer<typeof fullRegistrationSchema>;

interface StepProps {
  data: Partial<RegistrationData>;
  onNext: (data: Partial<RegistrationData>) => void;
  onBack?: () => void;
}

// Step 1: Personal Information
function PersonalInfoStep({ onNext }: StepProps) {
  const methods = useForm({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: any) => {
    onNext(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <h2>Personal Information</h2>
        
        <div>
          <input {...methods.register('firstName')} placeholder="First Name" />
          {methods.formState.errors.firstName && (
            <span className="error">{methods.formState.errors.firstName.message}</span>
          )}
        </div>

        <div>
          <input {...methods.register('lastName')} placeholder="Last Name" />
          {methods.formState.errors.lastName && (
            <span className="error">{methods.formState.errors.lastName.message}</span>
          )}
        </div>

        <div>
          <input {...methods.register('email')} type="email" placeholder="Email" />
          {methods.formState.errors.email && (
            <span className="error">{methods.formState.errors.email.message}</span>
          )}
        </div>

        <div>
          <input {...methods.register('phone')} placeholder="Phone Number" />
          {methods.formState.errors.phone && (
            <span className="error">{methods.formState.errors.phone.message}</span>
          )}
        </div>

        <button type="submit">Next</button>
      </form>
    </FormProvider>
  );
}

// Step 2: Address Information
function AddressStep({ onNext, onBack }: StepProps) {
  const methods = useForm({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onNext)}>
        <h2>Address Information</h2>
        
        <div>
          <input {...methods.register('street')} placeholder="Street Address" />
          {methods.formState.errors.street && (
            <span className="error">{methods.formState.errors.street.message}</span>
          )}
        </div>

        <div>
          <input {...methods.register('city')} placeholder="City" />
          {methods.formState.errors.city && (
            <span className="error">{methods.formState.errors.city.message}</span>
          )}
        </div>

        <div>
          <input {...methods.register('state')} placeholder="State" />
          {methods.formState.errors.state && (
            <span className="error">{methods.formState.errors.state.message}</span>
          )}
        </div>

        <div>
          <input {...methods.register('zipCode')} placeholder="ZIP Code" />
          {methods.formState.errors.zipCode && (
            <span className="error">{methods.formState.errors.zipCode.message}</span>
          )}
        </div>

        <div>
          <select {...methods.register('country')}>
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
          </select>
          {methods.formState.errors.country && (
            <span className="error">{methods.formState.errors.country.message}</span>
          )}
        </div>

        <div>
          <button type="button" onClick={onBack}>Back</button>
          <button type="submit">Next</button>
        </div>
      </form>
    </FormProvider>
  );
}

// Step 3: Preferences
function PreferencesStep({ onNext, onBack }: StepProps) {
  const methods = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      interests: [],
      newsletter: false,
    },
  });

  const interests = ['Technology', 'Sports', 'Music', 'Travel', 'Food', 'Fashion'];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onNext)}>
        <h2>Preferences</h2>
        
        <fieldset>
          <legend>Notification Preferences</legend>
          <label>
            <input {...methods.register('notifications.email')} type="checkbox" />
            Email notifications
          </label>
          <label>
            <input {...methods.register('notifications.sms')} type="checkbox" />
            SMS notifications
          </label>
          <label>
            <input {...methods.register('notifications.push')} type="checkbox" />
            Push notifications
          </label>
        </fieldset>

        <fieldset>
          <legend>Interests</legend>
          {interests.map((interest) => (
            <label key={interest}>
              <input 
                {...methods.register('interests')} 
                type="checkbox" 
                value={interest} 
              />
              {interest}
            </label>
          ))}
          {methods.formState.errors.interests && (
            <span className="error">{methods.formState.errors.interests.message}</span>
          )}
        </fieldset>

        <label>
          <input {...methods.register('newsletter')} type="checkbox" />
          Subscribe to newsletter
        </label>

        <div>
          <button type="button" onClick={onBack}>Back</button>
          <button type="submit">Complete Registration</button>
        </div>
      </form>
    </FormProvider>
  );
}

// Main multi-step form component
function MultiStepRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({});

  const handleNext = (data: Partial<RegistrationData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (data: Partial<RegistrationData>) => {
    const finalData = { ...formData, ...data };
    
    try {
      // Validate all data with complete schema
      const validatedData = fullRegistrationSchema.parse(finalData);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        alert('Registration successful!');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="multi-step-form">
      {/* Progress indicator */}
      <div className="progress-bar">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Personal Info</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Address</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Preferences</div>
      </div>

      {currentStep === 1 && (
        <PersonalInfoStep data={formData} onNext={handleNext} />
      )}
      
      {currentStep === 2 && (
        <AddressStep data={formData} onNext={handleNext} onBack={handleBack} />
      )}
      
      {currentStep === 3 && (
        <PreferencesStep data={formData} onNext={handleSubmit} onBack={handleBack} />
      )}
    </div>
  );
}
```

## Performance Optimization

### Form Performance with React.memo and useCallback
```typescript
import React, { memo, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

// Memoized input component to prevent unnecessary re-renders
const MemoizedInput = memo<{
  name: string;
  register: any;
  error?: any;
  placeholder: string;
}>(({ name, register, error, placeholder }) => {
  return (
    <div>
      <input {...register(name)} placeholder={placeholder} />
      {error && <span className="error">{error.message}</span>}
    </div>
  );
});

// Optimized form with selective subscriptions
function OptimizedLargeForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur', // Only validate on blur to reduce re-renders
    defaultValues: {
      personalInfo: { firstName: '', lastName: '', email: '' },
      preferences: { newsletter: false, theme: 'light' },
    },
  });

  // Only watch specific fields that affect conditional rendering
  const newsletter = useWatch({ control, name: 'preferences.newsletter' });
  const theme = useWatch({ control, name: 'preferences.theme' });

  // Memoize expensive calculations
  const dynamicStyles = useMemo(() => ({
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    color: theme === 'dark' ? '#fff' : '#333',
  }), [theme]);

  const onSubmit = useCallback(async (data: any) => {
    console.log('Form data:', data);
    // Handle form submission
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={dynamicStyles}>
      <fieldset>
        <legend>Personal Information</legend>
        <MemoizedInput
          name="personalInfo.firstName"
          register={register}
          error={errors.personalInfo?.firstName}
          placeholder="First Name"
        />
        <MemoizedInput
          name="personalInfo.lastName"
          register={register}
          error={errors.personalInfo?.lastName}
          placeholder="Last Name"
        />
        <MemoizedInput
          name="personalInfo.email"
          register={register}
          error={errors.personalInfo?.email}
          placeholder="Email"
        />
      </fieldset>

      <fieldset>
        <legend>Preferences</legend>
        <label>
          <input {...register('preferences.newsletter')} type="checkbox" />
          Subscribe to newsletter
        </label>

        {newsletter && (
          <div>
            <label>Newsletter frequency:</label>
            <select {...register('preferences.frequency')}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <label>
          Theme:
          <select {...register('preferences.theme')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Debounced Validation
```typescript
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useState, useEffect } from 'react';

function useAsyncValidationWithDebounce() {
  const [isValidating, setIsValidating] = useState<{ [key: string]: boolean }>({});

  const validateEmailUnique = async (email: string) => {
    if (!email || !email.includes('@')) return true;

    setIsValidating(prev => ({ ...prev, email: true }));
    
    try {
      const response = await fetch(`/api/validate-email?email=${encodeURIComponent(email)}`);
      const { isUnique } = await response.json();
      return isUnique || 'Email is already registered';
    } catch (error) {
      return 'Unable to validate email';
    } finally {
      setIsValidating(prev => ({ ...prev, email: false }));
    }
  };

  const validateUsernameUnique = async (username: string) => {
    if (!username || username.length < 3) return true;

    setIsValidating(prev => ({ ...prev, username: true }));
    
    try {
      const response = await fetch(`/api/validate-username?username=${encodeURIComponent(username)}`);
      const { isUnique } = await response.json();
      return isUnique || 'Username is already taken';
    } catch (error) {
      return 'Unable to validate username';
    } finally {
      setIsValidating(prev => ({ ...prev, username: false }));
    }
  };

  return {
    validateEmailUnique,
    validateUsernameUnique,
    isValidating,
  };
}

function DebouncedValidationForm() {
  const { validateEmailUnique, validateUsernameUnique, isValidating } = useAsyncValidationWithDebounce();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  const watchedEmail = watch('email');
  const watchedUsername = watch('username');

  // Debounce the watched values
  const [debouncedEmail] = useDebounce(watchedEmail, 500);
  const [debouncedUsername] = useDebounce(watchedUsername, 500);

  // Trigger validation when debounced values change
  useEffect(() => {
    if (debouncedEmail && debouncedEmail !== watchedEmail) {
      validateEmailUnique(debouncedEmail);
    }
  }, [debouncedEmail, validateEmailUnique, watchedEmail]);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername !== watchedUsername) {
      validateUsernameUnique(debouncedUsername);
    }
  }, [debouncedUsername, validateUsernameUnique, watchedUsername]);

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <input
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 3, message: 'Username must be at least 3 characters' },
            validate: validateUsernameUnique,
          })}
          placeholder="Username"
        />
        {isValidating.username && <span>Checking availability...</span>}
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      <div>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' },
            validate: validateEmailUnique,
          })}
          type="email"
          placeholder="Email"
        />
        {isValidating.email && <span>Validating email...</span>}
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
```

## Error Boundaries and Recovery

### Form Error Boundary
```typescript
import React, { Component, ReactNode } from 'react';
import { useForm } from 'react-hook-form';

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class FormErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  FormErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form Error:', error, errorInfo);
    
    // Send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // sendToErrorReportingService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="form-error-boundary">
            <h2>Something went wrong with the form</h2>
            <p>Please refresh the page and try again.</p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1rem' }}>
                <summary>Error Details</summary>
                <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage with form
function SafeForm() {
  return (
    <FormErrorBoundary>
      <ComplexForm />
    </FormErrorBoundary>
  );
}
```

### Form State Recovery
```typescript
import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';

function useFormPersistence<T>(key: string, defaultValues?: T) {
  const [savedData, setSavedData] = useState<T | null>(null);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setSavedData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
  }, [key]);

  const saveFormData = useCallback((data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [key]);

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setSavedData(null);
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
    }
  }, [key]);

  return {
    savedData: savedData || defaultValues,
    saveFormData,
    clearSavedData,
  };
}

function PersistentForm() {
  const { savedData, saveFormData, clearSavedData } = useFormPersistence('contact-form', {
    name: '',
    email: '',
    message: '',
  });

  const form = useForm({
    defaultValues: savedData,
  });

  const { register, handleSubmit, watch, reset } = form;
  const watchedValues = watch();

  // Auto-save form data
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormData(watchedValues);
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues, saveFormData]);

  const onSubmit = async (data: any) => {
    try {
      await submitContactForm(data);
      clearSavedData();
      reset();
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Failed to submit form. Your data has been saved.');
    }
  };

  return (
    <div>
      {savedData && Object.values(savedData).some(value => value) && (
        <div className="saved-data-notice">
          <p>We found some previously entered data. Would you like to restore it?</p>
          <button onClick={() => reset(savedData)}>Restore Data</button>
          <button onClick={clearSavedData}>Clear Saved Data</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('name')} placeholder="Name" />
        <input {...register('email')} type="email" placeholder="Email" />
        <textarea {...register('message')} placeholder="Message" rows={4} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
```

## Testing Strategies

### Unit Testing Forms
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  it('should render all form fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('should show email validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger onBlur validation
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<ContactForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Message'), 'Hello world');
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
    });
  });

  it('should handle async validation errors', async () => {
    const user = userEvent.setup();
    
    // Mock API call that returns email already exists
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ isUnique: false }),
      })
    ) as any;
    
    render(<ContactForm />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'existing@example.com');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('Email is already registered')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { RegistrationForm } from './RegistrationForm';

// Setup MSW server
const server = setupServer(
  rest.post('/api/register', (req, res, ctx) => {
    return res(ctx.json({ success: true, userId: 123 }));
  }),
  
  rest.get('/api/validate-email', (req, res, ctx) => {
    const email = req.url.searchParams.get('email');
    const isUnique = email !== 'existing@example.com';
    return res(ctx.json({ isUnique }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RegistrationForm Integration', () => {
  it('should complete full registration flow', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    // Fill out the form
    await user.type(screen.getByPlaceholderText('First Name'), 'John');
    await user.type(screen.getByPlaceholderText('Last Name'), 'Doe');
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'Password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });
  });

  it('should handle server errors gracefully', async () => {
    server.use(
      rest.post('/api/register', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ 
          message: 'Email already exists',
          field: 'email'
        }));
      })
    );

    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    // Fill and submit form
    await user.type(screen.getByPlaceholderText('Email'), 'existing@example.com');
    // ... fill other fields
    await user.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });
});
```

React Hook Form provides a powerful, performant solution for handling forms in React applications. With advanced validation patterns, file upload capabilities, multi-step forms, performance optimizations, error recovery mechanisms, and comprehensive testing strategies, it's the ideal choice for building complex, production-ready forms in modern React applications.