# Project Guidelines for Content Posts

## Post Format
All posts should be placed in the `src/posts` directory with the following format:

```markdown
---
title: Your Post Title
description: A brief description of your post (150-160 characters recommended)
imageUrl: /images/your-image.jpg
tags: ['tag1', 'tag2', 'tag3']
category: category-name
type: post
format: markdown
createdAt: '2024-12-16T00:00:00Z'
updatedAt: '2024-12-16T00:00:00Z'
---

Your content here...
```

## File Naming
- Use the post's slug as the filename
- Files can have either `.md` or `.html` extension
- Use lowercase letters, numbers, and hyphens only
- Examples: 
  - `how-to-invest-in-stocks.md`
  - `pricing-plans.html`

## Metadata Fields (Required)
All posts (both `.md` and `.html`) must include the following metadata in the frontmatter section:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| title | string | The post title | "How to Invest in Stocks" |
| description | string | Brief description (150-160 chars) | "Learn the basics of stock investment..." |
| imageUrl | string | URL to the post's featured image | "/images/stock-investment.jpg" |
| tags | string[] | Array of relevant tags | ["investment", "stocks"] |
| category | string | Post category | "investment" |
| type | string | Type of content ('post' or 'page') | "post" |
| format | string | Content format ('markdown' or 'html') | "markdown" |
| createdAt | string | Creation date (ISO format) | "2024-12-16T00:00:00Z" |
| updatedAt | string | Last update date (ISO format) | "2024-12-16T00:00:00Z" |

## Content Guidelines

### Markdown Format
For posts with `format: markdown`:
- Use standard markdown syntax
- Headers should start from h2 (##)
- Use code blocks with language specification
- Include images with alt text
- Use relative links for internal references

### HTML Format
For posts with `format: html`:
- Must include frontmatter section just like markdown files
- Frontmatter must be placed at the top of the file between `---` markers
- Content starts after the closing `---` marker
- Frontend supports Tailwind CSS v3.x
- Use semantic HTML5 elements
- Follow Tailwind CSS best practices
- Common components available:
  - Buttons: `class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"`
  - Cards: `class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5"`
  - Headers: `class="text-base font-semibold leading-7 text-indigo-600"`
  - Containers: `class="mx-auto max-w-7xl px-6 lg:px-8"`
- Responsive design patterns:
  - Mobile first
  - Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
  - Standard breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px

### Common UI Patterns

#### Pricing Table Guidelines
For pricing tables, follow these specific guidelines:
- Use a consistent card structure for all pricing tiers
- Highlight the recommended/popular plan
- Ensure clear visual hierarchy
- Make CTAs prominent and distinctive

Example pricing table structure:
```html
<div class="grid gap-8 lg:grid-cols-3">
  <!-- Pricing Card -->
  <div class="relative rounded-2xl border p-8 shadow-sm">
    <div class="flex flex-col">
      <h3 class="text-xl font-semibold text-gray-900">Basic Plan</h3>
      <p class="mt-4 text-sm text-gray-500">Perfect for getting started</p>
      <div class="mt-6">
        <span class="text-4xl font-bold">$29</span>
        <span class="text-gray-500">/month</span>
      </div>
      <!-- Features List -->
      <ul class="mt-8 space-y-4">
        <li class="flex items-center">
          <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          <span class="ml-3 text-gray-700">Feature description</span>
        </li>
      </ul>
      <!-- CTA Button -->
      <a href="#" class="mt-8 block w-full rounded-md bg-indigo-600 px-6 py-4 text-center text-sm font-semibold text-white hover:bg-indigo-500">
        Get Started
      </a>
    </div>
  </div>
</div>
```

### Best Practices for Content Layout
- Use consistent spacing with Tailwind's spacing scale
- Maintain readable line lengths (max-w-prose for text content)
- Implement proper heading hierarchy
- Ensure sufficient color contrast (WCAG 2.1 compliant)
- Use semantic HTML elements appropriately

### Mobile Responsiveness Guidelines
- Test layouts at all breakpoints
- Adjust font sizes using responsive modifiers
- Consider touch targets (min 44x44px)
- Optimize images for different screen sizes
- Use appropriate padding for mobile viewports

### Example HTML Post
```html
---
title: Pricing Plans
description: Explore our flexible pricing plans designed to meet your financial needs
imageUrl: /images/pricing-banner.jpg
tags: ['pricing', 'plans', 'subscription']
category: product
type: page
format: html
createdAt: '2024-12-16T00:00:00Z'
updatedAt: '2024-12-16T00:00:00Z'
---

<div class="bg-gradient-to-b from-indigo-50 to-white">
  <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
    <!-- Your HTML content here -->
  </div>
</div>
```

### Example HTML Component
```html
<!-- Feature Card -->
<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
  <div class="flex items-center gap-x-3">
    <svg class="h-6 w-6 text-indigo-600"></svg>
    <h3 class="text-base font-semibold leading-7 text-gray-900">Feature Title</h3>
  </div>
  <p class="mt-4 text-base leading-7 text-gray-600">Feature description goes here...</p>
</div>

<!-- Action Button -->
<button class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
  Click me
</button>
```

## Categories
Available categories:
- product: Product features and pricing
- technical: Technical documentation and status
- legal: Legal documents and policies
- company: Company information
- guide: User guides and tutorials
- support: Help and support articles

## Tags
- Use lowercase letters and hyphens
- Keep tags concise and relevant
- Use Vietnamese for local audience
- Maximum 5 tags per post

## Images
- Store images in `/public/images/`
- Use descriptive filenames
- Optimize for web (compress, correct dimensions)
- Recommended sizes:
  - Featured: 1200x630px
  - In-content: 800x600px
  - Thumbnails: 400x300px
