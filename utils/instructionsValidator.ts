import type { BrandInstructions, TaskType, EmailType } from '../types';

export interface MissingInstruction {
  field: string;
  label: string;
  description: string;
}

/**
 * Check what instructions are missing for a specific content type
 */
export function checkMissingInstructions(
  brandInstructions: BrandInstructions,
  contentType: TaskType,
  emailType?: EmailType
): MissingInstruction[] {
  const missing: MissingInstruction[] = [];

  // Check general brand instructions (applies to all types)
  if (!brandInstructions.brandIntroduction || brandInstructions.brandIntroduction.includes('[PLACEHOLDER')) {
    missing.push({
      field: 'brandIntroduction',
      label: 'Brand Introduction',
      description: 'Overview of your brand, mission, and what makes you unique',
    });
  }

  if (!brandInstructions.personas || brandInstructions.personas.length === 0 ||
      brandInstructions.personas[0]?.name?.includes('[PLACEHOLDER')) {
    missing.push({
      field: 'personas',
      label: 'Target Personas',
      description: 'Detailed descriptions of your target audience segments, their pain points, and how you solve them',
    });
  }

  if (!brandInstructions.toneOfVoice || brandInstructions.toneOfVoice.includes('[PLACEHOLDER')) {
    missing.push({
      field: 'toneOfVoice',
      label: 'Tone of Voice',
      description: 'How your brand communicates (e.g., professional, conversational, aspirational)',
    });
  }

  if (!brandInstructions.keyMessaging || brandInstructions.keyMessaging.length === 0 ||
      brandInstructions.keyMessaging[0]?.includes('[PLACEHOLDER')) {
    missing.push({
      field: 'keyMessaging',
      label: 'Key Messaging',
      description: 'Core messages and value propositions you want to communicate',
    });
  }

  // Check campaign stage instructions
  if (!brandInstructions.campaignInstructions ||
      !brandInstructions.campaignInstructions.tofu ||
      brandInstructions.campaignInstructions.tofu.includes('[PLACEHOLDER')) {
    missing.push({
      field: 'campaignInstructions',
      label: 'Campaign Stage Instructions',
      description: 'Guidelines for TOFU, MOFU, and BOFU messaging and CTAs',
    });
  }

  // Check content-type specific instructions
  switch (contentType) {
    case 'ad-copy':
      if (!brandInstructions.adCopyInstructions?.systemPrompt) {
        missing.push({
          field: 'adCopyInstructions',
          label: 'Ad Copy Instructions',
          description: 'Brand-specific guidelines, examples, dos/donts for ad copywriting',
        });
      } else if (brandInstructions.adCopyInstructions.examples.length === 0) {
        missing.push({
          field: 'adCopyExamples',
          label: 'Ad Copy Examples',
          description: 'Real examples of high-performing ads to use as templates',
        });
      }
      break;

    case 'blog':
      if (!brandInstructions.blogInstructions?.systemPrompt) {
        missing.push({
          field: 'blogInstructions',
          label: 'Blog Post Instructions',
          description: 'Brand-specific guidelines, examples, dos/donts for blog writing',
        });
      } else if (brandInstructions.blogInstructions.examples.length === 0) {
        missing.push({
          field: 'blogExamples',
          label: 'Blog Post Examples',
          description: 'Real examples of successful blog posts to use as templates',
        });
      }
      break;

    case 'landing-page':
      if (!brandInstructions.landingPageInstructions?.systemPrompt) {
        missing.push({
          field: 'landingPageInstructions',
          label: 'Landing Page Instructions',
          description: 'Brand-specific guidelines, examples, dos/donts for landing page copy',
        });
      } else if (brandInstructions.landingPageInstructions.examples.length === 0) {
        missing.push({
          field: 'landingPageExamples',
          label: 'Landing Page Examples',
          description: 'Real examples of high-converting landing pages to use as templates',
        });
      }
      break;

    case 'email':
      if (emailType === 'invitation') {
        if (!brandInstructions.emailInstructions?.invitation?.systemPrompt) {
          missing.push({
            field: 'emailInvitationInstructions',
            label: 'Invitation Email Instructions',
            description: 'Brand-specific guidelines and examples for event invitation emails',
          });
        } else if (brandInstructions.emailInstructions.invitation.examples.length === 0) {
          missing.push({
            field: 'emailInvitationExamples',
            label: 'Invitation Email Examples',
            description: 'Real examples of successful invitation emails',
          });
        }
      } else if (emailType === 'nurturing-drip') {
        if (!brandInstructions.emailInstructions?.nurturingDrip?.systemPrompt) {
          missing.push({
            field: 'emailNurturingInstructions',
            label: 'Nurturing Email Instructions',
            description: 'Brand-specific guidelines and examples for nurturing drip sequences',
          });
        } else if (brandInstructions.emailInstructions.nurturingDrip.examples.length === 0) {
          missing.push({
            field: 'emailNurturingExamples',
            label: 'Nurturing Email Examples',
            description: 'Real examples of successful nurturing emails',
          });
        }
      } else if (emailType === 'email-blast') {
        if (!brandInstructions.emailInstructions?.emailBlast?.systemPrompt) {
          missing.push({
            field: 'emailBlastInstructions',
            label: 'Email Blast Instructions',
            description: 'Brand-specific guidelines and examples for announcement emails',
          });
        } else if (brandInstructions.emailInstructions.emailBlast.examples.length === 0) {
          missing.push({
            field: 'emailBlastExamples',
            label: 'Email Blast Examples',
            description: 'Real examples of successful email blasts',
          });
        }
      }
      break;
  }

  return missing;
}

/**
 * Determine if we should show the warning modal
 * (show if there are ANY missing instructions)
 */
export function shouldShowWarning(
  brandInstructions: BrandInstructions,
  contentType: TaskType,
  emailType?: EmailType
): boolean {
  const missing = checkMissingInstructions(brandInstructions, contentType, emailType);
  return missing.length > 0;
}
