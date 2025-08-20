# 🌐 PG-Website - Patrick Goodwin's Portfolio

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.2.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)](https://webassembly.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **A modern, multilingual React.js portfolio website showcasing full-stack development skills, innovative projects, and multilingual accessibility across 100+ languages.**

**🔗 Live Website:** [www.pattygcoding.com](https://www.pattygcoding.com)

---

## 📖 About

This is the personal portfolio website of **Patrick Goodwin**, a passionate full-stack software engineer, web developer, game developer, and content creator. Built entirely from scratch using modern React.js, this website demonstrates advanced web development techniques, innovative features, and a commitment to accessibility and internationalization.

### 👨‍💻 About the Developer

Patrick Goodwin is an experienced full-stack software engineer with a demonstrated history of successfully leading development projects, from creating Java modifications for Minecraft to enhancing user experience in React.js and implementing secure REST APIs. He consistently employs agile methodologies and effective team collaboration. Additionally, Patrick is a geography content creator who has successfully leveraged social media algorithms across Instagram, YouTube, and TikTok to build an engaging follower base.

---

## ✨ Key Features

### 🌍 **Multilingual Support (100+ Languages)**
- **Comprehensive Translation System**: Supports over 100 languages using Google Translate API
- **Automated Translation Pipeline**: Python script with intelligent caching and progress tracking
- **Smart Language Detection**: Fallback system with English as default
- **Real-time Language Switching**: Seamless user experience across all supported languages

### 🚀 **Advanced Projects Showcase**
- **Tiger Language Interpreter**: Custom programming language with WebAssembly implementations in both Go and Rust
- **3D Rubik's Cube Solver**: Interactive 3D cube solver using Three.js with painting and algorithm features  
- **JSON & YAML Formatter**: WebAssembly-powered formatter with real-time validation

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Interactive Animations**: Typewriter effects, smooth transitions, and hover animations
- **Accessible Design**: ARIA compliant with keyboard navigation support
- **Professional Theming**: Clean, modern interface with consistent branding

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18.2.0** - Modern React with hooks and context
- **React Router 6** - Client-side routing with language-aware links
- **Bootstrap 5.2.3** - Responsive CSS framework
- **Three.js** - 3D graphics and WebGL rendering
- **PrismJS** - Syntax highlighting for code blocks

### **Backend & Build Tools**
- **WebAssembly (WASM)** - High-performance compiled modules
- **Go & Rust** - WebAssembly implementations for Tiger language
- **Python 3** - Translation automation scripts
- **Node.js 18** - Development environment

### **APIs & Services**
- **Google Translate API** - Automated translation service
- **EmailJS** - Contact form functionality
- **GitHub Pages** - Static site hosting

### **Development Tools**
- **Yarn** - Package management
- **React App Rewired** - Custom webpack configuration
- **ESLint** - Code linting and formatting

---

## 🎯 Featured Projects

### 1. 🐅 **Tiger Language Interpreter**
A custom programming language implementation with dual WebAssembly backends:
- **Go Implementation**: Fast execution with goroutines support
- **Rust Implementation**: Memory-safe compilation with zero-cost abstractions  
- **Interactive Editor**: Real-time code execution and syntax highlighting
- **WebAssembly Integration**: Seamless browser-based execution

### 2. 🧩 **3D Rubik's Cube Solver**
An interactive 3D Rubik's cube solver built with Three.js:
- **3D Visualization**: Realistic cube rendering with smooth animations
- **Interactive Painting**: Click-to-color interface for cube configuration
- **Advanced Algorithms**: Multiple solving algorithms implementation
- **Real-time Validation**: State validation and move tracking

### 3. 🔧 **JSON & YAML Formatter**
A high-performance formatter with WebAssembly backend:
- **Real-time Formatting**: Instant JSON/YAML formatting and validation
- **Error Detection**: Comprehensive error reporting and suggestions
- **WebAssembly Performance**: Native-speed parsing and formatting
- **Multi-format Support**: JSON, YAML, and automatic format detection

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Yarn** package manager
- **Python 3** (for translation features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pattygcoding/PG-Website.git
   cd PG-Website
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   ```
   
   The application will be available at `http://localhost:3000`

### Building for Production

```bash
yarn build
```

### Deployment

```bash
yarn deploy
```

This will build the project and deploy it to GitHub Pages.

---

## 🌐 Translation System

The website features an advanced multilingual system supporting 100+ languages:

### Running Translations

```bash
# Translate all content to all supported languages
python src/assets/lang/lang.py

# Skip already translated content (recommended for updates)
python src/assets/lang/lang.py -skip
```

### Translation Features
- **Intelligent Caching**: Avoids re-translating unchanged content
- **Progress Tracking**: Real-time translation progress with threading
- **Error Handling**: Robust error handling with fallback mechanisms
- **Pretty JSON Output**: Formatted, readable translation files

### Supported Languages
The system supports 100+ languages including but not limited to:
- Major world languages (English, Spanish, French, German, Chinese, Japanese, etc.)
- Regional variants and dialects
- Less common languages for maximum accessibility
- Right-to-left (RTL) language support

---

## 📁 Project Structure

```
src/
├── app/                 # Main app configuration
├── assets/
│   ├── lang/           # Translation files (100+ languages)
│   │   ├── lang.py     # Translation automation script
│   │   └── *.json      # Individual language files
│   └── links/          # External links configuration
├── components/         # Reusable React components
├── cursor/            # Custom cursor implementation
├── hooks/             # Custom React hooks
├── lang/              # Language context and utilities
├── menu/              # Navigation components
├── pages/             # Main page components
│   ├── about/         # About page
│   ├── contact/       # Contact form
│   ├── home/          # Landing page
│   ├── portfolio/     # Portfolio showcase
│   └── projects/      # Interactive projects
│       ├── cube-solver/
│       ├── formatter/
│       └── tiger/
└── routes/            # Application routing
```

---

## 🤝 Contributing

While this is a personal portfolio project, suggestions and feedback are welcome! Please feel free to:

1. **Report Issues**: Open an issue for any bugs or suggestions
2. **Feature Requests**: Suggest new features or improvements
3. **Translation Improvements**: Help improve translation accuracy

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Patrick Goodwin**
- 🌐 Website: [www.pattygcoding.com](https://www.pattygcoding.com)
- 📧 Email: [Contact Form](https://www.pattygcoding.com/contact)
- 💼 LinkedIn: Connect through the website
- 📱 Social Media: Follow @pattygcoding

---

## 🙏 Acknowledgments

- **React Community** for the amazing ecosystem
- **Google Translate API** for enabling multilingual support
- **WebAssembly Community** for high-performance web applications
- **Three.js Contributors** for incredible 3D capabilities
- **Open Source Community** for inspiration and tools

---

<div align="center">

**⭐ If you found this project interesting, please consider giving it a star!**

*Built with ❤️ by Patrick Goodwin*

</div>