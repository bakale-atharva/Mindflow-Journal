import { Flame, TrendingUp, BookOpen, Clock, Activity } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-10">
      
      <header>
        <h1 className="font-heading text-3xl font-bold text-foreground">Your Insights</h1>
        <p className="text-secondary-text mt-2">A look back at your journey and emotional patterns.</p>
      </header>

      {/* 1. Streak Card */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="flex flex-col items-center justify-center p-6 bg-brand-50 rounded-2xl border border-brand-100 min-w-[200px]">
            <Flame className="w-10 h-10 text-orange-500 mb-2" />
            <span className="text-5xl font-heading font-bold text-brand-700">12</span>
            <span className="text-sm font-medium text-brand-600 uppercase tracking-wider mt-1">Day Streak</span>
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Consistency</h3>
            {/* GitHub Style Contribution Grid Placeholder */}
            <div className="grid grid-cols-12 gap-1.5 opacity-80">
              {Array.from({ length: 60 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-sm ${
                    Math.random() > 0.3 ? 'bg-brand-500/80' : 'bg-tertiary'
                  }`}
                  style={{ opacity: Math.random() > 0.3 ? 0.5 + Math.random() * 0.5 : 1 }}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-secondary-text mt-4">Showing last 60 days</p>
          </div>
        </div>
      </section>

      {/* 2. Mood Chart */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">Mood Trends</h3>
            <div className="flex items-center gap-2 text-green-500 font-medium text-sm mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>Your mood has been trending up 📈</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-heading font-bold text-brand-500">4.2</span>
            <p className="text-xs font-medium text-secondary-text uppercase tracking-wider">Avg Score</p>
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div className="h-48 w-full bg-tertiary rounded-xl relative overflow-hidden flex items-end px-4 pb-4 gap-2">
          {/* Mock bars */}
          {Array.from({ length: 14 }).map((_, i) => {
            const height = 40 + Math.random() * 60;
            return (
              <div 
                key={i}
                className="flex-1 bg-brand-400 rounded-t-sm hover:bg-brand-500 transition-colors cursor-pointer"
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>
      </section>

      {/* Grid for Themes & Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 3. Top Themes */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Recurring Themes</h3>
          <div className="flex flex-wrap gap-3">
            {["mindfulness", "work stress", "gratitude", "family time", "sleep quality", "exercise"].map((theme, i) => (
              <span 
                key={theme} 
                className={`px-4 py-2 rounded-full font-medium ${
                  i < 2 ? 'bg-brand-100 text-brand-700 text-base' : 
                  i < 4 ? 'bg-tertiary text-foreground text-sm' : 
                  'bg-background border border-border text-secondary-text text-xs'
                }`}
              >
                #{theme}
              </span>
            ))}
          </div>
        </section>

        {/* 4. Journal Stats */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-6">By the Numbers</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">42</p>
                <p className="text-sm font-medium text-secondary-text">Total Entries</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">12,405</p>
                <p className="text-sm font-medium text-secondary-text">Total Words Written</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">9:00 PM</p>
                <p className="text-sm font-medium text-secondary-text">Favorite Time to Journal</p>
              </div>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
