import React,{useEffect,useMemo,useState} from 'react';
import api from '../../api/axios';
import applicationApi from '../../api/applicationApi';
import './JobSearch.css'; import './Profile.css';
const arr=d=>Array.isArray(d)?d:(d?.$values||[]);
export default function JobSearch(){
 const [jobs,setJobs]=useState([]),[q,setQ]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(null);
 const load=async()=>{setLoading(true);setError('');try{const {data}=await api.get('/Jobs/active');setJobs(arr(data))}catch(e){setError(e.response?.data?.detail || e.response?.data?.message || e.response?.data?.title || 'Unable to load jobs.')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const shown=useMemo(()=>jobs.filter(j=>`${j.title} ${j.description} ${j.company?.name||j.companyName||''} ${j.location}`.toLowerCase().includes(q.toLowerCase())),[jobs,q]);
 const apply=async job=>{const coverLetter=window.prompt('Optional cover letter:','');if(coverLetter===null)return;setBusy(job.id);try{await applicationApi.apply(job.id,coverLetter||null,null);alert('Application submitted successfully. Track it from Application Tracker.')}catch(e){alert(e.response?.data?.message||e.response?.data||'Unable to apply. Upload a primary CV first if required.')}finally{setBusy(null)}};
 return <div><h2>🔍 Search & Apply Jobs</h2><div className="search-container"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by job title, company, location or keyword..." className="form-input" style={{maxWidth:500}}/><button className="btn-primary" onClick={load}>Refresh</button></div>{error&&<p style={{color:'#b91c1c'}}>{error}</p>}{loading?<p>Loading live jobs...</p>:<div className="job-grid">{shown.map(job=><div key={job.id} className="job-card"><div><h3 className="job-title">{job.title}</h3><div className="job-company">🏢 {job.company?.name||job.companyName||'Company'} | 📍 {job.location||'Not specified'}</div><p>{job.description}</p><small>{job.employmentType||''} {job.workMode||''}</small></div><button disabled={busy===job.id} onClick={()=>apply(job)} className="btn-primary" style={{width:'100%',marginTop:10}}>{busy===job.id?'Applying...':'Apply Now'}</button></div>)}{!shown.length&&<p>No active jobs match your search.</p>}</div>}</div>;
}
