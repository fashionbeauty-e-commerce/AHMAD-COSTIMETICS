# 🤝 Contributing to Ahmad Costimetics

Thank you for considering contributing to our platform! This guide will help you get started.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- MongoDB Atlas account (or local MongoDB)
- Code editor (VS Code recommended)

### Setup

```bash
# 1. Fork the repository
# Click "Fork" on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/ahmad-costimetics.git
cd ahmad-costimetics

# 3. Install dependencies
npm install

# 4. Copy environment file
cp .env.example .env
# Edit .env with your credentials

# 5. Start development
npm run dev
```

---

## 📋 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/what-you-document
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes
Follow the coding standards (see below).

### 3. Test Your Changes
```bash
# Build the project
npm run build

# Lint your code
npm run lint

# Test mobile responsiveness
# Test in different browsers
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
# Format
git commit -m "type(scope): subject"

# Examples
git commit -m "feat(products): add bulk upload feature"
git commit -m "fix(cart): resolve quantity update issue"
git commit -m "docs(api): update authentication examples"
git commit -m "style(header): improve mobile responsiveness"
```

### Commit Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting)
- `refactor` - Code change that neither fixes bug nor adds feature
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Maintenance

### 5. Push to GitHub
```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to your fork on GitHub
- Click "New Pull Request"
- Fill in the PR template
- Wait for review

---

## 📐 Coding Standards

### TypeScript
```typescript
// ✅ DO: Use proper types
interface Product {
  id: string;
  name: string;
  price: number;
}

const product: Product = {
  id: '123',
  name: 'Shoe',
  price: 99.99
};

// ❌ DON'T: Use 'any'
const data: any = fetchData(); // Avoid

// ✅ DO: Use explicit return types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React Components
```tsx
// ✅ DO: Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}

// ❌ DON'T: Use class components (unless necessary)
```

### File Naming
```
✅ ProductCard.tsx       (Components - PascalCase)
✅ useCart.ts            (Hooks - camelCase with 'use' prefix)
✅ formatPrice.ts        (Utilities - camelCase)
✅ cloudinary.ts         (Services - camelCase)
✅ API.md                (Docs - UPPERCASE)
```

### Folder Structure
```
src/
├── components/         # Reusable components
├── pages/             # Page components
├── hooks/             # Custom hooks
├── services/          # API/external services
├── utils/             # Helper functions
├── types/             # TypeScript types
└── constants/         # Constants
```

### CSS/Tailwind
```tsx
// ✅ DO: Use Tailwind classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">

// ✅ DO: Mobile-first responsive
<div className="text-sm md:text-base lg:text-lg">

// ✅ DO: Group related classes
<button className="
  px-4 py-2 
  bg-purple-600 hover:bg-purple-700 
  text-white font-medium 
  rounded-lg shadow-md
  transition-colors
">

// ❌ DON'T: Mix inline styles with Tailwind
<div style={{ color: 'red' }} className="text-blue-500">
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (Chrome DevTools)
- [ ] Test on tablet
- [ ] Test slow network (Chrome DevTools)
- [ ] Test offline behavior
- [ ] Test as different user roles
- [ ] Test edge cases (empty states, errors)

### Component Testing
```typescript
// Example test structure (when tests are added)
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    // Test implementation
  });
  
  it('handles add to cart click', () => {
    // Test implementation
  });
});
```

---

## 📝 Pull Request Guidelines

### PR Title
Use the same format as commits:
```
feat(scope): add new feature
fix(scope): fix specific bug
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Changes
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Screenshots
(if UI changes)

## Testing
- [ ] Tested on Chrome
- [ ] Tested on mobile
- [ ] Tested with different user roles

## Related Issues
Closes #123
```

### PR Size
- **Small** (preferred): < 200 lines
- **Medium**: 200-500 lines
- **Large**: > 500 lines (split if possible)

### Review Process
1. Automated checks must pass
2. At least 1 approval required
3. All conversations resolved
4. Up-to-date with main branch
5. Squash and merge

---

## 🐛 Reporting Bugs

### Before Reporting
1. Check existing issues
2. Reproduce the bug
3. Try latest version

### Bug Report Template
```markdown
**Describe the bug**
A clear description.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen.

**Actual behavior**
What actually happens.

**Screenshots**
If applicable.

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 15]
- Version: [e.g., 1.0.0]

**Additional context**
Any other info.
```

---

## 💡 Suggesting Features

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem.

**Describe the solution**
What you'd like to happen.

**Describe alternatives**
Other solutions you've considered.

**Additional context**
Mockups, examples, etc.
```

---

## 📚 Documentation Standards

### Code Comments
```typescript
/**
 * Calculate the total price including tax and shipping.
 * 
 * @param items - Array of cart items
 * @param shipping - Shipping cost
 * @param taxRate - Tax rate (e.g., 0.08 for 8%)
 * @returns Total price in dollars
 * 
 * @example
 * const total = calculateTotal(items, 10, 0.08);
 */
function calculateTotal(items: Item[], shipping: number, taxRate: number): number {
  // Implementation
}
```

### README Updates
- Keep README.md up-to-date
- Add new features to feature list
- Update setup instructions if needed
- Add screenshots for major UI changes

---

## 🎯 Areas to Contribute

### Easy (Good First Issues)
- Fix typos in documentation
- Improve error messages
- Add missing alt text to images
- Update outdated dependencies

### Medium
- Add new product filters
- Implement keyboard shortcuts
- Add dark mode
- Improve mobile UX

### Advanced
- Add new payment gateway
- Implement multi-language support
- Add advanced analytics
- Optimize database queries

### Ongoing Needs
- 🌍 Translations
- 📚 Documentation
- 🐛 Bug fixes
- ✨ Feature implementations
- 🎨 UI improvements
- ⚡ Performance optimization
- ♿ Accessibility improvements

---

## 🎓 Learning Resources

### React
- [React Documentation](https://react.dev)
- [React Patterns](https://reactpatterns.com)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com)

### Backend
- [Express Guide](https://expressjs.com/guide.html)
- [Mongoose Docs](https://mongoosejs.com/docs/)

---

## 📞 Getting Help

- **Discord**: (Coming soon)
- **GitHub Discussions**: For general questions
- **Email**: dev@ahmadcostimetics.com
- **Documentation**: Check `/docs` folder

---

## 🏆 Recognition

Contributors will be:
- Added to README.md contributors section
- Mentioned in release notes
- Given credit in commit history

### Top Contributors Hall of Fame
*(Will be updated as contributions come in)*

---

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience
- Nationality, personal appearance
- Race, religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors**:
- ✅ Welcoming and inclusive language
- ✅ Respecting differing viewpoints
- ✅ Gracefully accepting feedback
- ✅ Focusing on community benefit
- ✅ Showing empathy

**Unacceptable behaviors**:
- ❌ Sexualized language or imagery
- ❌ Trolling, insulting comments, personal attacks
- ❌ Public or private harassment
- ❌ Publishing others' private information
- ❌ Other unprofessional conduct

### Enforcement
Project maintainers will:
- Remove offensive content
- Ban contributors who violate code of conduct
- Take appropriate action

Report violations to: conduct@ahmadcostimetics.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes this project better. Thank you for taking the time to contribute!

---

**Questions?** Open a discussion or email us!

**Last Updated**: June 2026
