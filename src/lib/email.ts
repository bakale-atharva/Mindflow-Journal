import { Resend } from 'resend';
import type { ProgramInsight } from './program-review';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInsightEmail(to: string, insightJson: unknown): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY found, skipping email.");
    return false;
  }

  const insight = insightJson as ProgramInsight;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #242135; line-height: 1.6;">
      <h1 style="color: #7352ad; font-size: 24px; font-weight: normal;">MindFlow: Your 7-Day Clarity Map</h1>
      
      <p style="font-size: 16px;">${insight.overview}</p>
      
      ${insight.recurring_threads?.length > 0 ? `
        <div style="margin-top: 32px; padding: 24px; background-color: #f7f4fb; border-radius: 16px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #777186;">Recurring Threads</h2>
          ${insight.recurring_threads.map(thread => `
            <div style="margin-top: 16px;">
              <strong>${thread.label}</strong> <span style="color: #777186; font-size: 12px; margin-left: 8px;">(Days ${thread.evidence_days?.join(", ")})</span>
              <p style="margin-top: 4px; font-size: 14px;">${thread.explanation}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${insight.perspective_shifts?.length > 0 ? `
        <div style="margin-top: 32px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #777186;">Perspective Shifts</h2>
          <ul style="padding-left: 16px;">
            ${insight.perspective_shifts.map(shift => `
              <li style="margin-top: 12px; font-size: 14px;">
                ${shift.explanation} <span style="color: #777186; font-size: 12px;">(Days ${shift.evidence_days?.join(", ")})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${insight.clarity_in_practice?.length > 0 ? `
        <div style="margin-top: 32px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #777186;">Clarity in Practice</h2>
          <ul style="padding-left: 16px;">
            ${insight.clarity_in_practice.map(practice => `
              <li style="margin-top: 12px; font-size: 14px;">
                ${practice.explanation} <span style="color: #777186; font-size: 12px;">(Days ${practice.evidence_days?.join(", ")})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee8f7; font-style: italic;">
        <p style="font-size: 16px;">"${insight.carry_forward}"</p>
      </div>
      
      <p style="margin-top: 48px; font-size: 12px; color: #777186; text-align: center;">
        This email was sent by MindFlow Journal. It contains your private ephemeral report which was deleted from our servers.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@mindflowjournal.com',
      to: [to],
      subject: 'Your 7-Day MindFlow Clarity Map',
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return false;
  }
}
