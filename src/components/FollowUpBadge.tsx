/**
 * FollowUpBadge — shows follow-up status on the EstimateDetail page
 *
 * Usage:
 *   <FollowUpBadge estimateId={estimate.id} estimateStatus={estimate.status} />
 *
 * Only renders when status === 'sent'
 * Shows:
 *   - How many follow-ups have been sent (0-3)
 *   - Next scheduled send date/label
 *   - Open/click tracking dots per follow-up
 *   - "Send now" manual trigger button
 *   - "Cancel auto follow-ups" option
 */

import { useState } from 'react';
import {
  Mail,
  MailOpen,
  Clock,
  Send,
  BellOff,
  ChevronDown,
  ChevronUp,
  Loader2,
  MousePointerClick,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useFollowUps } from '../hooks/useFollowUps';

interface FollowUpBadgeProps {
  estimateId: string;
  estimateStatus: string;
  className?: string;
}

export function FollowUpBadge({
  estimateId,
  estimateStatus,
  className,
}: FollowUpBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const {
    followUps,
    nextFollowUp,
    isLoading,
    isTriggeringNow,
    error,
    triggerNow,
    cancelAll,
  } = useFollowUps(estimateId);

  // Only show for sent quotes
  if (estimateStatus !== 'sent') return null;
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground text-sm', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading follow-ups...
      </div>
    );
  }

  const allSent = followUps.length >= 3;
  const sentCount = followUps.length;

  return (
    <TooltipProvider>
      <Card className={cn('border-border', className)}>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Auto Follow-Ups</CardTitle>
              <Badge
                variant={allSent ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {sentCount}/3 sent
              </Badge>
              {nextFollowUp?.isSoon && !allSent && (
                <Badge className="text-xs bg-amber-500 hover:bg-amber-500 text-white">
                  Soon
                </Badge>
              )}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Next scheduled */}
          {!allSent && nextFollowUp && (
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Next: <span className={cn('font-medium', nextFollowUp.isSoon ? 'text-amber-600' : 'text-foreground')}>{nextFollowUp.label}</span>
              </span>
            </div>
          )}
          {allSent && (
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCheck className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">All follow-ups sent</span>
            </div>
          )}
        </CardHeader>

        {expanded && (
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            {/* Follow-up timeline */}
            <div className="space-y-2">
              {([3, 7, 10] as const).map((day) => {
                const sent = followUps.find((f) => f.day_number === day);
                const isNext = nextFollowUp?.dayNumber === day;

                return (
                  <div
                    key={day}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg',
                      sent ? 'bg-muted/40' : isNext ? 'bg-primary/5 border border-primary/20' : 'opacity-40'
                    )}
                  >
                    {/* Status dot */}
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full flex-shrink-0',
                        sent ? 'bg-green-500' : isNext ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40'
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Day {day} follow-up</span>
                        {sent && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(sent.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {isNext && !sent && (
                          <span className="text-xs text-primary font-medium">Next</span>
                        )}
                      </div>
                      {sent && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn('flex items-center gap-1 text-xs', sent.opened_at ? 'text-green-600' : 'text-muted-foreground')}>
                                <MailOpen className="h-3 w-3" />
                                {sent.opened_at ? 'Opened' : 'Not opened'}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {sent.opened_at
                                ? `Opened ${new Date(sent.opened_at).toLocaleString()}`
                                : 'Client has not opened this email yet'}
                            </TooltipContent>
                          </Tooltip>
                          {sent.clicked_at && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <MousePointerClick className="h-3 w-3" />
                                  Clicked
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                Clicked estimate link {new Date(sent.clicked_at).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            {/* Actions */}
            {!allSent && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={triggerNow}
                  disabled={isTriggeringNow}
                >
                  {isTriggeringNow ? (
                    <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Sending...</>
                  ) : (
                    <><Send className="h-3 w-3 mr-1.5" />Send now</>  
                  )}
                </Button>

                {!cancelConfirm ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() => setCancelConfirm(true)}
                  >
                    <BellOff className="h-3 w-3 mr-1.5" />
                    Cancel all
                  </Button>
                ) : (
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs text-muted-foreground">Sure?</span>
                    <Button size="sm" variant="destructive" className="text-xs h-7" onClick={async () => { await cancelAll(); setCancelConfirm(false); }}>
                      Yes
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setCancelConfirm(false)}>
                      No
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}
