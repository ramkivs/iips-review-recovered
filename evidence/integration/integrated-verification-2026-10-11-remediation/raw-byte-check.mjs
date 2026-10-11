import fs from 'node:fs'; import crypto from 'node:crypto';
const root = process.argv[2];
const files = {
 'utilities-calibration': ['ies-012-utilities/calibration/utilities-calibration-1.0.0.json','e47a548c87d40177124f7abd4259b125eceea3e5','cd60d644c92f999cc6484b31ae3842376ced07c7727fe5dd7b13a67a7f2f0ab8'],
 'consumer-calibration': ['ies-013-consumer/calibration/consumer-calibration-1.0.0.json','dbadf58dda41f8e02799077fd4779638293743db','2c25fa39cb85f4202eafb0f57c08996aa4c6cd0619c7f462f3a8ca118833b0c9'],
 'industrials-calibration': ['ies-014-industrials/calibration/industrials-calibration-1.0.0.json','72914d8d5ecca680e487ebcd1c936675a0deb4fd','abaa02d0c96055febbc69a3175b28d354aed515fe9695acb089fd3f849ee05be'],
 'technology-calibration': ['ies-015-technology/calibration/technology-calibration-1.0.0.json','d1b341ff4897a9a46bb41aaf59372e4a5b3ef86e','9be45e06c953711a7c3202ac8b4fc5d6337dc9c59189f0a2c5f45485d729a06d'],
 'ScreenDefinition': ['iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts','bced46a602788923a5d534bf4486f02e6ccdeefa','0fcd91f7f21b13e6bb29dfdfe0db73e1316636381bff6752b2879c0ff3713c47'],
 'grammar-record': ['NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md','6d823aeecc2a6047782f48dad33d61f26bbe89d8',null],
 'cross-sector-index': ['iips-platform/src/sector-engines/cross-sector/index.ts','0399c9729c409871a0c96babc28225e1b1558e62',null],
 'ScreeningPopulation': ['iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation.ts','0163b1d6b8c78f962816b346d6ccad8bfccf7f19',null],
};
for (const [k,[p,blobExp,shaExp]] of Object.entries(files)) {
  const b = fs.readFileSync(root+'/'+p);
  const cr = b.filter(x=>x===13).length;
  const blob = crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
  const sha = crypto.createHash('sha256').update(b).digest('hex');
  const okBlob = blob===blobExp ? 'BLOB_OK' : 'BLOB_MISMATCH';
  const okSha = shaExp===null ? 'sha=n/a' : (sha===shaExp ? 'SHA256_OK' : 'SHA256_MISMATCH');
  console.log(`${k.padEnd(24)} CR=${String(cr).padStart(4)} ${okBlob} ${okSha}`);
}
