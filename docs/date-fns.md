# date-fns - Modern JavaScript Date Utility Library

A modern JavaScript date utility library providing the most comprehensive, yet simple and consistent toolset for manipulating JavaScript dates in a browser & Node.js environment.

## Core Concepts and Philosophy

- **Modular**: Pick only what you need, supports tree-shaking
- **Immutable**: Pure functions that always return new date instances
- **Type-Safe**: 100% TypeScript support with handcrafted types
- **Consistent**: Unified approach for all date manipulation operations
- **Internationalization**: Support for 100+ locales
- **Reliable**: Thoroughly tested with comprehensive test suite

## Installation and Setup

### Basic Installation

```bash
npm install date-fns
```

### TypeScript Setup

```typescript
// No additional setup needed - types are included
import { format, parseISO, addDays } from 'date-fns';
```

### Time Zone Support (v4 Feature)

```bash
# Install time zone package for advanced time zone support
npm install @date-fns/tz
```

```typescript
import { zonedTimeToUtc, utcToZonedTime } from '@date-fns/tz';
```

### Locale Setup

```typescript
// Import specific locales as needed
import { es, de, fr, ja } from 'date-fns/locale';
import { format } from 'date-fns';

const date = new Date();
console.log(format(date, 'PPP', { locale: es })); // Spanish
console.log(format(date, 'PPP', { locale: de })); // German
```

## Key API Methods and Patterns

### Date Creation and Parsing

```typescript
import { 
  parseISO, 
  parse, 
  parseJSON,
  fromUnixTime,
  startOfDay,
  endOfDay 
} from 'date-fns';

// Parse ISO strings
const date1 = parseISO('2023-10-15T14:30:00.000Z');

// Parse custom formats
const date2 = parse('2023-10-15 14:30:00', 'yyyy-MM-dd HH:mm:ss', new Date());

// Parse JSON dates
const date3 = parseJSON('2023-10-15T14:30:00.000Z');

// From Unix timestamp
const date4 = fromUnixTime(1697374200);

// Start and end of day
const today = new Date();
const startDay = startOfDay(today); // 00:00:00.000
const endDay = endOfDay(today);     // 23:59:59.999
```

### Date Formatting

```typescript
import { 
  format, 
  formatDistance, 
  formatDistanceToNow,
  formatRelative,
  formatDuration 
} from 'date-fns';
import { enUS } from 'date-fns/locale';

const now = new Date();
const pastDate = new Date('2023-01-15');

// Standard formatting
format(now, 'yyyy-MM-dd');           // "2025-01-15"
format(now, 'dd/MM/yyyy');           // "15/01/2025"
format(now, 'PPP');                  // "January 15th, 2025"
format(now, 'PPPP');                 // "Wednesday, January 15th, 2025"
format(now, 'p');                    // "2:30 PM"
format(now, 'Pp');                   // "Jan 15, 2025, 2:30 PM"

// Custom patterns
format(now, "EEEE, MMMM do, yyyy 'at' h:mm a"); 
// "Wednesday, January 15th, 2025 at 2:30 PM"

// Relative formatting
formatDistanceToNow(pastDate);       // "about 1 year ago"
formatDistance(pastDate, now);       // "about 1 year"
formatRelative(pastDate, now);       // "01/15/2023"

// Duration formatting
const duration = { hours: 2, minutes: 30, seconds: 15 };
formatDuration(duration);            // "2 hours 30 minutes 15 seconds"
formatDuration(duration, { format: ['hours', 'minutes'] }); // "2 hours 30 minutes"
```

### Date Arithmetic

```typescript
import { 
  add, 
  sub, 
  addDays, 
  addWeeks, 
  addMonths, 
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears
} from 'date-fns';

const baseDate = new Date('2025-01-15');

// Adding time
const futureDate1 = addDays(baseDate, 7);        // 7 days later
const futureDate2 = addWeeks(baseDate, 2);       // 2 weeks later
const futureDate3 = addMonths(baseDate, 3);      // 3 months later
const futureDate4 = addYears(baseDate, 1);       // 1 year later

// Complex additions
const futureDate5 = add(baseDate, {
  years: 1,
  months: 2,
  weeks: 3,
  days: 4,
  hours: 5,
  minutes: 6,
  seconds: 7
});

// Subtracting time
const pastDate1 = subDays(baseDate, 30);         // 30 days ago
const pastDate2 = sub(baseDate, { months: 6, days: 15 });

// Calculating differences
const diff1 = differenceInDays(futureDate1, baseDate);     // 7
const diff2 = differenceInMonths(futureDate3, baseDate);   // 3
const diff3 = differenceInYears(futureDate4, baseDate);    // 1
```

### Date Comparison and Validation

```typescript
import { 
  isAfter, 
  isBefore, 
  isEqual, 
  isSameDay, 
  isSameWeek,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  isValid,
  isPast,
  isFuture,
  isToday,
  isWeekend,
  isFirstDayOfMonth,
  isLastDayOfMonth
} from 'date-fns';

const date1 = new Date('2025-01-15');
const date2 = new Date('2025-01-20');
const now = new Date();

// Comparisons
isAfter(date2, date1);              // true
isBefore(date1, date2);             // true
isEqual(date1, new Date('2025-01-15')); // true

// Same period checks
isSameDay(date1, new Date('2025-01-15T10:00:00')); // true
isSameWeek(date1, date2);           // depends on week start
isSameMonth(date1, date2);          // true
isSameYear(date1, date2);           // true

// Interval checks
isWithinInterval(now, { start: date1, end: date2 });

// Validation and state checks
isValid(new Date('invalid'));       // false
isPast(date1);                      // depends on current date
isFuture(date2);                    // depends on current date
isToday(now);                       // true
isWeekend(date1);                   // depends on day of week

// Special day checks
isFirstDayOfMonth(new Date('2025-01-01')); // true
isLastDayOfMonth(new Date('2025-01-31'));  // true
```

### Date Boundaries and Ranges

```typescript
import { 
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval
} from 'date-fns';

const date = new Date('2025-01-15T14:30:00');

// Day boundaries
startOfDay(date);    // 2025-01-15T00:00:00.000
endOfDay(date);      // 2025-01-15T23:59:59.999

// Week boundaries (Sunday start by default)
startOfWeek(date);   // Sunday of that week
endOfWeek(date);     // Saturday of that week

// Week boundaries (Monday start)
startOfWeek(date, { weekStartsOn: 1 }); // Monday of that week
endOfWeek(date, { weekStartsOn: 1 });   // Sunday of that week

// Month boundaries
startOfMonth(date);  // 2025-01-01T00:00:00.000
endOfMonth(date);    // 2025-01-31T23:59:59.999

// Year boundaries
startOfYear(date);   // 2025-01-01T00:00:00.000
endOfYear(date);     // 2025-12-31T23:59:59.999

// Quarter boundaries
startOfQuarter(date); // 2025-01-01T00:00:00.000 (Q1)
endOfQuarter(date);   // 2025-03-31T23:59:59.999 (Q1)

// Generate date ranges
const start = new Date('2025-01-01');
const end = new Date('2025-01-07');

const days = eachDayOfInterval({ start, end });
// [2025-01-01, 2025-01-02, ..., 2025-01-07]

const weeks = eachWeekOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
const months = eachMonthOfInterval({ start: startOfYear(date), end: endOfYear(date) });
```

## TypeScript Usage Examples

### Type-Safe Date Functions

```typescript
import { 
  format, 
  parseISO, 
  isValid,
  formatDistanceToNow,
  type Locale 
} from 'date-fns';

// Type-safe date formatter function
function formatDate(
  date: Date | string, 
  pattern: string = 'PPP',
  locale?: Locale
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }
  
  return format(dateObj, pattern, { locale });
}

// Type-safe relative time formatter
function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Usage
const formatted = formatDate('2025-01-15T14:30:00Z', 'yyyy-MM-dd HH:mm');
const relative = formatRelativeTime(new Date());
```

### Date Range Utilities

```typescript
import { 
  isWithinInterval, 
  eachDayOfInterval, 
  startOfDay, 
  endOfDay,
  differenceInDays,
  type Interval 
} from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

class DateRangeUtil {
  private range: DateRange;

  constructor(start: Date | string, end: Date | string) {
    this.range = {
      start: typeof start === 'string' ? parseISO(start) : start,
      end: typeof end === 'string' ? parseISO(end) : end,
    };
  }

  // Check if date is within range
  contains(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isWithinInterval(dateObj, this.range);
  }

  // Get all days in range
  getDays(): Date[] {
    return eachDayOfInterval(this.range);
  }

  // Get range duration in days
  getDuration(): number {
    return differenceInDays(this.range.end, this.range.start);
  }

  // Get business days (Monday-Friday)
  getBusinessDays(): Date[] {
    return this.getDays().filter(date => {
      const day = date.getDay();
      return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
    });
  }

  // Split range into chunks
  splitIntoChunks(chunkSizeInDays: number): DateRange[] {
    const chunks: DateRange[] = [];
    const totalDays = this.getDuration();
    
    for (let i = 0; i < totalDays; i += chunkSizeInDays) {
      const chunkStart = addDays(this.range.start, i);
      const chunkEnd = addDays(chunkStart, Math.min(chunkSizeInDays - 1, totalDays - i - 1));
      
      chunks.push({
        start: startOfDay(chunkStart),
        end: endOfDay(chunkEnd),
      });
    }
    
    return chunks;
  }

  // Convert to interval object
  toInterval(): Interval {
    return this.range;
  }
}

// Usage
const range = new DateRangeUtil('2025-01-01', '2025-01-31');
console.log(range.contains('2025-01-15')); // true
console.log(range.getDuration());          // 30
console.log(range.getBusinessDays().length); // ~22 business days
```

### Locale-Aware Formatting

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { enUS, es, de, fr, ja, type Locale } from 'date-fns/locale';

type SupportedLocale = 'en' | 'es' | 'de' | 'fr' | 'ja';

const locales: Record<SupportedLocale, Locale> = {
  en: enUS,
  es: es,
  de: de,
  fr: fr,
  ja: ja,
};

interface FormatOptions {
  locale?: SupportedLocale;
  pattern?: string;
}

class InternationalDateFormatter {
  private defaultLocale: SupportedLocale;

  constructor(defaultLocale: SupportedLocale = 'en') {
    this.defaultLocale = defaultLocale;
  }

  format(date: Date | string, options?: FormatOptions): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const locale = locales[options?.locale || this.defaultLocale];
    const pattern = options?.pattern || 'PPP';

    return format(dateObj, pattern, { locale });
  }

  formatRelative(date: Date | string, options?: Pick<FormatOptions, 'locale'>): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const locale = locales[options?.locale || this.defaultLocale];

    return formatDistanceToNow(dateObj, { locale, addSuffix: true });
  }

  // Format for different contexts
  formatLong(date: Date | string, locale?: SupportedLocale): string {
    return this.format(date, { locale, pattern: 'PPPP' });
  }

  formatShort(date: Date | string, locale?: SupportedLocale): string {
    return this.format(date, { locale, pattern: 'P' });
  }

  formatTime(date: Date | string, locale?: SupportedLocale): string {
    return this.format(date, { locale, pattern: 'p' });
  }
}

// Usage
const formatter = new InternationalDateFormatter('en');
const date = new Date();

console.log(formatter.format(date));                    // English format
console.log(formatter.format(date, { locale: 'es' }));  // Spanish format
console.log(formatter.formatLong(date, 'de'));          // German long format
console.log(formatter.formatRelative(date, { locale: 'fr' })); // French relative
```

## Best Practices and Common Patterns

### Date Validation and Error Handling

```typescript
import { isValid, parseISO, format } from 'date-fns';

// Safe date parsing with validation
function safeParse(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Date formatter with fallbacks
function safeFormat(
  date: Date | string | null | undefined,
  pattern: string = 'PPP',
  fallback: string = 'Invalid date'
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return fallback;
    }
    
    return format(dateObj, pattern);
  } catch {
    return fallback;
  }
}

// Date range validator
function validateDateRange(start: Date | string, end: Date | string): {
  valid: boolean;
  error?: string;
} {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;

  if (!isValid(startDate)) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (!isValid(endDate)) {
    return { valid: false, error: 'Invalid end date' };
  }

  if (isAfter(startDate, endDate)) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true };
}

// Usage
const result1 = safeParse('2025-01-15');     // Valid Date object
const result2 = safeParse('invalid');        // null
const formatted = safeFormat(result1, 'yyyy-MM-dd'); // "2025-01-15"
```

### Performance Optimization Patterns

```typescript
import { format, startOfDay, endOfDay } from 'date-fns';

// Memoized date formatter
const formatCache = new Map<string, string>();

function memoizedFormat(date: Date, pattern: string): string {
  const key = `${date.getTime()}-${pattern}`;
  
  if (formatCache.has(key)) {
    return formatCache.get(key)!;
  }
  
  const formatted = format(date, pattern);
  formatCache.set(key, formatted);
  
  return formatted;
}

// Batch date operations
function processDates(dates: Date[], operations: Array<(date: Date) => Date>): Date[][] {
  return dates.map(date => 
    operations.map(operation => operation(date))
  );
}

// Usage
const dates = [new Date(), new Date('2025-01-15'), new Date('2025-12-31')];
const operations = [startOfDay, endOfDay];
const processed = processDates(dates, operations);

// Efficient date comparison
function createDateComparator<T>(
  keyExtractor: (item: T) => Date | string
) {
  return (a: T, b: T): number => {
    const dateA = typeof keyExtractor(a) === 'string' 
      ? parseISO(keyExtractor(a) as string)
      : keyExtractor(a) as Date;
    const dateB = typeof keyExtractor(b) === 'string'
      ? parseISO(keyExtractor(b) as string) 
      : keyExtractor(b) as Date;
    
    return dateA.getTime() - dateB.getTime();
  };
}

// Usage
interface Event {
  id: string;
  name: string;
  date: Date;
}

const events: Event[] = [
  { id: '1', name: 'Event 1', date: new Date('2025-01-15') },
  { id: '2', name: 'Event 2', date: new Date('2025-01-10') },
];

events.sort(createDateComparator(event => event.date));
```

### Business Logic Patterns

```typescript
import { 
  addBusinessDays, 
  isWeekend, 
  nextMonday, 
  previousFriday,
  getDay,
  addDays,
  isSameDay
} from 'date-fns';

// Business day calculator
class BusinessDayCalculator {
  private holidays: Set<string>;

  constructor(holidays: Date[] = []) {
    this.holidays = new Set(holidays.map(date => format(date, 'yyyy-MM-dd')));
  }

  addHoliday(date: Date): void {
    this.holidays.add(format(date, 'yyyy-MM-dd'));
  }

  isBusinessDay(date: Date): boolean {
    if (isWeekend(date)) return false;
    if (this.holidays.has(format(date, 'yyyy-MM-dd'))) return false;
    return true;
  }

  addBusinessDays(date: Date, amount: number): Date {
    let result = date;
    let remaining = Math.abs(amount);
    const direction = amount >= 0 ? 1 : -1;

    while (remaining > 0) {
      result = addDays(result, direction);
      
      if (this.isBusinessDay(result)) {
        remaining--;
      }
    }

    return result;
  }

  getBusinessDaysBetween(start: Date, end: Date): number {
    let current = startOfDay(start);
    const endDate = startOfDay(end);
    let count = 0;

    while (isBefore(current, endDate) || isSameDay(current, endDate)) {
      if (this.isBusinessDay(current)) {
        count++;
      }
      current = addDays(current, 1);
    }

    return count;
  }
}

// Age calculator
function calculateAge(birthDate: Date | string): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
} {
  const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
  const now = new Date();

  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, addYears(birth, years));
  const days = differenceInDays(now, addMonths(addYears(birth, years), months));
  const totalDays = differenceInDays(now, birth);

  return { years, months, days, totalDays };
}

// Working hours calculator
class WorkingHoursCalculator {
  constructor(
    private startHour: number = 9,    // 9 AM
    private endHour: number = 17,     // 5 PM
    private workDays: number[] = [1, 2, 3, 4, 5] // Monday-Friday
  ) {}

  isWorkingTime(date: Date): boolean {
    const day = getDay(date);
    const hour = date.getHours();
    
    return this.workDays.includes(day) && 
           hour >= this.startHour && 
           hour < this.endHour;
  }

  getNextWorkingTime(date: Date): Date {
    let result = new Date(date);

    while (!this.isWorkingTime(result)) {
      // If after hours, go to next day start
      if (result.getHours() >= this.endHour) {
        result = startOfDay(addDays(result, 1));
        result.setHours(this.startHour);
      }
      // If before hours, go to start of work day
      else if (result.getHours() < this.startHour) {
        result.setHours(this.startHour, 0, 0, 0);
      }
      // If weekend, go to next Monday
      else if (isWeekend(result)) {
        result = nextMonday(result);
        result.setHours(this.startHour, 0, 0, 0);
      }
      else {
        result = addDays(result, 1);
      }
    }

    return result;
  }
}

// Usage
const calculator = new BusinessDayCalculator([
  new Date('2025-01-01'), // New Year's Day
  new Date('2025-12-25'), // Christmas
]);

const workingHours = new WorkingHoursCalculator();
const age = calculateAge('1990-05-15');

console.log(calculator.isBusinessDay(new Date())); // true/false
console.log(workingHours.getNextWorkingTime(new Date()));
console.log(`Age: ${age.years} years, ${age.months} months, ${age.days} days`);
```

## Integration with Other Tools

### React Integration

```typescript
// hooks/useDateFormatter.ts
import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS, type Locale } from 'date-fns/locale';

export function useDateFormatter(locale: Locale = enUS) {
  const formatDate = (date: Date | string, pattern: string = 'PPP') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern, { locale });
  };

  const formatRelative = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { locale, addSuffix: true });
  };

  return { formatDate, formatRelative };
}

// hooks/useCurrentTime.ts
export function useCurrentTime(updateInterval: number = 1000) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  return currentTime;
}

// components/DateDisplay.tsx
interface DateDisplayProps {
  date: Date | string;
  format?: string;
  relative?: boolean;
  locale?: Locale;
}

export function DateDisplay({ 
  date, 
  format: pattern = 'PPP', 
  relative = false,
  locale 
}: DateDisplayProps) {
  const { formatDate, formatRelative } = useDateFormatter(locale);
  
  if (relative) {
    return <span>{formatRelative(date)}</span>;
  }
  
  return <span>{formatDate(date, pattern)}</span>;
}

// components/DateRangePicker.tsx
import { useState } from 'react';
import { startOfDay, endOfDay, isAfter } from 'date-fns';

interface DateRangePickerProps {
  onRangeChange: (start: Date, end: Date) => void;
  initialStart?: Date;
  initialEnd?: Date;
}

export function DateRangePicker({ 
  onRangeChange, 
  initialStart, 
  initialEnd 
}: DateRangePickerProps) {
  const [start, setStart] = useState<Date | null>(initialStart || null);
  const [end, setEnd] = useState<Date | null>(initialEnd || null);
  const [error, setError] = useState<string>('');

  const handleStartChange = (date: Date) => {
    setStart(date);
    setError('');
    
    if (end && isAfter(date, end)) {
      setError('Start date must be before end date');
      return;
    }
    
    if (date && end) {
      onRangeChange(startOfDay(date), endOfDay(end));
    }
  };

  const handleEndChange = (date: Date) => {
    setEnd(date);
    setError('');
    
    if (start && isAfter(start, date)) {
      setError('End date must be after start date');
      return;
    }
    
    if (start && date) {
      onRangeChange(startOfDay(start), endOfDay(date));
    }
  };

  return (
    <div className="date-range-picker">
      <input
        type="date"
        value={start ? format(start, 'yyyy-MM-dd') : ''}
        onChange={(e) => handleStartChange(new Date(e.target.value))}
      />
      <input
        type="date"
        value={end ? format(end, 'yyyy-MM-dd') : ''}
        onChange={(e) => handleEndChange(new Date(e.target.value))}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### API Integration

```typescript
// utils/api-dates.ts
import { format, parseISO, formatISO } from 'date-fns';

// Serialize dates for API requests
export function serializeDateForAPI(date: Date): string {
  return formatISO(date);
}

// Parse dates from API responses
export function parseDateFromAPI(dateString: string): Date {
  return parseISO(dateString);
}

// API client with date handling
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Automatically serialize dates in request data
  private serializeDates(obj: any): any {
    if (obj instanceof Date) {
      return serializeDateForAPI(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeDates(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.serializeDates(value);
      }
      return result;
    }
    
    return obj;
  }

  // Automatically parse dates in response data
  private parseDates(obj: any): any {
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return parseDateFromAPI(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.parseDates(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.parseDates(value);
      }
      return result;
    }
    
    return obj;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const serializedData = this.serializeDates(data);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serializedData),
    });
    
    const responseData = await response.json();
    return this.parseDates(responseData);
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    const data = await response.json();
    return this.parseDates(data);
  }
}

// Usage
const api = new APIClient('https://api.example.com');

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
}

// Dates are automatically serialized/parsed
const newEvent = await api.post<Event>('/events', {
  title: 'Meeting',
  startDate: new Date(),
  endDate: addHours(new Date(), 2),
});
```

### Form Validation Integration

```typescript
// With Zod
import { z } from 'zod';
import { isValid, parseISO, isFuture, isPast } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startDate: z.string()
    .refine(dateStr => isValid(parseISO(dateStr)), 'Invalid date format')
    .refine(dateStr => isFuture(parseISO(dateStr)), 'Start date must be in the future'),
  endDate: z.string()
    .refine(dateStr => isValid(parseISO(dateStr)), 'Invalid date format'),
}).refine(data => {
  const start = parseISO(data.startDate);
  const end = parseISO(data.endDate);
  return isAfter(end, start);
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// With React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function EventForm() {
  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    // Dates are validated and can be safely parsed
    const event = {
      ...data,
      startDate: parseISO(data.startDate),
      endDate: parseISO(data.endDate),
    };
    console.log(event);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} placeholder="Event title" />
      <input 
        {...form.register('startDate')} 
        type="datetime-local" 
      />
      <input 
        {...form.register('endDate')} 
        type="datetime-local" 
      />
      <button type="submit">Create Event</button>
    </form>
  );
}
```

date-fns provides a comprehensive, modular, and type-safe solution for date manipulation in JavaScript and TypeScript applications. Its pure function approach, excellent performance, and extensive feature set make it ideal for handling all date-related operations in modern web applications.