import {pbkdf2Sync,randomBytes} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
if(!process.stdin.isTTY)throw Error('Use an interactive terminal to set the admin password.');
const rl=createInterface({input:process.stdin,output:process.stdout});
const password=await rl.question('Password (use a unique password; terminal input is visible): ');rl.close();
if(password.length<12)throw Error('Use at least 12 characters.');
const salt=randomBytes(16).toString('hex');const hash=pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
console.log('ADMIN_PASSWORD_HASH=pbkdf2:100000:'+salt+':'+hash);console.log('SESSION_SECRET='+randomBytes(32).toString('hex'));
