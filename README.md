# 🛍️ Website E-commerce

Modern e-commerce platform built with Node.js, Express, and Supabase.

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)

## 📋 Features

- ✅ Product catalog with categories (iPhone, iPad, Mac, Watch)
- ✅ Shopping cart with localStorage persistence
- ✅ Checkout flow with multiple payment methods
- ✅ Admin panel for order management
- ✅ Client & Server-side validation
- ✅ Supabase backend integration
- ✅ Responsive design
- ✅ Automated testing with Jest

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run validate` | Check JavaScript syntax |
| `npm run check` | Run validation + tests |

## 🏗️ Project Structure

```
Website/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── backend/
│   ├── server.js           # Express server
│   ├── routes/
│   │   └── admin.js        # Admin API routes
│   └── database/
│       └── schema.sql      # Database schema
├── frontend/
│   ├── *.html              # HTML pages
│   ├── scripts/            # JavaScript modules
│   └── styles/             # CSS stylesheets
├── __tests__/              # Jest test files
├── docs/                   # Documentation
├── .env.example            # Environment variables template
├── package.json            # Dependencies
└── jest.config.js          # Jest configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
NODE_ENV=development
```

### Database Setup

1. Create a Supabase project
2. Run the schema from `backend/database/schema.sql`
3. Update `.env` with your Supabase credentials

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- backend-complete
```

Generate coverage report:
```bash
npm run test:coverage
```

## 🚢 CI/CD Pipeline

The project includes a GitHub Actions workflow that:

- ✅ Runs tests on Node.js 18.x and 20.x
- ✅ Validates JavaScript syntax
- ✅ Performs security audit
- ✅ Uploads coverage reports
- ✅ Checks for outdated packages

### Setup GitHub Actions

1. Push your code to GitHub
2. The workflow runs automatically on push/PR to `main`, `master`, or `develop`
3. View results in the "Actions" tab

## 📝 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/history` - Get order history
- `POST /api/checkout` - Process checkout

### Admin
- `GET /admin/orders` - Get all orders (admin)
- `PATCH /admin/orders/:id` - Update order status
- `DELETE /admin/orders/:id` - Delete order

## 🔐 Security

- Server-side validation for all inputs
- Client-side validation for UX
- Environment variables for sensitive data
- CORS configuration
- Content Security Policy headers

## 🐛 Known Issues

- Apple Pay only works on HTTPS (use localhost for testing)
- Some older browsers may not support all features

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

