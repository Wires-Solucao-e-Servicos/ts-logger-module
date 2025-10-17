# TypeScript Logger Module

A comprehensive TypeScript logging module with file-based logging and email notification capabilities.

## Features

- **Multiple log levels**: Info, Warning, Debug, Error
- **Automatic email notifications** for errors via SMTP
- **File-based logging** with automatic directory creation
- **Timestamp tracking** with formatted dates (DD/MM/YYYY HH:mm:ss)
- **Configurable client naming** via environment variables
- **Email throttling** to prevent spam (default 1 minute between errors)
- **Synchronous file operations** for fast logging
- **Fire-and-forget email delivery** without blocking execution
- **Singleton pattern** for consistent logger instance across application

## Installation

```bash
npm install ts-logger-module
```

## Quick Start

### Basic Usage

```typescript
import { logger } from './services/fileService';

// Log informational messages
logger.info('APP_START', 'MAIN', 'Application started successfully');

// Log warnings
logger.warn('CONFIG_DEFAULT', 'MAIN', 'Using default configuration');

// Log debug information
logger.debug('USER_ACTION', 'AUTH', 'User login attempt');

// Log errors (automatically sends email if SMTP configured)
logger.error('DB_CONNECTION', 'DATABASE', 'Failed to connect to database');
```

## Directory Structure

```
src/
├── config/
│   └── config.ts                 # Configuration manager (client name, SMTP settings)
├── services/
│   ├── fileService.ts            # Main logger service
│   └── emailService.ts           # SMTP email service
├── interfaces/
│   └── interfaces.ts             # TypeScript interfaces (SMTPConfig)
└── index.ts                      # Main exports
```

## Exports

The module exports four main items:

```typescript
export * from './interfaces/interfaces'; // TypeScript interfaces
export { logger } from './services/fileService'; // Logger instance
export { loggerConfig } from './config/config'; // Configuration manager
export { loggerMailer } from './services/emailService'; // Email service
```

### Available Imports

```typescript
import {
  logger, // Main logger instance
  loggerConfig, // Configuration access
  loggerMailer, // Email service
  SMTPConfig, // SMTP configuration interface
} from 'ts-logger-module';
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Logger Configuration
CLIENT_NAME=MyApplication

# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_TO=recipient@example.com
```

### Configuration File

The logger auto-initializes on first use. No additional setup needed.

## API Reference

### Core Functions

#### `logger.info(code, module, text)`

Logs informational messages.

```typescript
logger.info('APP_001', 'Application', 'Application started');
```

#### `logger.warn(code, module, text)`

Logs warning messages.

```typescript
logger.warn('CONFIG_DEFAULT', 'Configuration', 'Using default settings');
```

#### `logger.debug(code, module, text)`

Logs debug messages.

```typescript
logger.debug('DEBUG_001', 'Cache', 'Cache miss detected');
```

#### `logger.error(code, module, text)`

Logs error messages and automatically sends email notification if SMTP is configured.

```typescript
logger.error('DB_001', 'Database', 'Connection failed to primary server');
```

### Configuration Functions

#### `logger.emailThrottle`

Set custom email throttle interval (in milliseconds). Default is 60000 (1 minute).

```typescript
logger.emailThrottle = 120000; // 2 minutes between emails
```

## Log Format

Logs follow this structured format:

```
[CLIENT_NAME] [TIMESTAMP] [LEVEL] [CODE] [MODULE]: message
```

Example:

```
[MyApplication] [23/06/2025 14:30:15] [ERROR] [DB_001] [Database]: Connection failed
```

## File Location

The logger automatically creates logs in:

**Windows:**

```
C:\Users\YourUsername\MyApplication\log.txt
```

**macOS/Linux:**

```
~/MyApplication/log.txt
```

The path is: `{HOME_DIR}/{CLIENT_NAME}/log.txt`

## Log File Format

Each application start creates a new separator:

```
__________________________________________________

[MyApplication] [23/06/2025 14:30:15] Logger successfully initialized.
[23/06/2025 14:30:16] [INFO] [APP_001] [Application]: Application started
[23/06/2025 14:30:17] [ERROR] [DB_001] [Database]: Connection failed
__________________________________________________

[MyApplication] [23/06/2025 15:00:00] Logger successfully initialized.
[23/06/2025 15:00:01] [INFO] [APP_001] [Application]: Application restarted
```

## Email Notifications

When an error is logged and SMTP is properly configured, an email is automatically sent with the following format:

**Subject:**

```
[MyApplication] Error Alert - DB_001
```

**Body:**

```html
<h2>Error Report</h2>
<p><strong>Client:</strong> MyApplication</p>
<p><strong>Error Code:</strong> DB_001</p>
<p><strong>Module:</strong> Database</p>
<p><strong>Error Message:</strong> Connection failed to primary server</p>
<p><strong>Timestamp:</strong> 23/06/2025 14:30:15</p>
```

### Email Throttling

By default, emails are sent at most once per minute (60 seconds) to prevent spam. Multiple errors within this interval will only trigger one email.

To change the throttle interval:

```typescript
// Send email alerts every 2 minutes
logger.emailThrottle = 120000;

// Send email alerts every 5 minutes
logger.emailThrottle = 300000;
```

## Usage Examples

### Basic Application Logging

```typescript
import { logger } from 'ts-logger-module';

async function main() {
  try {
    logger.info('APP_START', 'Main', 'Application initializing');

    // Your application code
    const data = await fetchData();
    logger.info('DATA_FETCH', 'Main', 'Data fetched successfully');

    logger.debug('PROCESS_END', 'Main', 'Application cleanup');
  } catch (error) {
    logger.error('APP_CRITICAL', 'Main', (error as Error).message);
  }
}

main();
```

### Database Operations Logging

```typescript
import { logger } from './services/fileService';

async function connectDatabase() {
  try {
    logger.debug('DB_CONNECT_ATTEMPT', 'Database', 'Attempting connection');

    const connection = await db.connect();
    logger.info('DB_CONNECTED', 'Database', 'Connected successfully');

    return connection;
  } catch (error) {
    logger.error('DB_CONNECTION_ERROR', 'Database', (error as Error).message);
    throw error;
  }
}
```

### API Request Logging

```typescript
import { logger } from './services/fileService';

async function handleRequest(req, res) {
  try {
    logger.debug('API_REQUEST', 'Handler', `POST /api/users`);

    const result = await processRequest(req);
    logger.info('API_SUCCESS', 'Handler', 'Request processed');

    res.json(result);
  } catch (error) {
    logger.error('API_ERROR', 'Handler', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Interfaces

### SMTPConfig

```typescript
interface SMTPConfig {
  to: string;
  from: string;
  server: string;
  port: number;
  username: string;
  password: string;
}
```

## Dependencies

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## Error Handling

The logger includes comprehensive error handling:

- **File operations**: Automatic directory creation with error logging
- **SMTP validation**: Configuration validation before sending emails
- **Graceful degradation**: If SMTP is not configured, errors are only logged locally
- **Silent failures**: Email send failures don't crash the application

## Performance Considerations

- **Synchronous file writing**: Fast, non-blocking for local logs
- **Fire-and-forget emails**: Email sending doesn't block application execution
- **Email throttling**: Prevents server overload from repeated error emails
- **Minimal overhead**: Logging adds minimal latency to application operations

## Troubleshooting

### SMTP Not Configured

**Issue:** Errors are logged but no emails are sent.

**Solution:** Ensure all SMTP environment variables are set:

- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `SMTP_TO`

Verify with:

```typescript
import { loggerConfig } from 'ts-logger-module';

console.log('SMTP Enabled:', loggerConfig.smtpEnabled);
console.log('SMTP Config:', loggerConfig.smtpConfig);

### Email Not Sending

**Issue:** Email configuration seems correct but emails aren't being sent.

**Solution:** Check that:

1. At least 1 minute (default throttle) has passed since the last error email
2. The SMTP credentials are correct
3. The server allows connections on the specified port
4. Gmail users have enabled "Less secure app access" or use an App Password

### Log File Not Created

**Issue:** No log file is being created.

**Solution:** Ensure:

1. The home directory is accessible and writable
2. The application has write permissions to the home directory

## Author

Wires Solução e Serviços
Email: vinicius@wires.com.br

---

© 2025 Wires Solução e Serviços. All rights reserved.
```
