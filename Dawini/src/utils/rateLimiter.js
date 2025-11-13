// Simple rate limiter to prevent too many API calls
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) { // 10 requests per minute by default
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
  }

  canMakeRequest() {
    const now = Date.now()
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    // Check if we can make a new request
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now)
      return true
    }
    
    return false
  }

  getTimeUntilNextRequest() {
    if (this.requests.length === 0) return 0
    
    const oldestRequest = Math.min(...this.requests)
    const timeSinceOldest = Date.now() - oldestRequest
    return Math.max(0, this.timeWindow - timeSinceOldest)
  }
}

// Create rate limiters for different types of requests
export const messageRateLimiter = new RateLimiter(5, 30000) // 5 requests per 30 seconds
export const unreadCountRateLimiter = new RateLimiter(3, 60000) // 3 requests per minute
export const generalRateLimiter = new RateLimiter(10, 60000) // 10 requests per minute

// Helper function to make rate-limited requests
export async function makeRateLimitedRequest(rateLimiter, requestFn, retryDelay = 1000) {
  if (rateLimiter.canMakeRequest()) {
    return await requestFn()
  } else {
    const waitTime = rateLimiter.getTimeUntilNextRequest()
    console.warn(`Rate limit exceeded. Waiting ${waitTime}ms before retry.`)
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    return await makeRateLimitedRequest(rateLimiter, requestFn, retryDelay)
  }
}
