// ui/feedback.ui.js

import { storageManager } from '../utils/storage.utils.js';

class FeedbackUI {
   constructor() {
       // Feedback timeout
       this.feedbackTimeout = 15000; // 15 seconds
   }

   /**
    * Add feedback UI to message
    * @param {string} messageId 
    * @param {string} message 
    * @param {string} response 
    */
   addFeedbackUI(messageId, message, response) {
       const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
       if (messageDiv) {
           const feedbackDiv = document.createElement('div');
           feedbackDiv.className = 'message-feedback';
           feedbackDiv.innerHTML = `
               <span>Câu trả lời có hữu ích không?</span>
               <button class="feedback-btn positive" title="Hữu ích">
                   <i class="fas fa-thumbs-up"></i>
               </button>
               <button class="feedback-btn negative" title="Không hữu ích">
                   <i class="fas fa-thumbs-down"></i>
               </button>
           `;

           // Add event listeners
           const positiveBtn = feedbackDiv.querySelector('.positive');
           const negativeBtn = feedbackDiv.querySelector('.negative');

           positiveBtn.addEventListener('click', () => 
               this.handleFeedback(messageId, message, response, true));
           negativeBtn.addEventListener('click', () => 
               this.handleFeedback(messageId, message, response, false));

           messageDiv.appendChild(feedbackDiv);

           // Auto-remove feedback UI after timeout
           setTimeout(() => {
               if (feedbackDiv && feedbackDiv.parentNode) {
                   feedbackDiv.remove();
               }
           }, this.feedbackTimeout);
       }
   }

   /**
    * Handle feedback submission
    * @param {string} messageId 
    * @param {string} message 
    * @param {string} response 
    * @param {boolean} isPositive 
    */
   async handleFeedback(messageId, message, response, isPositive) {
       try {
           // Remove feedback UI
           const feedbackDiv = document.querySelector(`[data-message-id="${messageId}"] .message-feedback`);
           if (feedbackDiv) {
               feedbackDiv.remove();
           }

           if (!isPositive) {
               // Show processing AI indicator
               this.showProcessingIndicator(messageId);

               // Emit feedback event with AI flag
               const feedback = {
                   messageId,
                   message, 
                   response,
                   isPositive: false,
                   useAI: true,
                   timestamp: new Date().toISOString()
               };

               const event = new CustomEvent('chat:feedback', {
                   detail: feedback
               });
               document.dispatchEvent(event);

           } else {
               // Handle positive feedback normally
               const feedback = {
                   messageId,
                   message,
                   response,
                   isPositive: true,
                   timestamp: new Date().toISOString()
               };

               const event = new CustomEvent('chat:feedback', {
                   detail: feedback 
               });
               document.dispatchEvent(event);

               // Show thank you message for positive feedback
               this.showFeedbackResponse(messageId, true);
           }

           return true;
       } catch (error) {
           console.error('Error handling feedback:', error);
           return false;
       }
   }

   /**
    * Show AI processing indicator
    * @param {string} messageId
    */
   showProcessingIndicator(messageId) {
       const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
       if (messageDiv) {
           const indicatorDiv = document.createElement('div');
           indicatorDiv.className = 'ai-processing-indicator';
           indicatorDiv.innerHTML = `
               <div class="typing-indicator">
                   <span></span><span></span><span></span>
               </div>
               <div class="processing-text">AI đang xử lý câu hỏi của bạn...</div>
           `;
           messageDiv.appendChild(indicatorDiv);
       }
   }

   /**
    * Remove AI processing indicator
    * @param {string} messageId
    */
   removeProcessingIndicator(messageId) {
       const indicator = document.querySelector(`[data-message-id="${messageId}"] .ai-processing-indicator`);
       if (indicator) {
           indicator.remove();
       }
   }

   /**
    * Show feedback response message
    * @param {string} messageId 
    * @param {boolean} isPositive 
    */
   showFeedbackResponse(messageId, isPositive) {
       const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
       if (messageDiv) {
           const responseDiv = document.createElement('div');
           responseDiv.className = 'feedback-response';
           
           if (isPositive) {
               responseDiv.innerHTML = `
                   <i class="fas fa-check-circle"></i>
                   Cảm ơn phản hồi tích cực của bạn!
               `;
               responseDiv.classList.add('positive');
           } else {
               responseDiv.innerHTML = `
                   <i class="fas fa-info-circle"></i>
                   Cảm ơn góp ý của bạn. AI sẽ xử lý câu hỏi của bạn.
               `;
               responseDiv.classList.add('negative');
           }

           messageDiv.appendChild(responseDiv);

           // Remove response after delay
           setTimeout(() => {
               if (responseDiv && responseDiv.parentNode) {
                   responseDiv.remove();
               }
           }, 3000);
       }
   }
}

// Export singleton instance
export const feedbackUI = new FeedbackUI();