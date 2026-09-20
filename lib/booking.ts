export const TESTS = [
  { id: 'ldv-brake', name: 'LDV Brake Test', category: 'LDV', weight: '3.5 tonnes or less', location: 'Vandlovu', time: '07:00 start', hour: 7, minute: 0, kind: 'Brake test', detail: 'Light-duty vehicles' },
  { id: 'ldv-lux', name: 'LDV Lux Test', category: 'LDV', weight: '3.5 tonnes or less', location: 'Vandlovu', time: '07:00 start', hour: 7, minute: 0, kind: 'Lux test', detail: 'Light-duty vehicles' },
  { id: 'hmv-brake', name: 'HMV Brake Test', category: 'HMV', weight: 'Above 3.5 tonnes', location: 'PGN Road on-site', time: '09:00–10:00', hour: 9, minute: 0, kind: 'Brake test', detail: 'Heavy motor vehicles' },
  { id: 'hmv-lux', name: 'HMV Lux Test', category: 'HMV', weight: 'Above 3.5 tonnes', location: 'Vandlovu night testing', time: 'From 18:30', hour: 18, minute: 30, kind: 'Lux test', detail: 'Heavy motor vehicles' },
] as const;
export type TestId = typeof TESTS[number]['id'];
export type Schedule = 'unconfigured' | 'mwf' | 'alternating';
export const CAPACITY = 5;
export function saToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', {timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function dateKey(d:Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function localDate(s:string) { return new Date(s+'T12:00:00'); }
export function validDate(s:string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s; }
export function prettyDate(s:string) { return new Intl.DateTimeFormat('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Johannesburg'}).format(new Date(s+'T12:00:00Z')); }
export function scheduled(date:string, mode:Schedule, anchor:string) {
  if(!validDate(date))return false;
  const d=new Date(date+'T12:00:00Z'), wd=d.getUTCDay();
  if(wd===0||wd===6||mode==='unconfigured')return false;
  if(mode==='mwf')return [1,3,5].includes(wd);
  if(!validDate(anchor)||date<anchor)return false;
  let count=0;
  for(let x=new Date(anchor+'T12:00:00Z');x<d;x.setUTCDate(x.getUTCDate()+1)) if(x.getUTCDay()!==0&&x.getUTCDay()!==6)count++;
  return count%2===0;
}
export function sessionFuture(date:string,test:typeof TESTS[number],now=Date.now()) { return new Date(`${date}T${String(test.hour).padStart(2,'0')}:${String(test.minute).padStart(2,'0')}:00+02:00`).getTime()>now; }
export type Availability = {date:string;state:'available'|'full'|'unavailable';remaining:number};
