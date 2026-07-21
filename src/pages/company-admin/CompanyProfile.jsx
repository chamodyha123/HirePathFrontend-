import { useEffect, useState } from "react";
import companyAdminService from "../../api/companyAdminService";
const empty={name:"",industry:"",email:"",phone:"",address:"",description:"",website:"",location:"",logoUrl:""};
export default function CompanyProfile(){
 const [form,setForm]=useState(empty),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{(async()=>{try{const d=await companyAdminService.getCompanyProfile();setForm({...empty,...d})}catch(e){setError(e.response?.data?.message||"Unable to load company profile.")}finally{setLoading(false)}})()},[]);
 const submit=async e=>{e.preventDefault();setSaving(true);setError("");setMessage("");try{const r=await companyAdminService.updateCompanyProfile(form);setMessage(r.message||"Company profile updated.");if(r.company)setForm({...empty,...r.company})}catch(e){setError(e.response?.data?.message||e.response?.data||"Unable to update company profile.")}finally{setSaving(false)}};
 if(loading)return <div className="company-admin-page"><p>Loading company profile...</p></div>;
 return <div className="company-admin-page"><header className="company-admin-header"><div><h1>Company Profile & Settings</h1><p>Update the information shown to candidates and employees.</p></div></header>{error&&<div className="company-admin-message error">{String(error)}</div>}{message&&<div className="company-admin-message success">{message}</div>}
 <form onSubmit={submit} className="company-admin-table-wrap" style={{padding:28,display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}}>
 {[["name","Company name",true],["industry","Industry"],["email","Company email"],["phone","Phone"],["website","Website"],["location","Location"],["logoUrl","Logo URL"],["address","Address"]].map(([k,l,r])=><label key={k} style={{display:"grid",gap:7}}><b>{l}</b><input required={!!r} type={k==="email"?"email":"text"} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})} style={{padding:12,border:"1px solid #cbd5e1",borderRadius:8}}/></label>)}
 <label style={{display:"grid",gap:7,gridColumn:"1/-1"}}><b>Description</b><textarea rows="5" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} style={{padding:12,border:"1px solid #cbd5e1",borderRadius:8}}/></label>
 <div style={{gridColumn:"1/-1"}}><button disabled={saving} className="company-admin-primary">{saving?"Saving...":"Save Company Settings"}</button></div></form></div>;
}
