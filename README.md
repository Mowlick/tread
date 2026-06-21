# Tread 🌿

Tread is a beautifully designed, premium eco-tracking application built to help users seamlessly monitor and reduce their carbon footprint. Utilizing the sophisticated "Quiet Eco-Tech" design language, Tread offers a serene, micro-animated user experience combined with powerful real-time data, AI coaching, and social challenges.

## 🚀 Features

- **Activity Tracking**: Log transport, energy, food, shopping, and waste activities to instantly calculate CO₂ emissions.
- **Sol AI (Conversational Coach)**: An intelligent, conversational AI assistant represented by a breathing, responsive orb. Powered by Claude 3.5, Sol gives personalized recommendations and insights based on your footprint history.
- **Goal Setting & Challenges**: Set realistic carbon reduction targets and join community challenges to earn XP and rewards.
- **Premium UI**: Micro-animations, carefully curated typography (Manrope, Space Grotesk, Inter), and a nature-inspired color palette for a relaxing "Quiet Eco-Tech" feel.
- **Cross-Platform**: Fully supported across iOS, Android, and Web.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, React Navigation
- **Styling**: NativeWind (Tailwind CSS v4)
- **State Management**: Zustand (Local), React Query (Server State)
- **Backend**: Supabase (PostgreSQL, Auth, RPCs)
- **AI / Compute**: Supabase Edge Functions (Deno), Anthropic API

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the project and add your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Backend Deployment
Make sure you have the Supabase CLI installed, then link your project and push the database schema:
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 4. Deploy Edge Functions (For Sol AI)
Upload your Anthropic key securely to Supabase's vault, and deploy the Edge Functions:
```bash
npx supabase secrets set ANTHROPIC_API_KEY=your-claude-api-key
npx supabase functions deploy
```

### 5. Run the App
Start the Expo Metro bundler:
```bash
npx expo start -c
```
Press `i` for iOS, `a` for Android, or `w` for the Web browser!

---

*Designed and developed to make sustainability simple, beautiful, and engaging.*
