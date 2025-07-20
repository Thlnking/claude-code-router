import { existsSync, readFileSync, writeFileSync } from 'fs';
import { 
  getPidFile, 
  getReferenceCountFile, 
  isDevMode 
} from '../constants';
import { readConfigFile } from '.';

export function incrementReferenceCount() {
    const referenceCountFile = getReferenceCountFile();
    let count = 0;
    if (existsSync(referenceCountFile)) {
        count = parseInt(readFileSync(referenceCountFile, 'utf-8')) || 0;
    }
    count++;
    writeFileSync(referenceCountFile, count.toString());
}

export function decrementReferenceCount() {
    const referenceCountFile = getReferenceCountFile();
    let count = 0;
    if (existsSync(referenceCountFile)) {
        count = parseInt(readFileSync(referenceCountFile, 'utf-8')) || 0;
    }
    count = Math.max(0, count - 1);
    writeFileSync(referenceCountFile, count.toString());
}

export function getReferenceCount(): number {
    const referenceCountFile = getReferenceCountFile();
    if (!existsSync(referenceCountFile)) {
        return 0;
    }
    return parseInt(readFileSync(referenceCountFile, 'utf-8')) || 0;
}

export function isServiceRunning(): boolean {
    const pidFile = getPidFile();
    console.log("====", process.env.NODE_ENV, pidFile, existsSync(pidFile));

    if (!existsSync(pidFile)) {
        return false;
    }

    try {
        const pid = parseInt(readFileSync(pidFile, 'utf-8'));
        // process.kill(pid, 0);
        return true;
    } catch (e) {
        // Process not running, clean up pid file
        cleanupPidFile();
        return false;
    }
}

export function savePid(pid: number) {
    const pidFile = getPidFile();
    writeFileSync(pidFile, pid.toString());
}

export function cleanupPidFile() {
    const pidFile = getPidFile();
    if (existsSync(pidFile)) {
        try {
            const fs = require('fs');
            fs.unlinkSync(pidFile);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

export function getServicePid(): number | null {
    const pidFile = getPidFile();
    if (!existsSync(pidFile)) {
        return null;
    }
    
    try {
        const pid = parseInt(readFileSync(pidFile, 'utf-8'));
        return isNaN(pid) ? null : pid;
    } catch (e) {
        return null;
    }
}

export async function getServiceInfo() {
    const pid = getServicePid();
    const running = isServiceRunning();
    const config = await readConfigFile();
    const pidFile = getPidFile();
    
    return {
        running,
        pid,
        port: config.PORT,
        endpoint: `http://127.0.0.1:${config.PORT}`,
        pidFile,
        referenceCount: getReferenceCount(),
        devMode: isDevMode()
    };
}
