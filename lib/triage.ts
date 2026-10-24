export function triage(c:any) {
 const symptoms=Array.isArray(c.symptoms)?c.symptoms:[];
 const emergency=symptoms.some((s:string)=>['Chest pain','Severe breathing difficulty','Unconsciousness'].includes(s));
 const priority=emergency?'Emergency':symptoms.some((s:string)=>['Fever','Pregnancy concern'].includes(s))?'Priority':'Routine';
 const specialty=symptoms.includes('Skin concern')?'Dermatology':symptoms.includes('Pregnancy concern')?'Maternal care':'General medicine';
 return {priority,specialty,reason:emergency?'Selected emergency warning sign. Seek emergency care now; do not wait for an online consultation.':priority==='Priority'?'Flagged for earlier clinician review by the demo routing rules.':'Routed for clinician review based on the symptoms selected.'};
}
export const modes=['Store & forward','Chat','Audio','Low-res video','Video'];
export function modeFor(k:number){return k<=0?0:k<30?1:k<150?2:k<400?3:4;}
