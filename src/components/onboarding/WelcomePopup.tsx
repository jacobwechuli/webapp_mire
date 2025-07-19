'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, TrendingUp, Shield, Users, ArrowRight } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onGetStarted: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onGetStarted }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-gradient-to-br from-background via-card to-background border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome to GoldPlus! 🎉
            </h1>
            <p className="text-sm text-muted-foreground">
              Let's personalize your financial journey
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Quick Setup Survey
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We'll ask you just a few questions to understand your financial goals. 
              This takes less than 2 minutes and helps us provide better insights.
            </p>
          </div>

          {/* Features grid - more compact */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="flex items-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Target className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Smart Goals</h3>
                <p className="text-xs text-muted-foreground">Set and track your financial targets</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800">
              <TrendingUp className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Smart Insights</h3>
                <p className="text-xs text-muted-foreground">Get personalized financial advice</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
              <Shield className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Secure & Private</h3>
                <p className="text-xs text-muted-foreground">Your data is always protected</p>
              </div>
            </div>
          </div>

          {/* What you'll get - more compact */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              What you'll get:
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Personalized budget recommendations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Smart spending insights and alerts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Goal tracking and progress visualization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                AI-powered financial advice
              </li>
            </ul>
          </div>

          {/* Action buttons - more prominent */}
          <div className="pt-4">
            <Button 
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground text-center">
            You can always update your preferences later in settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup; 