# TypeScript Logger Module

A comprehensive TypeScript logging module with file-based logging and email notification capabilities.

## Features

- **Multiple log levels**: Info, Warning, Debug, Error
- **Automatic email notifications** for errors via SMTP
- **File-based logging** with automatic directory creation
- **Monthly log rotation** with automatic filename generation (log-YYYY-mmm.txt)
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
import { logger } from 'ts-logger-module';

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

The module exports two main items:

```typescript
export * from './interfaces/interfaces'; // TypeScript interfaces
export { logger } from './services/fileService'; // Logger instance with config and mailer
```

### Available Imports

```typescript
import {
  logger,      // Main logger instance
  SMTPConfig,  // SMTP configuration interface
} from 'ts-logger-module';

// Access configuration and mailer through logger
logger.config;  // Configuration manager
logger.mailer;  // Email service
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Logger Configuration
CLIENT_NAME=MyApplication

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
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

### Configuration Access

#### `logger.config`

Access the configuration manager for runtime configuration changes.

```typescript
// Get current client name
console.log(logger.config.clientName);

// Change client name (updates log directory)
logger.config.clientName = 'NewAppName';

// Get log directory
console.log(logger.config.directory);

// Change log directory
logger.config.directory = '/custom/path/logs';

// Check SMTP status
console.log(logger.config.smtpEnabled);
console.log(logger.config.smtpConfig);

// Enable debug mode for SMTP
logger.config.debug = true;

// Get current log filename (auto-generated monthly)
console.log(logger.config.filename); // e.g., "log-2025-jan.txt"
```

### Email Service Access

#### `logger.mailer`

Access the email service directly.

```typescript
// Check if mailer is ready
if (logger.mailer.isReady) {
  // Send custom error email
  await logger.mailer.sendErrorMail('CUSTOM_001', 'CustomModule', 'Custom error message');
}
```

### Throttle Configuration

#### `logger.throttle`

Set custom email throttle interval (in milliseconds). Default is 60000 (1 minute).

```typescript
logger.throttle = 120000; // 2 minutes between emails
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

## File Location and Naming

The logger automatically creates logs in the home directory with monthly rotation:

**Windows:**

```
C:\Users\YourUsername\MyApplication\log-2025-jan.txt
C:\Users\YourUsername\MyApplication\log-2025-feb.txt
```

**macOS/Linux:**

```
~/MyApplication/log-2025-jan.txt
~/MyApplication/log-2025-feb.txt
```

The path is: `{HOME_DIR}/{CLIENT_NAME}/log-{YEAR}-{month}.txt`

Log files are automatically rotated monthly, with filenames like:
- `log-2025-jan.txt`
- `log-2025-feb.txt`
- `log-2025-dec.txt`

## Log File Format

Each application start creates a new separator:

```
__________________________________________________

[MyApplication] [23/06/2025 14:30:15] Logger successfully initialized.
[MyApplication] [23/06/2025 14:30:16] [INFO] [APP_001] [Application]: Application started
[MyApplication] [23/06/2025 14:30:17] [ERROR] [DB_001] [Database]: Connection failed
__________________________________________________

[MyApplication] [23/06/2025 15:00:00] Logger successfully initialized.
[MyApplication] [23/06/2025 15:00:01] [INFO] [APP_001] [Application]: Application restarted
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
logger.throttle = 120000;

// Send email alerts every 5 minutes
logger.throttle = 300000;
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
import { logger } from 'ts-logger-module';

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
import { logger } from 'ts-logger-module';

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

### Runtime Configuration Changes

```typescript
import { logger } from 'ts-logger-module';

// Change application name dynamically
logger.config.clientName = 'ProductionApp';

// Change log directory
logger.config.directory = '/var/log/myapp';

// Enable SMTP debug mode
logger.config.debug = true;

// Check configuration
console.log('SMTP Enabled:', logger.config.smtpEnabled);
console.log('Current log file:', logger.config.filename);
console.log('Log directory:', logger.config.directory);
```

## Interfaces

### SMTPConfig

```typescript
interface SMTPConfig {
  to: string;
  from: string;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
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
    "@types/node": "^20.0.0",
    "@types/nodemailer": "^6.4.0"
  }
}
```

## Error Handling

The logger includes comprehensive error handling:

- **File operations**: Automatic directory creation with error logging
- **SMTP validation**: Configuration validation before sending emails
- **Port validation**: Automatic secure mode detection (port 465)
- **Graceful degradation**: If SMTP is not configured, errors are only logged locally
- **Silent failures**: Email send failures don't crash the application

## Performance Considerations

- **Synchronous file writing**: Fast, non-blocking for local logs
- **Fire-and-forget emails**: Email sending doesn't block application execution
- **Email throttling**: Prevents server overload from repeated error emails
- **Monthly log rotation**: Automatic file rotation prevents single large log files
- **Minimal overhead**: Logging adds minimal latency to application operations

## Troubleshooting

### SMTP Not Configured

**Issue:** Errors are logged but no emails are sent.

**Solution:** Ensure all SMTP environment variables are set:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `SMTP_TO`

Verify with:

```typescript
import { logger } from 'ts-logger-module';

console.log('SMTP Enabled:', logger.config.smtpEnabled);
console.log('SMTP Config:', logger.config.smtpConfig);
```

### Email Not Sending

**Issue:** Email configuration seems correct but emails aren't being sent.

**Solution:** Check that:

1. At least 1 minute (default throttle) has passed since the last error email
2. The SMTP credentials are correct
3. The server allows connections on the specified port
4. Port 465 uses secure mode automatically, other ports use STARTTLS
5. Gmail users have enabled "Less secure app access" or use an App Password

### Log File Not Created

**Issue:** No log file is being created.

**Solution:** Ensure:

1. The home directory is accessible and writable
2. The application has write permissions to the home directory
3. The CLIENT_NAME environment variable doesn't contain invalid path characters

### Wrong Log Filename

**Issue:** Log file has unexpected name.

**Solution:** The logger automatically generates monthly log filenames. The format is:
- `log-{YEAR}-{month}.txt`
- Example: `log-2025-jan.txt`, `log-2025-feb.txt`

You can check the current filename with:

```typescript
console.log(logger.config.filename);
```

## Author

Wires Solução e Serviços  
Email: vinicius@wires.com.br

---

© 2025 Wires Solução e Serviços. All rights reserved.