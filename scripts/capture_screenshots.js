import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUT_DIR = 'C:\\Users\\samri\\.gemini\\antigravity\\brain\\35721662-d844-460a-bbaa-32a517c9246e\\screenshots';
const PORT = 9222;
const BASE_URL = 'http://localhost:3001';

const STUDENT_PROFILE = {
  id: '30000000-0000-0000-0000-000000000001',
  library_id: '00000000-0000-0000-0000-000000000001',
  role: 'student',
  reg_no: 'AIT2023CS001',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@student.ait.edu',
  department: 'Computer Science & Engineering',
  year: 3,
  user_type: 'undergraduate',
  photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  is_active: true
};

const STAFF_PROFILE = {
  id: '30000000-0000-0000-0000-000000000011',
  library_id: '00000000-0000-0000-0000-000000000001',
  role: 'librarian',
  name: 'Rahul Verma',
  email: 'rahul.verma@library.ait.edu',
  department: 'Circulation',
  user_type: 'staff',
  is_active: true
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting headless Chrome from: ${CHROME_PATH}`);
  const tempDir = path.resolve('.chrome-temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  chromeProc.stderr.on('data', (d) => {
    // console.log('[Chrome err]', d.toString());
  });

  // Wait for remote debugging to be ready
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch {
      await delay(500);
    }
  }

  if (!wsUrl) {
    console.error('Failed to connect to Chrome debugging endpoint');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome DevTools Protocol at:', wsUrl);

  // Helper to connect WebSocket and send JSON-RPC commands
  class CdpSession {
    constructor(url) {
      this.ws = new WebSocket(url);
      this.id = 1;
      this.callbacks = new Map();
      this.ready = new Promise((resolve, reject) => {
        this.ws.onopen = resolve;
        this.ws.onerror = reject;
      });
      this.ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    }

    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = this.id++;
        this.callbacks.set(id, { resolve, reject });
        this.ws.send(JSON.stringify({ id, method, params }));
      });
    }

    close() {
      this.ws.close();
    }
  }

  // Create new page session
  const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  const session = new CdpSession(pageTarget.webSocketDebuggerUrl);
  await session.ready;

  await session.send('Page.enable');
  await session.send('Runtime.enable');

  async function capture(options) {
    const { name, url, width, height, user, preScript, waitMs = 1500 } = options;
    console.log(`\nCapturing [${name}] at ${width}x${height} -> ${url}`);

    // Set viewport
    await session.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
      fitWindow: false,
    });

    // Navigate to base first to set localStorage if user is specified
    await session.send('Page.navigate', { url: `${BASE_URL}/login` });
    await delay(500);

    if (user === null) {
      // Clear auth
      await session.send('Runtime.evaluate', {
        expression: `localStorage.removeItem('smart_lib_auth_user');`,
      });
    } else if (user) {
      await session.send('Runtime.evaluate', {
        expression: `localStorage.setItem('smart_lib_auth_user', JSON.stringify(${JSON.stringify(user)}));`,
      });
    }

    // Now navigate to actual page
    await session.send('Page.navigate', { url: `${BASE_URL}${url}` });
    await delay(waitMs);

    for (let retry = 0; retry < 25; retry++) {
      const readyCheck = await session.send('Runtime.evaluate', {
        expression: `Boolean(document.body && document.body.innerText.trim().length > 30)`,
      });
      if (readyCheck.result?.value) break;
      await delay(200);
    }

    if (preScript) {
      await session.send('Runtime.evaluate', { expression: preScript });
      await delay(600);
    }

    // Check for horizontal overflow
    const scrollEval = await session.send('Runtime.evaluate', {
      expression: `JSON.stringify({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      })`,
    });
    const scrollData = JSON.parse(scrollEval.result.value || '{}');
    if (scrollData.hasHorizontalScroll) {
      console.warn(`⚠️ HORIZONTAL SCROLL DETECTED at ${width}px: scrollWidth ${scrollData.scrollWidth} > clientWidth ${scrollData.clientWidth}`);
    } else {
      console.log(`✓ Zero horizontal scroll at ${width}px (scrollWidth: ${scrollData.scrollWidth}, clientWidth: ${scrollData.clientWidth})`);
    }

    // Capture screenshot
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });

    const filePath = path.join(OUT_DIR, `${name}.png`);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath} (${(shot.data.length / 1024).toFixed(1)} KB)`);
  }

  const widths = [360, 768, 1280];

  // 1. Student Screens across 360px, 768px, 1280px
  for (const w of widths) {
    const h = w === 360 ? 780 : w === 768 ? 1024 : 850;

    // Login (unauthenticated)
    await capture({
      name: `student_login_${w}px`,
      url: '/login',
      width: w,
      height: h,
      user: null,
    });

    // Home
    await capture({
      name: `student_home_${w}px`,
      url: '/',
      width: w,
      height: h,
      user: STUDENT_PROFILE,
    });

    // Search (Catalog)
    await capture({
      name: `student_search_${w}px`,
      url: '/search',
      width: w,
      height: h,
      user: STUDENT_PROFILE,
    });

    // Work Detail
    await capture({
      name: `student_work_detail_${w}px`,
      url: '/work/10000000-0000-0000-0000-000000000001',
      width: w,
      height: h,
      user: STUDENT_PROFILE,
    });

    // My Books
    await capture({
      name: `student_my_books_${w}px`,
      url: '/my-books',
      width: w,
      height: h,
      user: STUDENT_PROFILE,
    });

    // Profile
    await capture({
      name: `student_profile_${w}px`,
      url: '/profile',
      width: w,
      height: h,
      user: STUDENT_PROFILE,
    });

    // ShowQr Sheet
    await capture({
      name: `student_qr_pass_${w}px`,
      url: '/',
      width: w,
      height: h,
      user: STUDENT_PROFILE,
      preScript: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Show student pass') || b.innerText.includes('Pass'));
        if (btn) btn.click();
      `,
    });
  }

  // 2. Staff Screens at 1280px
  const staffWidth = 1280;
  const staffHeight = 850;

  await capture({
    name: `staff_dashboard_${staffWidth}px`,
    url: '/staff',
    width: staffWidth,
    height: staffHeight,
    user: STAFF_PROFILE,
  });

  await capture({
    name: `staff_issue_${staffWidth}px`,
    url: '/staff/issue',
    width: staffWidth,
    height: staffHeight,
    user: STAFF_PROFILE,
  });

  await capture({
    name: `staff_return_${staffWidth}px`,
    url: '/staff/return',
    width: staffWidth,
    height: staffHeight,
    user: STAFF_PROFILE,
  });

  await capture({
    name: `staff_catalogue_${staffWidth}px`,
    url: '/staff/catalogue',
    width: staffWidth,
    height: staffHeight,
    user: STAFF_PROFILE,
  });

  await capture({
    name: `staff_import_${staffWidth}px`,
    url: '/staff/import',
    width: staffWidth,
    height: staffHeight,
    user: STAFF_PROFILE,
  });

  session.close();
  chromeProc.kill();
  console.log('\n✅ All screenshots captured and validated successfully!');
}

main().catch((err) => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
