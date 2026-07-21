import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from './mongodb';
import User from './mongodb/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          await connectDB();

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isDeleted: false,
          });

          if (!user) {
            throw new Error('User not found');
          }

          if (!user.emailVerified) {
            throw new Error('Please verify your email first');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            image: user.profileImage || undefined,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(message);
        }
      },
    }),
  ],

callbacks: {
async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const cleanEmail = user.email?.toLowerCase();
          const existing = await User.findOne({ email: cleanEmail });

          if (!existing) {
            // Trim the raw Google user name directly for both fields
            const rawName = (user.name as string) || 'Google User';

            const newUser = await User.create({
              email: cleanEmail,
              firstName: rawName.trim(),
              lastName: rawName.trim(), 
              // Satisfy schema requirements for Google-registered accounts
              password: '$2a$12$OAuthDummyPasswordPlaceholderNotUsedForLogin', 
              role: 'customer',
              emailVerified: true, 
              profileImage: user.image || '',
              isDeleted: false
            });

            user.id = newUser._id.toString();
            (user as any).role = newUser.role.toString();
          } else {
            user.id = existing._id.toString();
            (user as any).role = existing.role.toString();
          }
        } catch (error) {
          console.error("Error creating/finding Google user in DB:", error);
          return false; 
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // On initial sign-in, look up the user in the DB to grab their real ID and Role
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role; // This correctly grabs "admin" for your account
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};