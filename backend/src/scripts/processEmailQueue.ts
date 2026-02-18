import { EmailService } from '../services/EmailService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Process email queue script
 * Can be run as a cron job
 */
async function processEmailQueue() {
  try {
    console.log('Starting email queue processing...');
    
    const emailService = new EmailService();
    const batchSize = parseInt(process.env.EMAIL_QUEUE_BATCH_SIZE || '50');
    
    await emailService.processQueue(batchSize);
    
    console.log('Email queue processed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error processing email queue:', error);
    process.exit(1);
  }
}

processEmailQueue();
