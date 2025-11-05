# Superadmin Panel - Complete Feature Guide

## Overview
The superadmin panel provides complete CRUD (Create, Read, Update, Delete) control over all aspects of the event management system.

## Access
- **URL**: `/admin`
- **Required Role**: `superadmin`
- **Authentication**: Next-Auth session required

---

## 🎯 Feature Tabs

### 1. **Users Management**
Full control over all registered users.

#### Features:
- ✅ **View All Users** - Name, email, role, join date, status
- ✅ **Delete Users** - Remove user accounts permanently
- ✅ **Suspend/Unsuspend Users** - Temporary account suspension (customizable days)
- ✅ **Change User Roles** - Attendee, Organizer, Speaker, Exhibitor, Admin
- ✅ **Send AI Emails** - Send personalized event emails using Gemini AI

#### Actions Available:
- Delete user account
- Suspend for X days
- Unsuspend immediately
- Send targeted email about specific events
- View suspension status and expiry

---

### 2. **Events Management** ⭐ NEW
Complete event lifecycle management with status controls.

#### Features:
- ✅ **View All Events** - Title, slug, date, location, mode, status
- ✅ **Create Events** - Server-side form in "Bookings" tab
- ✅ **Update Event Status** - Draft, Published, Archived
- ✅ **Delete Events** - Remove events permanently
- ✅ **Filter by Status** - Quick filtering (All/Draft/Published/Archived)
- ✅ **View Event** - Direct link to public event page
- ✅ **Organization Assignment** - Assign events to organizations

#### Status Management:
- **Draft** - Event not visible to public
- **Published** - Event live and bookable
- **Archived** - Historical events, not bookable

---

### 3. **Bookings Management**
View and manage all event registrations.

#### Features:
- ✅ **View All Bookings** - Event, attendee email, booking date
- ✅ **Create New Events** - Full form with all event details
- ✅ **Booking History** - Track who registered for which events
- ✅ **Reminder Status** - See if automated reminders were sent
- ✅ **Organization Support** - Assign events to organizations during creation

---

### 4. **Tickets Management** ⭐ NEW
Full CRUD operations for ticket types.

#### Features:
- ✅ **Create Tickets** - Add ticket types for any event
  - Ticket name
  - Category (General, VIP, Student, Group, Comp, Donation, Sponsor)
  - Price in USD (converted to cents automatically)
  - Quantity available
  - Sales start/end dates (optional)
  - Per-user purchase limit
- ✅ **Edit Tickets** - Inline editing of all fields
- ✅ **Delete Tickets** - Remove ticket types
- ✅ **View by Event** - Select event to see all its tickets
- ✅ **Sales Period Control** - Automatic availability based on dates

#### Ticket Categories:
- General - Standard admission
- VIP - Premium access
- Student - Discounted for students
- Group - Bulk purchase tickets
- Comp - Complimentary/free tickets
- Donation - Pay-what-you-want
- Sponsor - Sponsor tickets

---

### 5. **Orders Management** ⭐ NEW
Monitor and manage all ticket purchases.

#### Features:
- ✅ **View All Orders** - Complete order history
- ✅ **Filter by Status** - Pending, Paid, Failed, Refunded, Partial Refunded
- ✅ **Update Order Status** - Manual status changes
- ✅ **Order Details** - Event, email, items count, total amount
- ✅ **Revenue Tracking** - Automatic revenue calculation
- ✅ **Stripe Session Tracking** - Links to Stripe sessions

#### Order Statuses:
- **Pending** - Payment initiated but not completed
- **Paid** - Successfully paid
- **Failed** - Payment failed
- **Refunded** - Full refund issued
- **Partial Refunded** - Partial refund issued

---

### 6. **Coupons Management** ⭐ NEW
Create and manage discount coupons.

#### Features:
- ✅ **Create Coupons** - Generate discount codes
  - Unique coupon code (auto-uppercase)
  - Type: Percent off or Fixed amount
  - Amount value
  - Expiration date (optional)
  - Max uses limit (optional)
  - Target specific emails (optional)
- ✅ **Edit Coupons** - Inline editing of all fields
- ✅ **Delete Coupons** - Remove coupons
- ✅ **Track Usage** - See how many times each coupon was used
- ✅ **Email Targeting** - Restrict coupons to specific users

#### Coupon Types:
- **Percent** - Percentage discount (e.g., 20%)
- **Fixed** - Fixed dollar amount (e.g., $10)

---

### 7. **Organizations Management** ⭐
View and manage organizations.

#### Features:
- ✅ **View All Organizations** - Name, slug, owner, member count
- ✅ **Create Organizations** - Via API at `/api/orgs`
- ✅ **Member Management** - See organization members
- ✅ **Owner Info** - View organization owner details

#### Organization Roles:
- **Owner** - Full control over organization
- **Admin** - Administrative privileges
- **Staff** - Basic member access

---

### 8. **Email Center**
Mass communication and AI-powered emails.

#### Features:
- ✅ **Manual Emails** - Send to custom lists, all users, or booking attendees
- ✅ **AI-Generated Emails** - Use Gemini AI to create personalized reminders
- ✅ **Event-Specific Emails** - Target attendees of specific events
- ✅ **Custom Prompts** - Guide AI email generation with custom instructions

---

## 🔒 API Routes

### Events
- `GET /api/events` - List all events
- `GET /api/events/[slug]` - Get event details
- `PUT /api/events/[slug]` - Update event
- `PATCH /api/events/[slug]` - Update event status
- `DELETE /api/events/[slug]` - Delete event

### Tickets
- `GET /api/tickets?eventId=xxx` - List tickets for event
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets` - Update ticket
- `DELETE /api/tickets?ticketId=xxx` - Delete ticket

### Orders
- `GET /api/orders` - List orders (filtered by user role)
- `PUT /api/orders` - Update order status

### Coupons
- `GET /api/coupons` - List all coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons` - Update coupon
- `DELETE /api/coupons?couponId=xxx` - Delete coupon

### Organizations
- `GET /api/orgs` - List user's organizations
- `POST /api/orgs` - Create organization

### Checkout
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

---

## 🎨 User Interface Features

### Real-time Updates
All management panels support:
- ✅ Instant CRUD operations
- ✅ Inline editing where applicable
- ✅ Confirmation dialogs for destructive actions
- ✅ Success/error feedback
- ✅ Auto-refresh on changes

### Filtering & Search
- Filter orders by status
- Filter events by status
- Select events to view related tickets
- Real-time data updates

### Responsive Design
- Mobile-friendly tables
- Horizontal scrolling for wide data
- Touch-optimized buttons
- Dark theme with glass morphism

---

## 💰 Payment Integration

### Stripe Features
- ✅ Checkout session creation
- ✅ Webhook handling for payment confirmations
- ✅ Automatic order status updates
- ✅ Support for coupons during checkout
- ✅ Invoice URL tracking

### Webhook Events Handled
- `checkout.session.completed` - Mark order as paid
- `checkout.session.expired` - Mark order as failed
- `charge.refunded` - Handle refunds

---

## 📊 Revenue Tracking

### Automatic Calculations
- Total orders count
- Total revenue from paid orders
- Currency support (USD default)
- Cents-based calculations for accuracy

---

## 🔐 Security & Permissions

### Role-Based Access
- **Superadmin** - Full access to everything
- **Admin** - Access to most features (coupons, orders)
- **Organizer** - Event and ticket management
- **Other roles** - Limited or no admin access

### Protected Routes
All admin API routes check:
1. User authentication (Next-Auth session)
2. User role authorization
3. Proper HTTP methods

---

## 🚀 Quick Start Guide

### 1. Set Up Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://...
NEXTAUTH_SECRET=xxx
SUPERADMIN_EMAIL=admin@example.com
```

### 2. Create Superadmin User
1. Register a user account
2. Manually set role to `superadmin` in database
3. Log in and navigate to `/admin`

### 3. Set Up Stripe Webhook
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
4. Copy webhook secret to environment variables

### 4. Create Your First Event
1. Go to Admin Panel > Bookings tab
2. Fill out "Create New Event" form
3. Click "Create Event"

### 5. Add Tickets to Event
1. Go to Admin Panel > Tickets tab
2. Click "Create Ticket"
3. Select your event
4. Fill in ticket details
5. Click "Create Ticket"

### 6. Create Discount Coupons
1. Go to Admin Panel > Coupons tab
2. Click "Create Coupon"
3. Enter code (e.g., LAUNCH50)
4. Select type and amount
5. Click "Create Coupon"

---

## 📝 Best Practices

### Event Management
- Always test events in **Draft** status first
- Use **Published** status only when ready for public
- **Archive** old events instead of deleting
- Assign events to organizations for better management

### Ticket Management
- Set sales start/end dates to control availability
- Use per-user limits for popular events
- Create multiple ticket tiers (General, VIP, Student)
- Monitor ticket quantities and adjust as needed

### Coupon Management
- Use descriptive codes (SUMMER25, VIP50)
- Set expiration dates for time-limited offers
- Limit max uses to control budget
- Target specific emails for exclusive offers

### Order Management
- Monitor pending orders regularly
- Manually update failed orders if payment received
- Process refunds through Stripe, then update order status
- Export order data for accounting

---

## 🛠️ Troubleshooting

### Orders Stuck in Pending
- Check Stripe webhook configuration
- Verify webhook secret matches environment variable
- Check Stripe dashboard for session status
- Manually update order status if needed

### Coupons Not Working
- Verify coupon code is correct (case-insensitive)
- Check expiration date hasn't passed
- Ensure max uses not exceeded
- Confirm user email is in target list (if specified)

### Tickets Not Showing
- Verify event ID is correct
- Check sales start/end dates
- Ensure quantity > 0
- Confirm event is published

---

## 🎯 Complete Feature Checklist

- ✅ User CRUD operations
- ✅ Event CRUD operations with status management
- ✅ Booking view and management
- ✅ Ticket CRUD operations
- ✅ Order viewing and status management
- ✅ Coupon CRUD operations
- ✅ Organization viewing and management
- ✅ Email broadcasting (manual and AI)
- ✅ Revenue tracking
- ✅ Stripe payment integration
- ✅ Webhook handling
- ✅ Role-based access control
- ✅ Real-time UI updates
- ✅ Responsive design
- ✅ Inline editing
- ✅ Filtering and search

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API routes in `/app/api`
3. Check browser console for errors
4. Verify environment variables
5. Test with Stripe test mode first

---

**Last Updated**: Implementation Complete
**Version**: 1.0.0
**Status**: Production Ready ✅
