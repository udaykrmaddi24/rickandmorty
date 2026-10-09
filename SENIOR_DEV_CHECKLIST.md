# Senior Frontend Developer Checklist
## For Angular/TypeScript Projects

This is a comprehensive checklist to follow as a 7+ years experience engineer when working on ANY project or task. Use this to maintain senior-level code quality under time pressure.

---

## 🎯 PHASE 1: REQUIREMENTS & PLANNING (Before Writing Code)
**Time: 10-15 minutes for typical task**

### 1.1 Understand Requirements Completely
- [ ] Read requirements 2-3 times
- [ ] Write down EXACTLY what needs to be delivered (not assumptions)
- [ ] Identify required features vs. nice-to-have
- [ ] Ask clarifying questions if unclear
- [ ] Write down edge cases mentioned in requirements
- [ ] Check if there are examples or acceptance criteria

**Example:**
```
REQUIRED:
✓ Show character list
✓ Search by name
✓ Pagination
✓ Click character to see details
✓ Show character profile (name, species, gender, status, origin, location)
✓ Show episodes list for character
✓ Show unauthorized page (route guard)

NICE-TO-HAVE:
- Search episodes
- Favorite characters
- Advanced filtering

EDGE CASES:
- No results found
- API timeout
- User without admin access
- Single episode vs multiple episodes
```

### 1.2 Define Data Models First
- [ ] Write out ALL interfaces/types needed
- [ ] Map API responses to your interfaces
- [ ] Define component state interfaces
- [ ] Plan service method signatures with proper typing
- [ ] Do NOT use `any` during this phase

**Example (for Rick and Morty):**
```typescript
// models/character.model.ts
export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Male' | 'Female' | 'Genderless' | 'unknown';
  origin: Location;
  location: Location;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface Location {
  name: string;
  url: string;
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface CharacterListResponse {
  info: PaginationInfo;
  results: Character[];
}

export interface PaginationInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

// State management
export interface CharacterListState {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  error: AppError | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
}
```

### 1.3 Plan Architecture
- [ ] Decide on component structure
- [ ] Plan service layer
- [ ] Identify shared vs. feature-specific logic
- [ ] Plan state management approach
- [ ] Identify error handling strategy
- [ ] Plan accessibility requirements

**Typical structure:**
```
src/app/
├── models/                  # Data interfaces
│   ├── character.model.ts
│   ├── episode.model.ts
│   └── api.model.ts
├── services/               # Business logic
│   ├── character.service.ts
│   ├── auth.service.ts
│   └── error.service.ts
├── interceptors/           # HTTP interceptors
│   └── error.interceptor.ts
├── components/
│   ├── character-list/
│   ├── character-details/
│   ├── error-boundary/
│   └── loading-spinner/
├── guards/                 # Route guards
│   └── auth.guard.ts
└── utils/                  # Helper functions
    └── error-handler.ts
```

### 1.4 Time-Box Planning
- [ ] Estimate time for each major feature
- [ ] Plan what to cut if running over
- [ ] Build time for testing/cleanup into estimate
- [ ] Set hard stop time for moving to next feature

**Example time allocation (3-hour challenge):**
```
0:00-0:10  → Setup + models + service structure
0:10-0:50  → Character list (fetch, search, pagination)
0:50-1:30  → Character details (profile + episodes)
1:30-2:10  → Error states + loading states
2:10-2:40  → Testing + cleanup (remove logs, verify types)
2:40-3:00  → Final check
```

---

## 🏗️ PHASE 2: BUILD (Writing Code)

### 2.1 Models & Interfaces First (Not Code)
- [ ] Define ALL interfaces before any components
- [ ] Create models.ts or dedicated model files
- [ ] Do NOT inline types in components
- [ ] Export from central location
- [ ] Test interfaces against API response manually

**DO THIS FIRST:**
```typescript
// models/index.ts
export * from './character.model';
export * from './episode.model';
export * from './api.model';
```

### 2.2 Services Before Components
- [ ] Create service with all API methods typed
- [ ] Use proper RxJS patterns (Observable, signal, etc.)
- [ ] Add error handling in service
- [ ] NO business logic in components
- [ ] Service should be injectable and testable

**Service structure:**
```typescript
@Injectable({ providedIn: 'root' })
export class CharacterService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://rickandmortyapi.com/api';

  // Read-only signals for immutability
  private characterState = signal<Character | null>(null);
  character$ = this.characterState.asReadonly();

  // Proper typed methods
  getCharacters(page: number = 1): Observable<CharacterListResponse> {
    return this.http.get<CharacterListResponse>(
      `${this.API_URL}/character?page=${page}`
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  searchCharacters(name: string, page: number = 1): Observable<CharacterListResponse> {
    return this.http.get<CharacterListResponse>(
      `${this.API_URL}/character?name=${encodeURIComponent(name)}&page=${page}`
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getCharacterById(id: string): Observable<Character> {
    return this.http.get<Character>(`${this.API_URL}/character/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getEpisodes(ids: number[]): Observable<Episode | Episode[]> {
    const query = ids.join(',');
    return this.http.get<Episode | Episode[]>(
      `${this.API_URL}/episode/${query}`
    ).pipe(
      map(response => Array.isArray(response) ? response : [response]),
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error:', error);
    return throwError(() => ({
      code: error.status,
      message: error.statusText,
      userMessage: this.getHumanReadableErrorMessage(error.status)
    }));
  }

  private getHumanReadableErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please try again.';
      case 404:
        return 'Character not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
```

### 2.3 State Management (Component Level)
- [ ] Use signals for reactive state
- [ ] Use computed() for derived state
- [ ] Manage loading, error, data states separately
- [ ] Clear initialization of state
- [ ] No direct component property mutations

**State pattern in component:**
```typescript
export class CharacterListComponent implements OnInit, OnDestroy {
  private characterService = inject(CharacterService);
  private destroyRef = inject(DestroyRef);

  characters = signal<Character[]>([]);
  loading = signal(false);
  error = signal<AppError | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  searchQuery = signal('');

  hasCharacters = computed(() => this.characters().length > 0);
  showNoResults = computed(() => !this.loading() && !this.hasCharacters());

  ngOnInit() {
    this.loadCharacters();
    this.setupSearch();
  }

  private loadCharacters() {
    this.loading.set(true);
    this.error.set(null);

    const request$ = this.searchQuery()
      ? this.characterService.searchCharacters(this.searchQuery(), this.currentPage())
      : this.characterService.getCharacters(this.currentPage());

    request$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.characters.set(response.results);
        this.totalPages.set(response.info.pages);
        this.loading.set(false);
      },
      error: (err: AppError) => {
        this.error.set(err);
        this.characters.set([]);
        this.loading.set(false);
      }
    });
  }

  private setupSearch() {
    // Debounced search with proper cleanup
  }
}
```

### 2.4 Component Template Structure
- [ ] Separate concerns: loading, error, data
- [ ] Use @if, @for with proper logic
- [ ] No complex conditionals in template
- [ ] Use computed signals for display logic
- [ ] Semantic HTML (not divs for buttons)
- [ ] Proper accessibility attributes

**Template pattern:**
```html
<div class="character-list-container">
  @if (loading()) {
    <app-loading-spinner></app-loading-spinner>
  }

  @if (error() && !loading()) {
    <app-error-banner 
      [error]="error()" 
      (retry)="loadCharacters()">
    </app-error-banner>
  }

  @if (!loading() && !hasCharacters()) {
    <div class="empty-state" role="status" aria-live="polite">
      <p>No characters found. Try a different search.</p>
    </div>
  }

  @if (hasCharacters() && !loading()) {
    <div class="characters-grid">
      @for (char of characters(); track char.id) {
        <app-character-card 
          [character]="char" 
          (click)="navigateToDetails(char.id)"
          role="button"
          tabindex="0"
          [attr.aria-label]="'View details for ' + char.name">
        </app-character-card>
      }
    </div>

    <mat-paginator 
      [length]="totalPages() * 20" 
      [pageSize]="20"
      (page)="onPageChange($event)">
    </mat-paginator>
  }
</div>
```

### 2.5 Error Handling Pattern
- [ ] Create error service/utility
- [ ] Handle errors at service level
- [ ] Display user-friendly error messages in components
- [ ] Provide retry mechanism
- [ ] Log errors for debugging (to service/monitoring, not console in production)
- [ ] No silent failures

**Error handling:**
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const appError: AppError = {
          code: error.status.toString(),
          message: error.message,
          userMessage: this.getUserMessage(error)
        };
        return throwError(() => appError);
      })
    );
  }

  private getUserMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Network error. Please check your connection.';
    if (error.status === 404) return 'Resource not found.';
    if (error.status >= 500) return 'Server error. Please try again later.';
    return 'Something went wrong. Please try again.';
  }
}
```

### 2.6 Route Guards (If Required)
- [ ] Make guards realistic and testable
- [ ] Use proper auth service
- [ ] Handle unauthorized redirect
- [ ] Provide user feedback
- [ ] Type guard parameters

**Proper guard:**
```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  authService.setUnauthorizedMessage(
    'You need admin access to view this page'
  );

  return router.parseUrl('/access-denied');
};
```

### 2.7 RxJS Patterns
- [ ] Use takeUntilDestroyed for cleanup
- [ ] Combine search + pagination properly
- [ ] Debounce user input
- [ ] Use switchMap for cancellation
- [ ] Avoid memory leaks from subscriptions
- [ ] Handle edge cases (no results, errors, timing)

**Search + pagination pattern:**
```typescript
export class CharacterListComponent implements OnInit {
  private characterService = inject(CharacterService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  pageChange = new Subject<PageEvent>();

  ngOnInit() {
    merge(
      this.searchControl.valueChanges.pipe(
        debounceTime(400),
        tap(() => this.pageChange.next({ pageIndex: 0 } as PageEvent))
      ),
      this.pageChange
    ).pipe(
      startWith(null),
      switchMap(() => this.fetchCharacters()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => this.updateState(result));
  }

  private fetchCharacters(): Observable<CharacterListResponse> {
    const search = this.searchControl.value?.trim() || '';
    const page = this.currentPage();
    
    return (search 
      ? this.characterService.searchCharacters(search, page)
      : this.characterService.getCharacters(page)
    );
  }
}
```

---

## ✅ PHASE 3: POLISH & CLEANUP (Last 20 minutes)

### 3.1 Type Safety Audit
- [ ] Search entire codebase for `any`
- [ ] Replace with proper types
- [ ] If you're stuck, use `unknown` NOT `any`
- [ ] Add `// @ts-ignore` comments only as last resort with explanation
- [ ] Enable strict TypeScript settings

### 3.2 Code Hygiene
- [ ] Remove ALL console.log statements (except error service)
- [ ] Remove commented-out code
- [ ] Remove unused imports
- [ ] Remove unused variables
- [ ] Remove debug CSS/styles
- [ ] Check for TODO/FIXME comments (resolve or remove)

### 3.3 Template Validation
- [ ] Valid HTML (no divs inside tbody)
- [ ] Semantic HTML (button vs div for clickable)
- [ ] All content has proper nesting
- [ ] No broken conditionals
- [ ] Accessibility attributes present
- [ ] No debug text in templates

### 3.4 Accessibility Review
- [ ] Buttons are `<button>` or `<a>`, not `<div>`
- [ ] Images have alt text
- [ ] Labels on form inputs
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Color contrast adequate

### 3.5 Error State Verification
- [ ] All API calls have error handling
- [ ] User sees error message (not technical error)
- [ ] Retry option available
- [ ] App doesn't crash on API failure
- [ ] Error messages are clear and helpful

### 3.6 Naming & Code Review
- [ ] No abbreviations unless standard (e.g., `http`, `char` NOT OK unless established)
- [ ] camelCase for variables
- [ ] PascalCase for types/classes
- [ ] Descriptive names (characterListComponent NOT listComp)
- [ ] No typos in variable names
- [ ] Service names end with Service

### 3.7 Commit & Submission
- [ ] All files saved
- [ ] No broken imports
- [ ] Code compiles without errors
- [ ] No TypeScript warnings
- [ ] Test in browser (basic smoke test)
- [ ] Remove debug/test files
- [ ] Write meaningful commit message

---

## 🔴 PHASE 4: Hard Stops & Quality Gates

If you find ANY of these in your final code, STOP and fix:

### 4.1 Critical (Must Fix)
- [ ] `any` type used (except rare exceptions with comment)
- [ ] Console.log in production code (except service layer)
- [ ] Required features missing (check against requirement list)
- [ ] Invalid HTML structure
- [ ] Unhandled API errors
- [ ] Broken route navigation
- [ ] Missing image alt text
- [ ] Hardcoded magic strings/numbers

### 4.2 Important (Should Fix)
- [ ] Typos in variable/function names
- [ ] Unused imports
- [ ] Commented-out code
- [ ] TODO comments without context
- [ ] Vague error messages
- [ ] Missing accessibility labels
- [ ] No loading state
- [ ] No empty state

### 4.3 Nice-to-Have (If Time)
- [ ] Code comments explaining complex logic
- [ ] Unit tests
- [ ] Performance optimizations
- [ ] Advanced styling
- [ ] Animations

---

## 📋 PHASE 5: FINAL CHECKLIST (Before Submitting)

Use this exact checklist RIGHT before you commit/submit:

```
FUNCTIONALITY:
□ All required features work
□ Search works
□ Pagination works
□ Detail page shows all required info
□ Error states display
□ Loading states display
□ Empty states display
□ Route guards work

CODE QUALITY:
□ No `any` types (except with comment)
□ No console.log in components/services
□ No commented-out code
□ No unused imports
□ No typos in names
□ All functions have clear purpose
□ Service layer exists
□ Components are thin

TEMPLATES:
□ Valid HTML (test with validator)
□ Semantic HTML (button, link, form)
□ All content inside correct element types
□ No debug text
□ Proper accessibility (alt, aria-label)
□ Images have alt text

TYPES:
□ All interfaces defined
□ API responses properly typed
□ Component state typed
□ No implicit `any`
□ Service methods have return types

ERRORS:
□ All API errors caught
□ User-friendly messages shown
□ Retry mechanism available
□ No silent failures
□ Error logged for debugging

CLEANUP:
□ No console logs
□ No debug CSS
□ No unused variables
□ Imports organized
□ Files properly structured

ACCESSIBILITY:
□ Buttons are <button> or <a>
□ Images have alt text
□ Form inputs have labels
□ Interactive elements keyboard accessible
□ ARIA labels where needed
□ Color contrast sufficient
□ No flashy animations

FINAL:
□ Project builds without errors
□ No TypeScript warnings
□ Tested in browser
□ Meaningful commit messages
□ Ready to submit
```

---

## 🎯 WHAT THIS CHECKLIST PREVENTS

Following this prevents:

✅ `any` types sneaking into production
✅ Console logs left behind
✅ Missing required features
✅ Invalid HTML
✅ Unhandled errors
✅ Poor accessibility
✅ Messy code structure
✅ Unmaintainable codebase
✅ Technical debt from day 1

---

## 🚀 HOW TO USE THIS CHECKLIST

1. **Print it or bookmark it**
2. **Start with PHASE 1** before writing ANY code
3. **Use PHASE 2** as you build
4. **Do PHASE 3** in last 20 minutes
5. **Check PHASE 4** for hard stops and quality gates
6. **Run PHASE 5** before committing

This is how senior engineers maintain quality under time pressure.

It's not about working faster. It's about working smarter.

---

## 📌 REMEMBER

- You have 3 hours? Spend 15 mins on planning. It saves 45 mins later.
- Models first, code second. Typing FIRST prevents 30 mins of thrashing.
- Services before components. Separation saves refactoring later.
- Clean as you go. Don't leave cleanup for the end.
- One complete feature > three half-baked features
- Type safety isn't optional. It's professional engineering.
- No console.log in final code. Ever.
- Required features > Nice-to-have polish

This is what separates senior from junior in a time-boxed challenge.
