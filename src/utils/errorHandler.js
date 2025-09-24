// Error handler utility for user-friendly error messages

export const getErrorMessage = (error) => {
  // Network errors
  if (!navigator.onLine) {
    return "You're offline. Please check your internet connection.";
  }

  // Supabase specific errors
  if (error?.code) {
    switch (error.code) {
      // Auth errors
      case 'invalid_credentials':
        return "Invalid username or password. Please try again.";
      case 'email_not_confirmed':
        return "Please confirm your email address to continue.";
      case 'signup_disabled':
        return "Registration is currently disabled.";
      case 'weak_password':
        return "Password is too weak. Use at least 8 characters with numbers and letters.";
      case 'email_address_invalid':
        return "Please enter a valid email address.";
      case 'user_already_registered':
        return "An account with this email already exists.";

      // Database errors
      case 'PGRST116':
        return "Record not found.";
      case 'PGRST301':
        return "You don't have permission to perform this action.";
      case '23505':
        return "This record already exists.";
      case '23503':
        return "Cannot delete this record because it's being used elsewhere.";
      case '42501':
        return "You don't have permission to access this data.";

      // Network/Connection errors
      case 'NETWORK_ERROR':
      case 'ENOTFOUND':
      case 'ECONNREFUSED':
        return "Unable to connect to the server. Please check your internet connection.";
      case 'TIMEOUT':
        return "Request timed out. Please try again.";

      default:
        break;
    }
  }

  // HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "You need to log in to continue.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "There's a conflict with your request. Please try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Our team has been notified. Please try again later.";
      case 502:
      case 503:
        return "Service temporarily unavailable. Please try again in a few minutes.";
      default:
        break;
    }
  }

  // Generic error messages based on context
  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return "Connection error. Please check your internet and try again.";
    }
    if (message.includes('timeout')) {
      return "Request timed out. Please try again.";
    }
    if (message.includes('unauthorized')) {
      return "You need to log in to continue.";
    }
    if (message.includes('forbidden')) {
      return "You don't have permission to perform this action.";
    }
    if (message.includes('not found')) {
      return "The requested data was not found.";
    }
    if (message.includes('duplicate') || message.includes('unique')) {
      return "This record already exists.";
    }
  }

  // Fallback message
  return "Something went wrong. Please try again or contact support if the problem persists.";
};

export const getBettingErrorMessage = (error) => {
  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes('insufficient')) {
      return "You don't have enough budget for this bet.";
    }
    if (message.includes('blocked') || message.includes('limit')) {
      return "Your account has reached the betting limit.";
    }
    if (message.includes('minimum')) {
      return "Bet amount is below the minimum required.";
    }
    if (message.includes('maximum')) {
      return "Bet amount exceeds the maximum allowed.";
    }
    if (message.includes('pending')) {
      return "You have pending bets. Please wait for them to be resolved.";
    }
  }

  return getErrorMessage(error);
};

export const getAuthErrorMessage = (error) => {
  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes('username') && message.includes('not found')) {
      return "Username not found. Please check your username or register a new account.";
    }
    if (message.includes('password')) {
      return "Incorrect password. Please try again.";
    }
    if (message.includes('rate limit')) {
      return "Too many login attempts. Please wait 5 minutes and try again.";
    }
  }

  return getErrorMessage(error);
};

export const logError = (error, context = '') => {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    code: error?.code || 'NO_CODE',
    status: error?.status || 'NO_STATUS',
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  console.error(`[${context}] Error:`, errorInfo);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or your own logging endpoint
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorTracking(errorInfo);
  }

  return errorInfo;
};