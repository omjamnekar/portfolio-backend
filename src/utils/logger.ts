import fs from "fs";
import path from "path";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

class Logger {
  private logLevel: LogLevel;
  private logToFile: boolean;
  private logDir: string;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.logToFile = process.env.LOG_TO_FILE === "true";
    this.logDir = process.env.LOG_DIR || "./logs";

    if (this.logToFile) {
      this.ensureLogDirectory();
    }
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || "INFO";
    switch (level) {
      case "ERROR":
        return LogLevel.ERROR;
      case "WARN":
        return LogLevel.WARN;
      case "INFO":
        return LogLevel.INFO;
      case "DEBUG":
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };
    return JSON.stringify(logEntry);
  }

  private writeToFile(formattedMessage: string) {
    if (!this.logToFile) return;

    const date = new Date().toISOString().split("T")[0];
    const logFile = path.join(this.logDir, `app-${date}.log`);

    fs.appendFileSync(logFile, formattedMessage + "\n");
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any) {
    if (level > this.logLevel) return;

    const formattedMessage = this.formatMessage(levelName, message, meta);

    // Console output with colors
    const colors = {
      ERROR: "\x1b[31m", // Red
      WARN: "\x1b[33m", // Yellow
      INFO: "\x1b[36m", // Cyan
      DEBUG: "\x1b[35m", // Magenta
      RESET: "\x1b[0m",
    };

    const colorCode = colors[levelName as keyof typeof colors] || colors.RESET;
    console.log(
      `${colorCode}[${levelName}]${colors.RESET} ${message}${
        meta ? " " + JSON.stringify(meta) : ""
      }`
    );

    // File output
    this.writeToFile(formattedMessage);
  }

  error(message: string, meta?: any) {
    this.log(LogLevel.ERROR, "ERROR", message, meta);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, "WARN", message, meta);
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, "INFO", message, meta);
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, "DEBUG", message, meta);
  }

  // HTTP request logging helper
  logRequest(
    method: string,
    url: string,
    statusCode?: number,
    responseTime?: number,
    meta?: any
  ) {
    const message = `${method} ${url}${statusCode ? ` ${statusCode}` : ""}${
      responseTime ? ` ${responseTime}ms` : ""
    }`;

    if (statusCode && statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  // Database operation logging helper
  logDbOperation(
    operation: string,
    collection: string,
    duration?: number,
    meta?: any
  ) {
    const message = `DB ${operation} on ${collection}${
      duration ? ` (${duration}ms)` : ""
    }`;
    this.debug(message, meta);
  }

  // Performance monitoring helper
  startTimer(label: string) {
    const start = process.hrtime();
    return {
      end: (message?: string) => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = Math.round(seconds * 1000 + nanoseconds / 1000000);
        this.debug(message || `Timer ${label}`, { duration: `${duration}ms` });
        return duration;
      },
    };
  }

  // Create child logger with context
  child(context: any) {
    return {
      error: (message: string, meta?: any) =>
        this.error(message, { ...context, ...meta }),
      warn: (message: string, meta?: any) =>
        this.warn(message, { ...context, ...meta }),
      info: (message: string, meta?: any) =>
        this.info(message, { ...context, ...meta }),
      debug: (message: string, meta?: any) =>
        this.debug(message, { ...context, ...meta }),
    };
  }
}

export const logger = new Logger();

// Middleware for Express
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.logRequest(req.method, req.originalUrl, res.statusCode, duration, {
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      body: req.method === "POST" ? req.body : undefined,
    });
  });

  next();
};
