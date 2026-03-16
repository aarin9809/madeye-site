// ── Scanner definitions ────────────────────────────────────────────────────
// Each scanner describes its CLI command, form fields, and UI metadata.

export type FieldType = 'text' | 'url' | 'textarea' | 'select' | 'switch' | 'number';

export interface FormField {
  key: string;          // CLI param key (used to build command)
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  cliFlag?: string;     // e.g. '--level'. If undefined, key is used as positional arg
  width?: 'full' | 'half';
}

export interface ScannerDef {
  id: string;
  label: string;
  description: string;
  icon: string;         // lucide icon name
  color: string;        // tailwind color class
  glowColor: string;
  targetLabel: string;
  targetPlaceholder: string;
  fields: FormField[];
  hasOutput: boolean;   // whether CLI supports --output flag
}

const LEVEL_OPTIONS = [
  { value: '1', label: 'T1 — Stealth' },
  { value: '2', label: 'T2 — Polite' },
  { value: '3', label: 'T3 — Normal' },
  { value: '4', label: 'T4 — Aggressive' },
  { value: '5', label: 'T5 — Kamikaze' },
];

const COMMON_FIELDS: FormField[] = [
  {
    key: 'cookie',
    label: 'Cookie',
    type: 'text',
    cliFlag: '--cookie',
    placeholder: 'session=abc123; token=xyz',
    hint: 'HTTP Cookie 헤더 값',
    width: 'half',
  },
  {
    key: 'proxy',
    label: 'Proxy',
    type: 'text',
    cliFlag: '--proxy',
    placeholder: 'http://127.0.0.1:8080',
    hint: 'Burp Suite 등 프록시 URL',
    width: 'half',
  },
  {
    key: 'level',
    label: 'Speed',
    type: 'select',
    cliFlag: '--level',
    defaultValue: '3',
    options: LEVEL_OPTIONS,
    width: 'half',
  },
];

export const SCANNERS: ScannerDef[] = [
  {
    id: 'recon',
    label: 'Recon',
    description: 'HTTP 크롤링 · 링크/폼/스크립트 탐색 · 인젝션 대상 추출',
    icon: 'Search',
    color: 'text-cyber-cyan',
    glowColor: 'glow-cyan',
    targetLabel: '대상 URL',
    targetPlaceholder: 'https://target.com',
    hasOutput: false,
    fields: [
      {
        key: 'level',
        label: 'Speed',
        type: 'select',
        cliFlag: '--level',
        defaultValue: '3',
        options: LEVEL_OPTIONS,
        width: 'half',
      },
    ],
  },
  {
    id: 'finger',
    label: 'Finger',
    description: 'HTTP 핑거프린팅 — 서버 · 언어 · CMS · CDN · 프레임워크 탐지',
    icon: 'Fingerprint',
    color: 'text-cyber-blue',
    glowColor: 'glow-cyan',
    targetLabel: '대상 URL',
    targetPlaceholder: 'https://target.com',
    hasOutput: true,
    fields: COMMON_FIELDS,
  },
  {
    id: 'probe',
    label: 'Probe',
    description: '민감 정보 노출 탐지 — 설정 파일 · 오픈 서비스 · TCP 포트',
    icon: 'Radar',
    color: 'text-cyber-yellow',
    glowColor: 'glow-cyan',
    targetLabel: '대상 URL',
    targetPlaceholder: 'https://target.com',
    hasOutput: true,
    fields: [
      ...COMMON_FIELDS,
      {
        key: 'checks',
        label: 'Checks',
        type: 'select',
        cliFlag: '--checks',
        defaultValue: 'all',
        options: [
          { value: 'all', label: 'All (HTTP + TCP)' },
          { value: 'http', label: 'HTTP only' },
          { value: 'tcp', label: 'TCP only' },
        ],
        width: 'half',
      },
    ],
  },
  {
    id: 'lfi',
    label: 'LFI',
    description: 'Local File Inclusion — 경로 탐색 · PHP 래퍼 취약점 탐지',
    icon: 'FolderOpen',
    color: 'text-cyber-orange',
    glowColor: 'glow-red',
    targetLabel: '대상 URL (파라미터 포함)',
    targetPlaceholder: 'https://target.com/page.php?file=home',
    hasOutput: true,
    fields: [
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        cliFlag: '--method',
        defaultValue: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ],
        width: 'half',
      },
      {
        key: 'data',
        label: 'POST Data',
        type: 'text',
        cliFlag: '--data',
        placeholder: 'param1=val1&param2=val2',
        width: 'half',
      },
      ...COMMON_FIELDS,
      {
        key: 'timeout',
        label: 'Timeout (s)',
        type: 'number',
        cliFlag: '--timeout',
        defaultValue: 10,
        width: 'half',
      },
    ],
  },
  {
    id: 'rfi',
    label: 'RFI',
    description: 'Remote File Inclusion — 원격 URL 삽입 · SSRF 취약점 탐지',
    icon: 'Globe',
    color: 'text-cyber-orange',
    glowColor: 'glow-red',
    targetLabel: '대상 URL (파라미터 포함)',
    targetPlaceholder: 'https://target.com/page.php?file=home',
    hasOutput: true,
    fields: [
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        cliFlag: '--method',
        defaultValue: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ],
        width: 'half',
      },
      {
        key: 'data',
        label: 'POST Data',
        type: 'text',
        cliFlag: '--data',
        placeholder: 'param1=val1&param2=val2',
        width: 'half',
      },
      ...COMMON_FIELDS,
      {
        key: 'timeout',
        label: 'Timeout (s)',
        type: 'number',
        cliFlag: '--timeout',
        defaultValue: 10,
        width: 'half',
      },
    ],
  },
  {
    id: 'sqli',
    label: 'SQLi',
    description: 'SQL Injection 스캐너 — URL 직접 지정 또는 Burp Raw HTTP',
    icon: 'Database',
    color: 'text-cyber-red',
    glowColor: 'glow-red',
    targetLabel: '대상 URL (생략 가능 — Raw 사용 시)',
    targetPlaceholder: 'https://target.com/search?q=1',
    hasOutput: true,
    fields: [
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        cliFlag: '--method',
        defaultValue: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ],
        width: 'half',
      },
      {
        key: 'data',
        label: 'POST Data',
        type: 'text',
        cliFlag: '--data',
        placeholder: 'id=1&name=test',
        width: 'half',
      },
      {
        key: 'param',
        label: 'Target Param',
        type: 'text',
        cliFlag: '--param',
        placeholder: 'id',
        hint: '스캔할 파라미터 (생략 시 전체)',
        width: 'half',
      },
      {
        key: 'rawHttp',
        label: 'Raw HTTP (Burp)',
        type: 'textarea',
        cliFlag: '--raw-inline',  // handled specially
        placeholder: 'POST /login HTTP/1.1\nHost: target.com\n\nid=1&pw=test',
        hint: 'Burp Repeater 복사 붙여넣기',
        width: 'full',
      },
      ...COMMON_FIELDS,
      {
        key: 'timeout',
        label: 'Timeout (s)',
        type: 'number',
        cliFlag: '--timeout',
        defaultValue: 15,
        width: 'half',
      },
      {
        key: 'poc',
        label: 'Generate PoC',
        type: 'switch',
        cliFlag: '--poc',
        defaultValue: false,
        hint: '취약점 발견 시 PoC 자동 생성',
        width: 'half',
      },
    ],
  },
  {
    id: 'cve',
    label: 'CVE',
    description: 'CVE 스캐너 — 핑거프린트 기반 매칭 + GitHub PoC 연동',
    icon: 'ShieldAlert',
    color: 'text-cyber-red',
    glowColor: 'glow-red',
    targetLabel: '대상 URL',
    targetPlaceholder: 'https://target.com',
    hasOutput: true,
    fields: [
      {
        key: 'severity',
        label: 'Severity',
        type: 'select',
        cliFlag: '--severity',
        defaultValue: 'critical,high',
        options: [
          { value: 'critical,high', label: 'Critical + High' },
          { value: 'critical', label: 'Critical only' },
          { value: 'critical,high,medium', label: 'Critical + High + Medium' },
          { value: 'critical,high,medium,low', label: 'All' },
        ],
        width: 'half',
      },
      {
        key: 'type_',
        label: 'Vuln Type',
        type: 'text',
        cliFlag: '--type',
        placeholder: 'rce,sqli,xss',
        hint: '쉼표 구분: rce,sqli,xss,lfi,ssrf,upload,auth-bypass',
        width: 'half',
      },
      {
        key: 'cve_id',
        label: 'Specific CVE',
        type: 'text',
        cliFlag: '--cve',
        placeholder: 'CVE-2021-22986',
        width: 'half',
      },
      {
        key: 'keyword',
        label: 'Keyword',
        type: 'text',
        cliFlag: '--keyword',
        placeholder: 'wordpress',
        width: 'half',
      },
      {
        key: 'github',
        label: 'GitHub PoC',
        type: 'switch',
        cliFlag: '--github',
        defaultValue: false,
        hint: 'GitHub PoC 링크 보강',
        width: 'half',
      },
      {
        key: 'github_token',
        label: 'GitHub Token',
        type: 'text',
        cliFlag: '--github-token',
        placeholder: 'ghp_xxxx',
        hint: 'API rate-limit 완화',
        width: 'half',
      },
      ...COMMON_FIELDS.slice(0, 2), // cookie, proxy
      {
        key: 'level',
        label: 'Speed',
        type: 'select',
        cliFlag: '--level',
        defaultValue: '3',
        options: LEVEL_OPTIONS,
        width: 'half',
      },
    ],
  },
  {
    id: 'auto',
    label: 'Auto',
    description: '자동 오케스트레이션 — 크롤링 후 SQLi/XSS/LFI/RFI/CVE 통합 스캔',
    icon: 'Zap',
    color: 'text-cyber-magenta',
    glowColor: 'glow-magenta',
    targetLabel: '대상 URL',
    targetPlaceholder: 'https://target.com',
    hasOutput: false,
    fields: [
      {
        key: 'checks',
        label: 'Checks',
        type: 'text',
        cliFlag: '--checks',
        defaultValue: 'sqli,xss',
        placeholder: 'sqli,xss,lfi,rfi,cve,finger,probe',
        hint: '실행할 검사 (쉼표 구분)',
        width: 'full',
      },
      ...COMMON_FIELDS,
    ],
  },
  {
    id: 'vscan',
    label: 'VScan',
    description: 'vscan 엔진 — 포트 스캔 · 서비스 탐지 · 취약점 매칭',
    icon: 'ScanLine',
    color: 'text-cyber-green',
    glowColor: 'glow-green',
    targetLabel: '대상 (IP / CIDR / URL)',
    targetPlaceholder: '192.168.1.0/24 또는 target.com',
    hasOutput: true,
    fields: [
      {
        key: 'proxy',
        label: 'Proxy',
        type: 'text',
        cliFlag: '--proxy',
        placeholder: 'http://127.0.0.1:8080',
        width: 'half',
      },
    ],
  },
];

export const SCANNER_MAP = Object.fromEntries(SCANNERS.map((s) => [s.id, s]));
