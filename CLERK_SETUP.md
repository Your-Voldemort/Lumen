# Clerk Authentication Setup Guide

This project has been configured with Clerk authentication. Follow these steps to complete the setup:

## 1. Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a free account or sign in
3. Create a new application

## 2. Get Your Publishable Key

1. In your Clerk dashboard, go to "Developers" → "API Keys"
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## 3. Update Environment Variables

1. Open the `.env.local` file in the project root
2. Replace the placeholder value with your actual publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_actual_publishable_key_here
   ```

## 4. Configure Clerk Settings (Optional)

In your Clerk dashboard, you can configure:

### Sign-in Options
- Email/Password
- Social logins (Google, GitHub, etc.)
- Phone number authentication

### User Profile
- Required/optional fields
- Custom metadata fields

### Appearance
- Customize the look of the sign-in/sign-up forms
- Add your branding

## 5. Features Included

✅ **Sign Up/Sign In Pages**: Custom-styled authentication pages
✅ **Role-based Access**: Students, Faculty, and Admin roles
✅ **Protected Routes**: Automatic redirect to sign-in if not authenticated
✅ **User Profile Setup**: Role selection and additional info after signup
✅ **User Button**: Dropdown with profile and sign-out options
✅ **Integration**: Seamlessly integrated with existing app functionality

## 6. User Roles

The system supports three roles:

- **Student**: Submit and track academic activities
- **Faculty**: Review and approve student submissions
- **Admin**: Manage users and generate reports

After signing up, users will be prompted to select their role and provide additional information.

## 7. Testing

You can test with any email address. Clerk provides:
- Instant sign-up/sign-in
- Email verification
- Password reset functionality
- Session management

## 8. Production Deployment

For production:
1. Get your production publishable key from Clerk
2. Update the environment variable
3. Configure your production domain in Clerk dashboard

## Troubleshooting

If you encounter issues:
1. Ensure your publishable key is correct
2. Check that `.env.local` is not committed to git
3. Verify your Clerk application is properly configured
4. Check the browser console for any errors

## Need Help?

- [Clerk Documentation](https://docs.clerk.com)
- [Clerk React Guide](https://docs.clerk.com/quickstarts/react)
- [Clerk Community](https://discord.gg/b5rXHjb)