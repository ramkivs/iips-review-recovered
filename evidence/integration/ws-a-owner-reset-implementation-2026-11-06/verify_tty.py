"""Isolated synthetic actual-CLI/PTY verification; no operational environment inherited."""
import json, os, pathlib, pty, select, subprocess, tempfile, time
REPO = pathlib.Path(__file__).resolve().parents[3]
FRONT = REPO / 'frontend'
CODE = r'''
import fs from 'node:fs'; import path from 'node:path';
import { CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT as carrier } from './server/broker-import/brokerImportEvidenceOwnerCarrier.ts';
import { buildBrokerImportEvidence, BrokerImportEvidenceStore } from './server/broker-import/brokerImportEvidenceStore.ts';
import { previewBrokerHoldings } from './src/api/brokerHoldingsPreview.ts';
const data = process.env.IIPS_DATA_DIR; fs.mkdirSync(data, {mode:0o700});
fs.writeFileSync(process.env.IIPS_BROKER_EVIDENCE_OWNER_PATH,carrier,{mode:0o600});
const preview = previewBrokerHoldings('Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nSYNTHETIC,1,10,10,10,10,0,0\n','SYNTHETIC.csv','2026-11-06T01:00:00.000Z');
new BrokerImportEvidenceStore({dataDir:data}).retain(buildBrokerImportEvidence({tenantId:'irr-personal-073dd1c8',ownerUserId:'owner-4dc756b3',portfolioSlot:'P1-BROKER',fileName:'SYNTHETIC.csv',preview}));
fs.chmodSync(path.join(data,'journal.ndjson'),0o600);
'''
ATTEST = 'I AM THE LOCAL OWNER; ALL WRITERS STOPPED; STALE BROWSERS CLOSED; LOCAL DISK NO SYNC'
def tty(args, answers, env):
    master, slave = pty.openpty()
    proc = subprocess.Popen(['node','--import','tsx','server/broker-import/ownerEvidenceResetCli.ts',*args], cwd=FRONT, env=env, stdin=slave, stdout=slave, stderr=slave)
    os.close(slave); os.write(master, ('\n'.join(answers)+'\n').encode())
    output = bytearray(); deadline = time.monotonic()+20
    try:
        while time.monotonic() < deadline:
            ready, _, _ = select.select([master],[],[],.1)
            if ready:
                try: block=os.read(master,65536)
                except OSError: break
                if not block: break
                output.extend(block)
            if proc.poll() is not None and not ready: break
        if proc.poll() is None: proc.kill(); raise AssertionError('TTY process timed out')
        return proc.wait(), output.decode(errors='replace')
    finally: os.close(master)
for cancel in (True, False):
    with tempfile.TemporaryDirectory(prefix='iips-synthetic-tty-') as root:
        env={k:v for k,v in os.environ.items() if not k.startswith('IIPS_')}
        env.update(IIPS_DATA_DIR=root+'/data',IIPS_BROKER_EVIDENCE_OWNER_PATH=root+'/owner.json')
        subprocess.run(['node','--import','tsx','--input-type=module','-e',CODE],cwd=FRONT,env=env,check=True,capture_output=True)
        target=pathlib.Path(root)/'data/journal.ndjson'; original=target.read_bytes()
        rc, output=tty(['plan'],[ATTEST,'NONE_KNOWN'],env); assert rc == 0, output
        plans=list((pathlib.Path(root)/'data/broker-evidence-reset').glob('*.plan.json')); assert len(plans)==1
        p=json.loads(plans[0].read_text()); phrase=f"CLEAR ALL ACTIVE EVIDENCE {p['operationId']} {p['planHash']}"
        rc, output=tty(['execute',p['operationId']],[ATTEST,'NONE_KNOWN',phrase,'CANCEL' if cancel else phrase],env)
        assert 'Recovery copy VERIFIED' in output and 'NOT permanent erasure' in output
        assert pathlib.Path(p['recoveryCopy']).read_bytes()==original
        if cancel: assert rc != 0 and target.read_bytes()==original
        else: assert rc == 0 and not target.exists()
        rc, status=tty(['status',p['operationId']],[ATTEST,'NONE_KNOWN'],env); assert rc==0, status
        assert ('INCOMPLETE_ACTIVE_UNCHANGED' if cancel else 'COMPLETED_ACTIVE_CLEARED_COPY_RETAINED') in status
        print('PASS actual owner TTY: plan / execute / independent CLI status; final ' + ('CANCEL preserves active + copy' if cancel else 'CONFIRM clears active; copy retained'))
print('PASS: synthetic fixtures only, automatically disposed; no operational reset')
