# 🔧 PHIX-IT - AI-Powered Repair Marketplace

**Get competitive quotes from verified repair providers near you in minutes.**

PHIX-IT is an intelligent platform that connects consumers needing electronic device repairs with local, verified repair providers. Using AI-powered matching and quote generation, users can describe their issue and receive competitive offers from nearby experts.

## 🚀 Features

### For Consumers:
- 📱 Submit repair requests by device model and issue type
- 💰 Compare competitive quotes from multiple providers
- ⭐ Filter by rating, price, proximity, and repair time  
- 🔍 Find specialists (Water Damage, Apple Screen Repair, etc.)
- 📅 Schedule appointments with chosen providers

### For Providers:
- 🤖 AI-powered onboarding with smart profile generation
- 📊 Market analysis and business insights
- 🎯 Receive repair requests in your service area
- ⚙️ Customizable service radius and business settings

### AI Features (Gemini API):
- 🏪 Realistic provider generation for demos
- 💡 Smart quote generation based on specialties
- 🗺️ Address autocomplete with geocoding
- 📈 Business intelligence and market analysis

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **AI Integration:** Google Gemini API  
- **Styling:** Tailwind CSS
- **Build:** Vite with ES modules

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (16+ recommended)
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Reinadjay1131/phix-it.git
   cd phix-it
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your Gemini API key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📦 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

The app builds to static files and can be deployed to any static hosting service:

- **Vercel:** `vercel --prod`
- **Netlify:** Drag `dist/` folder to netlify.com
- **GitHub Pages:** Push `dist/` contents to gh-pages branch

### Environment Variables for Production:
- `GEMINI_API_KEY`: Your Gemini API key

## 🔧 Configuration

- **API Key:** Set in `.env.local` 
- **Service Radius:** Configurable per provider (15-50 miles)
- **Demo Mode:** Works with fallback data if no API key provided

## 📁 Project Structure

```
phix-it/
├── components/          # React components
├── services/           # API services (Gemini integration)  
├── types.ts           # TypeScript definitions
├── constants.ts       # App constants
├── App.tsx           # Main app component
└── index.tsx         # Entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo:** [Coming Soon]
- **API Documentation:** [Gemini AI](https://ai.google.dev/)
- **Support:** [Issues](https://github.com/Reinadjay1131/phix-it/issues)
