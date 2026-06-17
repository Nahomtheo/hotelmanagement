# Hotel Booking & Management System

A production-ready hotel booking and management system built with Next.js 15, TypeScript, MongoDB, NextAuth v4, Resend (email verification), and Cloudflare R2 (image storage).

## Features

### User Roles
- **Customer**: Browse rooms, make bookings, view booking history, leave reviews
- **Receptionist**: Check-in/check-out guests, view bookings
- **Admin**: Manage rooms, bookings, users, and view analytics

### Core Features
- User registration with email verification via Resend
- Secure authentication with NextAuth v4
- Room availability checking to prevent double bookings
- Real-time booking confirmation emails
- Guest check-in/check-out system
- Guest reviews and ratings
- Dashboard analytics
- Soft delete for data retention
- Role-based access control (RBAC)
- Image uploads to Cloudflare R2

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Express-like routing
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth v4 with JWT sessions
- **Email**: Resend API for transactional emails
- **Storage**: Cloudflare R2 for image uploads
- **Validation**: Zod schemas with React Hook Form

## Project Structure

```
/app
  /api
    /auth/[...nextauth]      - NextAuth configuration
    /users/profile           - User profile endpoints
    /rooms                   - Room management endpoints
    /bookings/[id]          - Booking operations
    /reviews                - Review management
    /notifications          - Notification endpoints
  /auth
    /login                  - Login page
    /register               - Registration page
    /forgot-password        - Password reset request
    /reset-password/[token] - Password reset form
  /dashboard               - Customer dashboard
  /admin                   - Admin panel
  /receptionist            - Receptionist interface
  /rooms                   - Room listing and booking

/lib
  /mongodb                 - Database connection & models
  /services               - Business logic services
  /validations            - Zod validation schemas
  /utils                  - Helper functions & utilities
  /auth.ts               - Authentication configuration

/components
  /ui                    - shadcn UI components
  (additional components TBD)

/scripts
  /seed.ts              - Database seeding script
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hotel_db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Resend Email API
RESEND_API_KEY=re_xxxxxxxxxx

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=hotel-images
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarecontent.com
```

## Installation & Setup

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

### 3. Seed Database (Optional)
```bash
# Add ts-node to your project first if not already installed
pnpm add -D ts-node

# Run seed script
pnpm run seed
```

This creates:
- 1 Hotel
- 6 Rooms (various types)
- Admin user: `admin@hotel.com` / `admin123`
- Receptionist: `receptionist@hotel.com` / `reception123`
- Sample Customer: `customer@email.com` / `customer123`

### 4. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify-email/[token]` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/[...nextauth]` - NextAuth endpoint

### Rooms
- `GET /api/rooms` - List all rooms with pagination
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/[id]` - Update room (admin only)
- `DELETE /api/rooms/[id]` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - List bookings (role-based)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking
- `POST /api/bookings/[id]/check-in` - Check-in guest
- `POST /api/bookings/[id]/check-out` - Check-out guest

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/[id]` - Delete review

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark as read

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

## Features Implementation Details

### Booking Logic
1. Check room availability for date range
2. Prevent double bookings using date overlap detection
3. Automatically calculate:
   - Number of nights
   - Total price (pricePerNight × nights)
   - Room status updates
4. Send confirmation email via Resend
5. Create in-app notification

### Email Verification
- Tokens generated with 24-hour expiry
- Verification link sent to user's email
- Must verify before logging in
- Resend API handles email delivery

### Image Uploads
- Support for JPEG, PNG, WebP
- Max file size: 5MB
- Stored in Cloudflare R2 bucket
- Returns public CDN URL

## Database Models

### User
- Email verification token & expiry
- Password hashing with bcrypt
- Role-based permissions
- Soft delete support

### Room
- Pricing and capacity
- Amenities list
- Status tracking
- Multiple images support

### Booking
- Availability checking
- Guest information
- Date range with calculated nights
- Price calculation
- Status tracking (pending → confirmed → checked_in → checked_out)

### Review
- Rating (1-5 stars)
- Comment/text
- User and room references
- Timestamp

### Notification
- Type-based (booking_confirmation, check_in_reminder, etc.)
- Read/unread status
- User-specific

### Payment
- Structure for future integration
- Transaction tracking
- Multiple payment methods

### AuditLog
- Admin actions tracking
- Change history
- IP address & user agent
- Immutable for compliance

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based session management (30-day expiry)
- Role-based access control on all endpoints
- Email verification before login
- Secure password reset with token validation
- CORS protection via Next.js middleware
- Input validation with Zod schemas
- Soft deletes for data retention
- Audit logging for compliance

## Performance Optimizations

- Database indexes on frequently queried fields
- Connection pooling with Mongoose caching
- Pagination on list endpoints (default 10 items)
- Optimized queries to prevent N+1 problems
- Image optimization with Cloudflare R2

## Testing Test Accounts

After seeding the database:

**Admin Account**
- Email: `admin@hotel.com`
- Password: `admin123`

**Receptionist Account**
- Email: `receptionist@hotel.com`
- Password: `reception123`

**Customer Account**
- Email: `customer@email.com`
- Password: `customer123`

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Real-time notifications with WebSockets
- Advanced analytics and reporting
- Multi-language support
- SMS notifications
- Automated guest messages
- Loyalty program
- Dynamic pricing
- API rate limiting
- Admin email notifications

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Variables on Vercel
Set all `.env.local` variables in Vercel project settings.

### MongoDB Atlas
Use MongoDB Atlas for cloud database hosting.

### Resend
Create account at [Resend.com](https://resend.com) and get API key.

### Cloudflare R2
Create R2 bucket at [Cloudflare Dashboard](https://dash.cloudflare.com) and configure credentials.

## Troubleshooting

### Email not being sent
- Verify `RESEND_API_KEY` is set correctly
- Check email domain is verified in Resend dashboard
- Check user email inbox and spam folder

### Images not uploading to R2
- Verify R2 credentials are correct
- Ensure bucket name matches configuration
- Check R2 bucket CORS settings

### Database connection errors
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

## Support

For issues, questions, or feature requests, please create an issue in the repository.

## License

MIT
