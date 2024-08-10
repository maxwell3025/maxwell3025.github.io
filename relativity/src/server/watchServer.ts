import { watch } from 'fs';
// Manual watch implementation since Bun does not have this feature https://github.com/oven-sh/bun/issues/5278
let process = Bun.spawn(['bun', 'src/server/index.ts'], {
    stdio: ['inherit', 'inherit', 'inherit'],
});
watch('./src', () => {
    process.kill();
    process = Bun.spawn(['bun', 'src/server/index.ts'], {
        stdio: ['inherit', 'inherit', 'inherit'],
    });
});