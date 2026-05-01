// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

async function verifyPassword(inputPassword, storedPassword, userId) {
  const isBcrypt = storedPassword.startsWith('$2');

  if (isBcrypt) {
    return await bcrypt.compare(inputPassword, storedPassword);
  } else {
    const isValid = inputPassword === storedPassword;
    if (isValid && userId) {
      upgradePasswordHash(userId, inputPassword).catch(console.error);
    }
    return isValid;
  }
}

async function upgradePasswordHash(userId, plainPassword) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const hashed  = await bcrypt.hash(plainPassword, 12);

  await fetch(`${baseUrl}/api/data?collection=auth`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id: userId, password: hashed }),
  });
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        nameOrEmail:   { label: "Name or Email",  type: "text"     },
        password:      { label: "Password",       type: "password" },
        name:          { label: "Name",           type: "text"     },
        phone:         { label: "Phone",          type: "text"     },
        address:       { label: "Address",        type: "text"     },
        paymentMethod: { label: "Payment Method", type: "text"     },
      },

      async authorize(credentials) {
        if (!credentials?.nameOrEmail && !credentials?.name) return null;

        const identifier = credentials.nameOrEmail || credentials.name;
        const baseUrl    = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        try {
          const checkResponse = await fetch(`${baseUrl}/api/data?collection=auth`, {
            cache: 'no-store',
          });
          if (!checkResponse.ok) return null;

          const authData = await checkResponse.json();

          const users =
            Array.isArray(authData)      ? authData      :
            Array.isArray(authData.auth) ? authData.auth :
            Array.isArray(authData.data) ? authData.data : [];

          const user = users.find(u =>
            u.name?.toLowerCase().trim()  === identifier.toLowerCase().trim() ||
            u.email?.toLowerCase().trim() === identifier.toLowerCase().trim()
          );

          if (!user) return null;

          if (credentials.password && user.password) {
            const isValid = await verifyPassword(
              credentials.password,
              user.password,
              user._id?.toString()
            );
            if (!isValid) return null;
          }

          return {
            id:            user._id?.toString() || user.name,
            name:          user.name,
            phone:         user.phone          || credentials.phone,
            address:       user.address        || credentials.address,
            paymentMethod: user.paymentMethod  || credentials.paymentMethod || 'cash',
          };
        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge:   60 * 60 * 24 * 7,
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id            = user.id;
        token.name          = user.name;
        token.phone         = user.phone;
        token.address       = user.address;
        token.paymentMethod = user.paymentMethod;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id            = token.id;
        session.user.name          = token.name;
        session.user.phone         = token.phone;
        session.user.address       = token.address;
        session.user.paymentMethod = token.paymentMethod;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/'))                  return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };