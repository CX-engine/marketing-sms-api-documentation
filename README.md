# SMS Marketing API Documentation

[![API Version](https://img.shields.io/badge/API-v1.0.0-blue.svg)](https://github.com/CX-engine/marketing-sms-api-documentation)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](./sms-marketing-api-openapi.yaml)
[![Documentation](https://img.shields.io/badge/Docs-Live-brightgreen.svg)](https://cx-engine.github.io/marketing-sms-api-documentation)

Comprehensive documentation for the CX Engine SMS Marketing API, including OpenAPI specification and interactive documentation website.

## 🚀 Quick Start

### View Documentation
- **Live Documentation**: [https://cx-engine.github.io/marketing-sms-api-documentation](https://cx-engine.github.io/marketing-sms-api-documentation)
- **OpenAPI Spec**: [sms-marketing-api-openapi.yaml](./sms-marketing-api-openapi.yaml)

### API Base URLs
- **Production**: `https://api.your-domain.com/api`
- **Staging**: `https://staging-api.your-domain.com/api`

## 📋 Contents

### 1. OpenAPI Specification
- **File**: [`sms-marketing-api-openapi.yaml`](./sms-marketing-api-openapi.yaml)
- **Format**: OpenAPI 3.0.3
- **Features**: Complete API specification with all endpoints, schemas, and examples

### 2. Interactive Documentation Website
- **Directory**: [`website/`](./website/)
- **Technology**: React + Tailwind CSS + shadcn/ui
- **Features**: Search, code examples, responsive design, copy-to-clipboard

## 🔧 API Features

### Authentication
- OAuth2 with Personal Access Tokens
- Secure login/logout endpoints
- Password reset functionality

### Core Functionality
- **SMS Campaigns**: Create, manage, and track marketing campaigns
- **Recipients**: Manage contact lists and individual recipients  
- **Organizations & Accounts**: Multi-tenant account management
- **Analytics**: Campaign performance and delivery statistics
- **Webhooks**: Integration with external SMS providers

### Key Capabilities
- Role-based access control (Admin, Manager, User)
- International phone number support
- Bulk recipient management
- Real-time delivery tracking
- Comprehensive reporting and analytics

## 🛠️ Development

### Running the Documentation Website Locally

```bash
cd website
pnpm install
pnpm run dev
```

The website will be available at `http://localhost:5173`

### Building for Production

```bash
cd website
pnpm run build
```

Static files will be generated in the `website/dist/` directory.

## 📖 API Usage Examples

### Authentication
```bash
curl -X POST "https://api.your-domain.com/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create SMS Campaign
```bash
curl -X POST "https://api.your-domain.com/api/campaigns" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale Campaign",
    "content": "Get 20% off! Use code SUMMER20",
    "account_id": "1",
    "recipients": ["1", "2", "3"]
  }'
```

### Get Campaign Analytics
```bash
curl -X GET "https://api.your-domain.com/api/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔗 Integration Tools

### Import OpenAPI Spec
- **Postman**: Import the YAML file directly
- **Insomnia**: Use the OpenAPI import feature
- **Swagger UI**: Host the spec file for interactive docs
- **Code Generation**: Use tools like `openapi-generator`

## 📚 Documentation Structure

```
├── README.md                           # This file
├── sms-marketing-api-openapi.yaml     # OpenAPI specification
└── website/                           # Documentation website
    ├── src/                          # React source code
    ├── public/                       # Static assets
    ├── dist/                         # Production build
    └── package.json                  # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation Issues**: Open an issue in this repository
- **API Support**: Contact the CX Engine development team
- **Feature Requests**: Submit via GitHub issues

---

**Built with ❤️ by the CX Engine team**

