# MediStacks - Secure Medical Records on Blockchain

MediStacks is a decentralized medical record management system built on the Stacks blockchain. It provides secure, role-based access control for medical records with monetization opportunities for research data sharing.

## 🏥 Features

### Core Functionality
- **Secure Medical Records**: Encrypted storage with blockchain-based access control
- **Role-Based Access**: Admin, Doctor, Researcher, Emergency Responder, and Verifier roles
- **Emergency Access**: Emergency responders can access critical data when enabled
- **Research Marketplace**: Patients can monetize anonymized data for research
- **Audit Trail**: Complete transparency with immutable access logs
- **STX Payments**: Integrated payment system for research data access

### User Roles
- **Patients**: Own and control their medical records
- **Doctors**: Request access to patient records for treatment
- **Researchers**: Purchase access to anonymized research data
- **Emergency Responders**: Access critical data during emergencies
- **Verifiers**: Approve role assignments and verify credentials
- **Admins**: Manage platform settings and user roles

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Router** for navigation
- **Zustand** for state management

### Blockchain Integration
- **Stacks Blockchain** (Testnet)
- **Clarity Smart Contracts** v2
- **Stacks Connect** for wallet integration
- **Stacks Transactions** for blockchain interactions

### Smart Contract Features
- Medical record registration and management
- Role-based permission system
- Access request and approval workflow
- Emergency mode for critical access
- Research data monetization with STX payments
- Platform fee management
- Comprehensive audit logging

## 📁 Project Structure

```
MediStacks/
├── contracts/
│   └── medistacks.clar          # Main Clarity smart contract
├── deployments/
│   └── medistacks-testnet-plan.yaml
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/           # React contexts (Stacks, Auth)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── pages/              # Application pages
│   │   └── main.tsx            # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── settings/                   # Clarinet configuration
└── Clarinet.toml              # Project configuration
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Clarinet CLI
- Stacks wallet (Hiro Wallet or Xverse)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediStacks
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:3002 in your browser
   - Connect your Stacks wallet to get started

### Smart Contract Deployment

1. **Deploy to testnet**
   ```bash
   clarinet deployments apply -p deployments/medistacks-testnet-plan.yaml
   ```

2. **Test locally with Clarinet**
   ```bash
   clarinet console
   ```

## 🎯 Key Pages and Features

### Landing Page
- Beautiful hero section with feature highlights
- Clear value proposition for healthcare data ownership
- Call-to-action for wallet connection

### Dashboard
- Overview of user's medical records and activity
- Role-based quick actions
- System status and health indicators
- Recent activity feed

### Medical Records
- Add new medical records with file upload
- Search and filter existing records
- Toggle research opt-in for monetization
- Share access with healthcare providers

### Access Requests
- View and manage incoming access requests
- Approve/deny requests from doctors and researchers
- Role-based request filtering
- Purpose-driven access control

### Research Marketplace
- Browse available anonymized research data
- Purchase access with STX tokens
- Category and price filtering
- Secure payment processing

### Emergency Access
- Enable/disable emergency mode for critical situations
- Time-limited access for emergency responders
- Automatic expiry mechanisms
- Emergency dashboard for responders

### Settings
- Profile and wallet information
- Role management and permissions
- Notification preferences
- Privacy and data sharing controls
- Platform administration (admin only)

## 🔐 Security Features

- **End-to-End Encryption**: All medical data is encrypted before storage
- **Blockchain Security**: Immutable access control on Stacks blockchain
- **Role-Based Permissions**: Granular access control based on user roles
- **Audit Trail**: Complete logging of all data access events
- **Emergency Protocols**: Secure emergency access with automatic expiry
- **Privacy Controls**: User-controlled data sharing preferences

## 💰 Monetization

- **Research Data Sales**: Patients earn STX tokens for sharing anonymized data
- **Platform Fees**: Configurable platform fees on research transactions
- **Transparent Payments**: All transactions recorded on blockchain
- **Fair Compensation**: Direct payments to data owners

## 🧪 Testing

The application includes comprehensive testing capabilities:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test blockchain interactions
- **E2E Tests**: Test complete user workflows
- **Smart Contract Tests**: Clarinet-based contract testing

```bash
# Run frontend tests
cd frontend
npm test

# Run smart contract tests
clarinet test
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:

```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Smart Contract Deployment
Deploy to Stacks testnet or mainnet using Clarinet:

```bash
# Generate deployment plan
clarinet deployments generate --testnet

# Apply deployment
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

## 🔮 Future Roadmap

- **Mobile App**: React Native mobile application
- **IPFS Integration**: Decentralized file storage
- **Multi-chain Support**: Expand to other blockchains
- **AI Analytics**: AI-powered health insights
- **Telemedicine**: Integrated video consultations
- **Insurance Integration**: Direct insurance claim processing
- **Wearable Device Support**: IoT device data integration

---

Built with ❤️ for secure healthcare data management on the blockchain.
