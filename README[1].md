# MBA GameZone 🎮 🎓
> An interactive educational gaming platform for MBA students and entrance exam aspirants (CAT, GMAT, XAT, GRE, SNAP).

---

## 🌟 Project Overview
**MBA GameZone** transforms complex business management concepts into engaging, interactive simulations. Rather than memorizing theoretical formulas, students make real executive decisions across Marketing, Finance, HR, Economics, Strategy, and Entrepreneurship.

---

## 🚀 The 7 Educational Games

1. **MBA Quiz Challenge** – Rapid-fire multiple choice questions with timer, difficulty levels, streak multipliers, and in-depth MBA concept explanations verified on the server.
2. **Business Strategy Game** – Lead "Zenith Mobile" through 4 quarters. Make pricing, R&D, supply chain, and retail decisions while managing share price and market share.
3. **Marketing Master** – Execute a 4Ps Go-To-Market launch for "Aura Botanicals". Optimize Segmentation (STP), value-based pricing, and micro-influencer channels to maximize ROAS.
4. **Finance Challenge** – Solve double-entry balance sheets ($Assets = Liabilities + Equity$), compute quick liquidity ratios, and evaluate capital projects using NPV vs. IRR.
5. **HR Management Game** – Act as Chief Human Resources Officer (CHRO) navigating toxic high performers, return-to-office battles, and employee retention.
6. **Entrepreneurship Simulator** – From Seed to Series A: structure vesting co-founder equity, run pilot customer discovery, and negotiate VC term sheets.
7. **Case Study Challenge** – Harvard/Stanford style business case: "NovaStream's $1.2B Live Sports Streaming Pivot". Analyze exhibits, calculate ARPU vs rights fees, and present board recommendations.

---

## 🛠️ Technology Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Audio Synthesizer:** Zero-dependency Web Audio API sound effects.
- **Backend:** Node.js, Express.js REST API with input validation.
- **Persistence:** JSON files (`/data/questions.json`, `/data/scores.json`, `/data/scenarios.json`) and client-side `localStorage`.

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/questions` | Query questions by `category`, `difficulty`, `limit` |
| `POST` | `/api/quiz/validate` | Server-side validation of submitted answers |
| `GET` | `/api/leaderboard` | Retrieve global rankings sorted by score/XP |
| `POST` | `/api/leaderboard` | Submit a new score entry |
| `GET` | `/api/scenarios/:gameId` | Retrieve scenario data for simulations |
| `GET` | `/api/stats` | Retrieve platform-wide metrics |
| `GET` | `/api/daily-challenge` | Retrieve today's curated question and bonus XP |

---

## 💻 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+)
- npm (comes with Node.js)

### 2. Setup Commands
```bash
# Clone the repository
git clone https://github.com/your-username/mba-gamezone.git
cd mba-gamezone

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔒 Security Note for Beginners
Demo data and `localStorage` are designed for beginner portfolio demonstrations. For production enterprise applications, always use a relational database (PostgreSQL), secure hashed passwords (bcrypt), and HTTP-Only authentication cookies.
