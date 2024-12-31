import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, X, Mail } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  features: string[];
  price: number;
}

interface EnrollmentFormProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ course, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedTransactionId, setSubmittedTransactionId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const transactionId = formData.get('transactionId') as string;
    setSubmittedTransactionId(transactionId);

    try {
      const response = await fetch('https://formspree.io/f/mjkkojqa', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Form submission failed');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setSubmittedTransactionId('');
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = () => {
    const emailSubject = `Payment Screenshot for ${course?.title} - Transaction ID: ${submittedTransactionId}`;
    const emailBody = `Dear Team,

I have completed my enrollment form for ${course?.title}.

Transaction Details:
- Transaction ID: ${submittedTransactionId}
- Course: ${course?.title}
- Amount: Rs. ${course?.price}

I have attached my payment screenshot for verification.

Thank you.`;

    const mailtoLink = `mailto:logixcellacademy@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-[600px] p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold mb-2">Thanks for enrolling!</h3>
          <p className="text-gray-600 mb-4">
            We've received your enrollment request for {course?.title}.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
            <ul className="space-y-2 text-blue-700">
              <li>• Please send your payment screenshot via email using the button below</li>
              <li>• Our team will verify your payment within 24 hours</li>
              <li>• You'll receive an email confirmation with course access details</li>
              <li>• We'll send course materials and study group invitation via WhatsApp</li>
              {submittedTransactionId && (
                <li>• Keep your Transaction ID handy for reference: {submittedTransactionId}</li>
              )}
            </ul>
          </div>
          <button
            onClick={handleSendEmail}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <Mail className="w-5 h-5" />
            Send Payment Screenshot via Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close form"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary-600">
            Enroll in {course?.title}
          </h2>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">Payment Instructions:</h3>
            <p className="text-blue-700 mt-2">
              1. Send payment of Rs. {course?.price} via JazzCash to:
            </p>
            <p className="text-blue-900 font-bold text-lg mt-1">+92 328 4119134 Muhammad Abdullah</p>
            <p className="text-blue-700 mt-2">
              2. Save the payment confirmation message/screenshot
            </p>
            <p className="text-blue-700">
              3. Complete this form and send the screenshot via email when prompted
            </p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="course" value={course?.title} />
            <input type="hidden" name="_subject" value={`New enrollment for ${course?.title}`} />

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                required
                placeholder="Enter your age"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                WhatsApp Number
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                required
                placeholder="Enter WhatsApp number with country code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                JazzCash Transaction ID
              </label>
              <input
                id="transactionId"
                name="transactionId"
                required
                placeholder="Enter transaction ID from payment message"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
            </button>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;
