# Own Recovery — A Human-in-the-Loop AI Companion for Addiction Recovery

Own Recovery is a medical-AI-inspired, human-in-the-loop digital companion that supports people navigating substance use recovery. Everything centers on trust, predictable logic, and human decision-making. The app delivers consistent daily check-ins, recovery streak tracking, and ethically framed alerts while keeping supporters in the loop on the user’s terms. AI helps surface insights—but people stay in control.

## Why it matters

- **Ethical, reliable AI**: Own Recovery uses rule-based, explainable logic so alerts are predictable, reproducible, and advisory. The person and their supporters always make the final call.
- **Inspired by AA levels of trust**: Calm language, low cognitive load, and predictable behavior mirror the principles of Alcoholics Anonymous platforms.
- **Human-in-the-loop**: Supporters, clinicians, or the user themselves review any AI suggestions before acting. Nothing auto-escalates.
- **Privacy-first and consent-driven**: Users can remain anonymous, adjust what supporters see, and delete data anytime.

## 🚀 Core Features

- **Multi-Role Experiences**  
  Recovery, Thinking About Change, and Supporter dashboards provide tailored journeys.

- **Reliable Daily Check-ins**  
  Rule-based AI observes mood, cravings, sleep, and stress patterns to surface consistent, advisory insights.

- **Explainable Risk Alerts**  
  If a pattern signals elevated risk, the app explains why and prompts humans to follow up—users and supporters stay in charge.

- **Wellness Context Logging**  
  Daily check-ins include stress load, sleep quality, and optional triggers so supporters understand the whole picture.

- **Celebrations & Milestones**  
  Sobriety streaks, log streaks, and honesty badges reinforce momentum with joyful, human-centered design.

- **Family & Supporter Engagement**  
  Invitation codes or email invites connect supporters, with privacy controls that keep ownership with the person in recovery.
- **Encouragement Messaging**  
  Supporters can send brief, advisory notes that stay in-app, respecting the recovery member’s privacy choices.

- **Curated Resource Library**  
  Filterable hub of worksheets, audio resets, hotlines, and supporter guides—with tailored quick picks for each role.

- **Crisis Support**  
  Always-on “Help Now” button and smart keyword detection to surface hotlines immediately—without panic, always clear and calm.

- **Resource Library (curated)**  
  Placeholder content today; AI-assisted curation later, keeping everything explainable and verifiable.

## ⚖️ Ethical & Design Principles

- **Predictable AI**: Rule-based logic so outputs are explainable and reproduceable. No opaque black boxes.
- **Human Oversight**: AI never acts on its own; people decide how to respond.
- **Privacy & Consent**: Privacy controls, anonymized usage, and full data deletion options.
- **Inclusive Experience**: High-contrast, accessible typography and language focused on dignity and hope.

## Product Roadmap (Current Phase)

- Phase 2 completed: Mood + craving logging, streaks, charts, and badge celebrations.
- Phase 3 in progress: Supporter connections, privacy controls, encouragement flows, and the resource library.
  - New this iteration: advisory alerts, stress/sleep logging, anonymous mode toggle, privacy sharing toggles, in-app data deletion, invite-code based support circles with removal controls, in-app encouragement messaging with safe presets, and a curated resource hub with role-based quick picks.
- Phase 4 upcoming: Crisis keyword detection with human escalation, weekly summaries, and admin oversight for flagged events (always respecting RLS in Supabase).

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime) with Row Level Security
- **Deployment**: Vercel (automatic on every `main` push)
- **AI**: Rule-based logic first; OpenAI API integration planned for templated, supervised insights
- **Design System**: Recovery-focused palette reinforcing calm, hope, and accessibility

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel
- **AI**: OpenAI API
- **Styling**: Tailwind CSS with custom recovery-focused design system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **Supabase Account** - [Sign up here](https://supabase.com/)
4. **Vercel Account** - [Sign up here](https://vercel.com/)
5. **GitHub Account** - [Sign up here](https://github.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd own-recovery
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings > API to get your project URL and anon key
4. Go to SQL Editor and run the contents of `supabase-schema.sql`

### 4. Environment Variables

1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Fill in your environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Crisis Support
CRISIS_HOTLINE_NUMBER=988
CRISIS_TEXT_LINE=741741
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

1. **Connect to GitHub**:
   - Push your code to a GitHub repository
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project" and import your GitHub repository

2. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add all environment variables from your `.env.local` file

3. **Deploy**:
   - Vercel will automatically deploy on every push to your main branch
   - Your app will be available at `https://your-project.vercel.app`

## 📁 Project Structure

```
own-recovery/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable UI components
│   ├── lib/               # Utilities and configurations
│   │   └── supabase.ts    # Supabase client setup
│   ├── types/             # TypeScript type definitions
│   │   └── database.ts    # Database types
│   └── styles/            # Additional styles
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
└── package.json          # Dependencies and scripts
```

## 🎨 Design System

The app uses a recovery-focused color palette designed to be:
- **Hopeful**: Warm, uplifting colors that inspire positivity
- **Calming**: Soft tones that reduce anxiety
- **Accessible**: High contrast and clear typography
- **Inclusive**: Colors that work for all users

### Color Palette
- **Primary**: Blue tones (trust, stability)
- **Secondary**: Purple tones (creativity, transformation)
- **Success**: Green tones (growth, progress)
- **Warning**: Orange tones (caution, attention)
- **Danger**: Red tones (urgent, crisis)

## 🔐 Security & Privacy

- **Row Level Security**: Supabase RLS ensures users only see their own data
- **Encrypted Storage**: All sensitive data is encrypted
- **Crisis Detection**: AI monitors for crisis language and routes to appropriate support
- **Data Privacy**: Users can delete their data at any time
- **Anonymous Options**: Users can use the app without revealing personal information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Crisis Support

If you or someone you know is in crisis:
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Recovery community members who shared their stories and needs
- Mental health professionals who provided guidance
- Open source contributors who made this project possible

---

**Remember**: This app is a tool to support your journey, but it's not a replacement for professional medical or mental health care. Always consult with healthcare professionals for medical advice.
