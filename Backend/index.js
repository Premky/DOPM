import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMySQL from 'express-mysql-session';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from "crypto";
import errorHandler from './middlewares/errorHandler.js';
import './services/markOffline.js';

import { authRouter } from './routes/authRoute.js';
import { adminRouter } from './routes/adminRoute.js';
import { publicRouter } from './routes/publicRoutes.js';
import { employeRouter } from './routes/employeRoute.js';
import { bandiRouter } from './routes/bandiRuoute.js';
import { payroleRouter } from './routes/payroleRoute.js';
import { bandiTransferRouter } from './routes/bandiTransferRoute.js';
dotenv.config();

const app = express();
// const port = process.env.PORT || 3003;
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// ------------------- 1️⃣ Rate Limiting -------------------
// Global limiter (protects against DDoS)
const globalLimiter = rateLimit( {
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 500,
  message: 'Too many requests from this IP, please try again later.'
} );
// app.use(globalLimiter);

// Login-specific limiter
const loginLimiter = rateLimit( {
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many login attempts. Try again later.'
} );
// app.use("/auth/login", loginLimiter);

// ------------------- 2️⃣ CORS -------------------
const hardOrigins = [
  'http://127.0.0.1:3003', 'http://127.0.0.1:5173',
  'http://localhost:3003', 'http://localhost:5173',
  'http://pmis.dopm.gov.np', 'https://pmis.dopm.gov.np',
  'http://202.45.146.226', 'http://202.45.146.226:5173',
  'http://10.5.60.151', 'http://10.5.60.151:5173',
  'http://192.168.18.211:5173', 'http://192.168.18.17:5173'
];


// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split( ',' ) || hardOrigins;
const allowedOrigins = hardOrigins;

app.use( cors( {
  origin: ( origin, callback ) => {
    if ( !origin ) return callback( null, true ); // allow server-to-server
    if ( allowedOrigins.includes( origin ) ) {
      return callback( null, true );
    }
    return callback( new Error( "Not allowed by CORS: " + origin ) );
  },
  credentials: true
} ) );

// CORS logging middleware (dev only)
if ( process.env.NODE_ENV !== 'production' ) {
  app.use( ( req, res, next ) => {
    res.on( 'finish', () => {
      const corsOrigin = res.getHeader( "Access-Control-Allow-Origin" );
      const corsCreds = res.getHeader( "Access-Control-Allow-Credentials" );
      if ( corsOrigin || corsCreds ) {
        console.log( "CORS headers sent:", {
          origin: req.headers.origin,
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Credentials": corsCreds
        } );
      }
    } );
    next();
  } );
}


// ------------------- 3️⃣ Security Headers -------------------
// HSTS: enforce HTTPS
// app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));

// Other Helmet protections
app.use( helmet.hidePoweredBy() );
app.use( helmet.noSniff() );
app.use( helmet.frameguard( { action: 'deny' } ) );
app.use( helmet.xssFilter() );
app.use( helmet.ieNoOpen() );
app.use( helmet.dnsPrefetchControl( { allow: false } ) );
app.use( helmet.referrerPolicy( { policy: 'no-referrer' } ) );

// CSP with nonce
app.use( ( req, res, next ) => {
  res.locals.nonce = crypto.randomBytes( 16 ).toString( 'base64' );
  next();
} );
app.use( helmet.contentSecurityPolicy( {
  useDefaults: true,
  directives: {
    "script-src": ["'self'", ( req, res ) => `'nonce-${ res.locals.nonce }'`],
    "img-src": ["'self'", "data:", "https:"],
    "style-src": ["'self'", "'unsafe-inline'"]
  }
} ) );

// ------------------- 4️⃣ Body Parsing -------------------
app.use( express.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieParser() );

// ------------------- 5️⃣ Compression & Logging -------------------
app.use( compression() );
if ( process.env.NODE_ENV !== 'production' ) {
  app.use( morgan( 'dev' ) );
} else {
  app.use( morgan( 'tiny' ) );
}

// ------------------- 6️⃣ Session -------------------
const MySQLStore = connectMySQL( session );
const sessionStore = new MySQLStore( {
  host: process.env.DB_HOST || '127.0.0.1',
  ...( process.env.DB_PORT && { port: Number( process.env.DB_PORT ) } ),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 min
  expiration: 86400000 // 1 day
} );

// Detect environment
const isProd = process.env.NODE_ENV === 'production';

app.use( session( {
  secret: process.env.SESSION_SECRET,
  name: 'dopm_app',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  unset: 'destroy',
  cookie: {
    httpOnly: true,
    secure: isProd,                          // ✅ HTTPS only in prod
    sameSite: isProd ? 'none' : 'lax',       // ✅ Allow cross-site only in prod
    maxAge: 24 * 60 * 60 * 1000,
    // domain: isProd ? '.dopm.gov.np' : undefined // ✅ prod: allow subdomains, dev: auto
  }
} ) );

// ------------------- 7️⃣ Static Files -------------------
app.use( '/uploads', express.static( path.join( __dirname, 'uploads' ) ) );
app.use( express.static( 'Public' ) );

// ------------------- 8️⃣ Routes -------------------
app.use( '/admin', adminRouter );
app.use( '/auth', authRouter );
app.use( '/public', publicRouter );
app.use( '/emp', employeRouter );
app.use( '/bandi', bandiRouter );
app.use( '/payrole', payroleRouter );
app.use( '/bandiTransfer', bandiTransferRouter );

// ------------------- 9️⃣ Error Handler -------------------
app.use( errorHandler );

// ------------------- 🔟 Server Start -------------------
// app.listen( port, () => console.log( `🚀 Server running on port ${ port }` ) );
const PORT = process.env.PORT || 3003;
if ( isProd ) {
  // ✅ Production: bind to all interfaces (for reverse proxy / nginx)
  app.listen( PORT, () => {
    console.log( `🚀 Backend running on https://pmis.dopm.gov.np (port ${ PORT })` );
  } );
} else {
  // ✅ Development: bind to localhost
  app.listen( PORT, 'localhost', () => {
    console.log( `🚀 Backend running on http://localhost:${ PORT }` );
  } );
}

// ------------------- 1️⃣1️⃣ Graceful Shutdown -------------------
process.on( 'SIGINT', async () => {
  console.log( '👋 Server shutting down...' );
  // Close session store connections if needed
  sessionStore.close();
  process.exit();
} );
