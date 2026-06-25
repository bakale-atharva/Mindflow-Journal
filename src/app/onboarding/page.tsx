"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Moon, Sun, Cloud, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow">
                <Star className="w-12 h-12 text-brand-500" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                Welcome to MindFlow
              </h1>
              <p className="text-lg md:text-xl text-secondary-text mb-12 max-w-lg mx-auto">
                A calm, safe space to untangle your thoughts and discover patterns in your daily life.
              </p>
              <button 
                onClick={nextStep}
                className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md transition-all duration-200 hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Let's get started <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">What brings you here?</h2>
              <p className="text-secondary-text text-center mb-10">We'll personalize your prompts based on your goals.</p>
              
              <div className="grid gap-4 max-w-md mx-auto">
                {["Reduce anxiety and stress", "Sleep better", "Practice gratitude", "Track my mood swings", "Just dump my thoughts"].map(goal => (
                  <button 
                    key={goal}
                    onClick={nextStep}
                    className="w-full text-left px-6 py-4 rounded-xl border-2 border-border hover:border-brand-500 hover:bg-brand-50 text-foreground font-medium transition-all duration-200"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full text-center"
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-2">When do you reflect best?</h2>
              <p className="text-secondary-text mb-10">We'll send a gentle reminder at this time.</p>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
                <button onClick={nextStep} className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border hover:border-brand-500 hover:bg-brand-50 transition-all duration-200 w-48">
                  <Sun className="w-10 h-10 text-orange-500" />
                  <span className="font-semibold text-lg text-foreground">Morning</span>
                </button>
                <button onClick={nextStep} className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border hover:border-brand-500 hover:bg-brand-50 transition-all duration-200 w-48">
                  <Cloud className="w-10 h-10 text-blue-500" />
                  <span className="font-semibold text-lg text-foreground">Afternoon</span>
                </button>
                <button onClick={nextStep} className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border hover:border-brand-500 hover:bg-brand-50 transition-all duration-200 w-48">
                  <Moon className="w-10 h-10 text-indigo-500" />
                  <span className="font-semibold text-lg text-foreground">Evening</span>
                </button>
              </div>
              
              <button onClick={nextStep} className="text-secondary-text hover:text-foreground font-medium">
                Skip for now
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-8 text-center">Your first prompt</h2>
              
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-8 shadow-glow text-white text-center mb-10">
                <h3 className="font-heading text-2xl font-bold mb-4">What is one thing that made you smile today?</h3>
                <p className="text-brand-100 mb-8">Even the smallest moments count.</p>
                <button 
                  onClick={nextStep}
                  className="bg-white text-brand-700 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-sm"
                >
                  Write entry
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">✓</div>
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">You're all set!</h2>
              <p className="text-secondary-text mb-10">Your journey to better mental wellness begins now.</p>
              
              <button 
                onClick={nextStep}
                className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md transition-all duration-200 w-full md:w-auto"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-tertiary">
        <div 
          className="h-full bg-brand-500 transition-all duration-500 ease-out" 
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
