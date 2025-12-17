// Simple analytics wrapper
// Replace with Mixpanel/Amplitude in production

export const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    console.log('[Analytics]', event, properties);
    
    // Store locally for now
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push({
        event,
        properties,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100)));
    } catch (e) {
      console.error('Analytics storage error:', e);
    }
  },
  
  identify: (userId: string, traits?: Record<string, unknown>) => {
    console.log('[Analytics] Identify', userId, traits);
    try {
      localStorage.setItem('analytics_user', JSON.stringify({ userId, traits }));
    } catch (e) {
      console.error('Analytics identify error:', e);
    }
  },
};

// Key events to track
export const EVENTS = {
  SIGNUP_STARTED: 'Signup Started',
  SIGNUP_COMPLETED: 'Signup Completed',
  ONBOARDING_STEP_COMPLETED: 'Onboarding Step Completed',
  ONBOARDING_SKIPPED: 'Onboarding Skipped',
  ESTIMATE_STARTED: 'Estimate Started',
  ESTIMATE_COMPLETED: 'Estimate Completed',
  PHOTO_UPLOADED: 'Photo Uploaded',
  VIDEO_RECORDED: 'Video Recorded',
  PDF_DOWNLOADED: 'PDF Downloaded',
  PROPOSAL_SENT: 'Proposal Sent',
  PRICING_UPDATED: 'Pricing Updated',
};
