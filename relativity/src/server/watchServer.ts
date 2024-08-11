import fs from 'fs';
import path from 'path';
// Manual watch implementation since Bun does not have this feature https://github.com/oven-sh/bun/issues/5278
const rootURI = path.resolve(__dirname, '..', '..');

let process = Bun.spawn(['bun', path.join(rootURI, 'src/server/index.ts')], {
    stdio: ['inherit', 'inherit', 'inherit'],
});

fs.watch(path.join(rootURI, 'src'), { recursive: true }, async () => {
    console.log('\nChanges detected. Restarting.');
    process.kill();
    await process.exited;
    process = Bun.spawn(['bun', path.join(rootURI, 'src/server/index.ts')], {
        stdio: ['inherit', 'inherit', 'inherit'],
    });
});