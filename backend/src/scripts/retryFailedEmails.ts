import { EmailService } from '../services/EmailService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Retry failed emails script
 * Can be run as a cron job
 */
async function retryFailedEmails() {
  try {
    console.log('Starting failed emails retry...');
    
    const emailService = new EmailService();
    
    await emailService.retryFailedEmails();
    
    console.log('Failed emails retry completed');
    process.exit(0);
  } catch (error) {
    console.error('Error retrying failed emails:', error);
    process.exit(1);
  }
}

retryFailedEmails();
