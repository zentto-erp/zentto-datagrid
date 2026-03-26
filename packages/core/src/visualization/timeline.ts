export interface TimelineEntry { status: string; date: string; label?: string; }

const DC: Record<string,string> = {pending:'#9aa0a6',active:'#2d7dd2',completed:'#0d9668',done:'#0d9668',cancelled:'#d63031',error:'#d63031',warning:'#e67e22','in-progress':'#e67e22',review:'#8b5cf6',approved:'#0d9668',rejected:'#d63031'};

function sc(s: string, c?: Record<string,string>): string {
  const k=s.toLowerCase().replace(/\s+/g,'_');
  return c?.[k]??c?.[s]??DC[k]??'#9aa0a6';
}
function ex(s: string): string { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

export function generateTimelineSvg(entries: TimelineEntry[], width=120, colors?: Record<string,string>): string {
  if (!entries||entries.length===0) return '';
  const h=20, dr=4, p=dr+2, uw=width-p*2;
  if (entries.length===1) {
    const c=sc(entries[0].status,colors), t=entries[0].label||`${entries[0].status} — ${entries[0].date}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}" viewBox="0 0 ${width} ${h}"><title>${ex(t)}</title><circle cx="${width/2}" cy="${h/2}" r="${dr}" fill="${c}"/></svg>`;
  }
  const st=uw/(entries.length-1);
  let el=`<line x1="${p}" y1="${h/2}" x2="${p+uw}" y2="${h/2}" stroke="#ddd" stroke-width="1.5"/>`;
  for (let i=0;i<entries.length;i++) {
    const x=p+i*st, c=sc(entries[i].status,colors), t=entries[i].label||`${entries[i].status} — ${entries[i].date}`;
    if (i>0) { const px=p+(i-1)*st, pc=sc(entries[i-1].status,colors); el+=`<line x1="${px}" y1="${h/2}" x2="${x}" y2="${h/2}" stroke="${pc}" stroke-width="1.5"/>`; }
    el+=`<circle cx="${x}" cy="${h/2}" r="${dr}" fill="${c}"><title>${ex(t)}</title></circle>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}" viewBox="0 0 ${width} ${h}">${el}</svg>`;
}
