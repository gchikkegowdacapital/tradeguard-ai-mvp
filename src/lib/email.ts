import { User, Alert, DailySnapshot } from '@/types/index'
import { RuleViolation } from './monitoring'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_API_URL = 'https://api.resend.com/emails'

interface EmailResponse {
  id: string
}

/**
 * Send an alert email based on severity level
 */
export async function sendAlertEmail(
  user: User,
  violation: RuleViolation
): Promise<EmailResponse | null> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return null
  }

  const severityColors: Record<string, string> = {
    INFO: '#3B82F6',
    WARNING: '#F59E0B',
    CRITICAL: '#EF4444',
    EMERGENCY: '#DC2626',
  }

  const severityBgColors: Record<string, string> = {
    INFO: '#DBEAFE',
    WARNING: '#FEF3C7',
    CRITICAL: '#FEE2E2',
    EMERGENCY: '#FECACA',
  }

  const bgColor = severityBgColors[violation.severity]
  const color = severityColors[violation.severity]
  const isEmergency = violation.severity === 'EMERGENCY'

  const subject =
    violation.severity === 'EMERGENCY'
      ? `[URGENT] ${violation.rule} - Immediate Action Required`
      : `[${violation.severity}] ${violation.rule} Alert`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        ${
          isEmergency
            ? `<div style="background-color: ${bgColor}; border-left: 4px solid ${color}; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: ${color}; margin: 0; font-size: 24px;">⚠️ IMMEDIATE ACTION NEEDED</h2>
              </div>`
            : ''
        }

        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1F2937; margin-top: 0;">TradeGuard AI Alert</h1>

          <div style="background-color: ${bgColor}; border-left: 4px solid ${color}; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 10px 0; color: ${color};">${violation.rule}</h2>
            <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">${violation.message}</p>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              <strong>Current Value:</strong> ${violation.currentValue.toFixed(2)} /
              <strong>Threshold:</strong> ${violation.threshold.toFixed(2)}
            </p>
          </div>

          ${
            violation.severity === 'CRITICAL' || violation.severity === 'EMERGENCY'
              ? `<div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 16px; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400E;"><strong>Recommended Action:</strong> Review your positions immediately and take corrective action.</p>
                </div>`
              : ''
          }

          <p style="color: #6B7280; font-size: 14px; margin: 20px 0;">
            Log in to your TradeGuard dashboard to take action.
          </p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Go to Dashboard
          </a>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 40px 0;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            TradeGuard AI • Risk Management for Traders<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #3B82F6; text-decoration: none;">tradeguard.ai</a>
          </p>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'alerts@tradeguard.ai',
        to: user.email,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send alert email:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending alert email:', error)
    return null
  }
}

/**
 * Send daily trading report
 */
export async function sendDailyReport(
  user: User,
  snapshot: DailySnapshot
): Promise<EmailResponse | null> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return null
  }

  const pnlColor = snapshot.daily_pnl >= 0 ? '#10B981' : '#EF4444'
  const pnlSign = snapshot.daily_pnl >= 0 ? '+' : ''

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Trading Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1F2937; margin-top: 0;">📊 Your Daily Trading Report</h1>
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px 0;">
            ${new Date(snapshot.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          <!-- P&L Summary -->
          <div style="background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); color: white; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; opacity: 0.9; font-size: 14px;">Daily P&L</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold;">
              ${pnlSign}$${Math.abs(snapshot.daily_pnl).toFixed(2)}
            </p>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">
              ${pnlSign}${snapshot.daily_pnl_percent.toFixed(2)}%
            </p>
          </div>

          <!-- Stats Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px; background-color: #F3F4F6; border-radius: 4px 0 0 0; border: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Trades</p>
                <p style="margin: 4px 0 0 0; color: #1F2937; font-size: 18px; font-weight: bold;">${snapshot.trades_count}</p>
              </td>
              <td style="padding: 12px; background-color: #F3F4F6; border: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Win Rate</p>
                <p style="margin: 4px 0 0 0; color: #1F2937; font-size: 18px; font-weight: bold;">${snapshot.win_rate.toFixed(1)}%</p>
              </td>
              <td style="padding: 12px; background-color: #F3F4F6; border-radius: 0 4px 4px 0; border: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Best Trade</p>
                <p style="margin: 4px 0 0 0; color: #10B981; font-size: 18px; font-weight: bold;">+$${snapshot.largest_win.toFixed(2)}</p>
              </td>
            </tr>
          </table>

          <!-- More Stats -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px; background-color: #F3F4F6; border-radius: 4px 0 0 0; border: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Winners</p>
                <p style="margin: 4px 0 0 0; color: #10B981; font-size: 16px; font-weight: bold;">${snapshot.winning_trades}</p>
              </td>
              <td style="padding: 12px; background-color: #F3F4F6; border: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Losers</p>
                <p style="margin: 4px 0 0 0; color: #EF4444; font-size: 16px; font-weight: bold;">${snapshot.losing_trades}</p>
              </td>
              <td style="padding: 12px; background-color: #F3F4F6; border-radius: 0 4px 4px 0; border: 1px solid #E5E7EB;">
                <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase;">Worst Trade</p>
                <p style="margin: 4px 0 0 0; color: #EF4444; font-size: 16px; font-weight: bold;">-$${snapshot.largest_loss.toFixed(2)}</p>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/journal" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Review Your Journal
          </a>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 40px 0;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            TradeGuard AI • Risk Management for Traders<br>
            Keep trading smart, stay disciplined.
          </p>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'reports@tradeguard.ai',
        to: user.email,
        subject: 'Daily Trading Report',
        html,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send daily report:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending daily report:', error)
    return null
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(user: User): Promise<EmailResponse | null> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return null
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to TradeGuard AI</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1F2937; margin-top: 0;">Welcome to TradeGuard AI, ${user.full_name}! 🎉</h1>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            We're thrilled to have you join our community of disciplined traders. TradeGuard AI is here to help you manage risk,
            avoid emotional trading, and build consistent trading habits.
          </p>

          <!-- Getting Started -->
          <div style="background-color: #F0F9FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="color: #1E40AF; margin-top: 0; font-size: 18px;">Getting Started</h2>
            <ol style="color: #374151; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 10px 0;"><strong>Create Your Trading Plan</strong> - Define your risk limits, trading hours, and rules</li>
              <li style="margin: 10px 0;"><strong>Connect Your Broker</strong> - Link your trading account for real-time monitoring</li>
              <li style="margin: 10px 0;"><strong>Start Tracking Trades</strong> - Log your trades with emotional and setup data</li>
              <li style="margin: 10px 0;"><strong>Chat with VenusAI</strong> - Get personalized coaching on risk management</li>
            </ol>
          </div>

          <!-- Features -->
          <div style="margin: 30px 0;">
            <h2 style="color: #1F2937; font-size: 18px;">Key Features</h2>

            <div style="display: inline-block; width: 48%; margin-right: 2%; margin-bottom: 15px; background-color: #F9FAFB; padding: 15px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: bold;">📊 Risk Monitoring</p>
              <p style="margin: 0; color: #374151; font-size: 14px;">Real-time alerts for rule violations and risk metrics</p>
            </div>

            <div style="display: inline-block; width: 48%; margin-bottom: 15px; background-color: #F9FAFB; padding: 15px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: bold;">🤖 VenusAI Coach</p>
              <p style="margin: 0; color: #374151; font-size: 14px;">AI-powered guidance for emotional trading patterns</p>
            </div>

            <div style="display: inline-block; width: 48%; margin-right: 2%; margin-bottom: 15px; background-color: #F9FAFB; padding: 15px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: bold;">📝 Trade Journal</p>
              <p style="margin: 0; color: #374151; font-size: 14px;">Track emotions, setup quality, and plan compliance</p>
            </div>

            <div style="display: inline-block; width: 48%; margin-bottom: 15px; background-color: #F9FAFB; padding: 15px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: bold;">⚡ Quick Alerts</p>
              <p style="margin: 0; color: #374151; font-size: 14px;">Instant email/SMS when your rules are broken</p>
            </div>
          </div>

          <!-- CTA -->
          <table style="width: 100%; margin: 30px 0;">
            <tr>
              <td style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                  Go to Your Dashboard
                </a>
              </td>
            </tr>
          </table>

          <!-- Support -->
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 4px; margin: 30px 0;">
            <p style="margin: 0; color: #374151; font-size: 14px;">
              <strong>Need help?</strong> Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs" style="color: #3B82F6; text-decoration: none;">documentation</a>
              or contact our support team at <a href="mailto:support@tradeguard.ai" style="color: #3B82F6; text-decoration: none;">support@tradeguard.ai</a>
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 40px 0;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            TradeGuard AI • Risk Management for Traders<br>
            Trade smart. Stay disciplined. Build wealth.
          </p>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'welcome@tradeguard.ai',
        to: user.email,
        subject: 'Welcome to TradeGuard AI 🎉',
        html,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send welcome email:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return null
  }
}
