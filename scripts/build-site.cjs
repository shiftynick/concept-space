const {mkdirSync,copyFileSync,cpSync,existsSync}=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
mkdirSync(out,{recursive:true});
copyFileSync(path.join(root,'index.html'),path.join(out,'index.html'));
for(const folder of ['src','vendor','experiments'])cpSync(path.join(root,folder),path.join(out,folder),{recursive:true});
console.log('Static site packaged in dist/');
