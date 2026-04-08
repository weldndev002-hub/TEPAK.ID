import React from 'react';
import { cn } from '../../lib/utils';

export const AcademyHero: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="max-w-2xl">
        <nav className="flex gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academy</span>
          <span className="text-[10px] text-slate-300">/</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Tutorials</span>
        </nav>
        
        <h2 className="text-5xl font-extrabold text-[#005ab4] tracking-tighter leading-none mb-4">
          Tutorial & Panduan Kreator
        </h2>
        
        <p className="text-slate-600 text-lg max-w-xl leading-relaxed">
          Kuasai setiap fitur <span className="text-blue-600 font-semibold">tepak.id</span> dengan panduan visual mendalam dari para ahli strategi digital.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex -space-x-3 px-2">
          <img 
            alt="user" 
            className="w-8 h-8 rounded-full border-2 border-white" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1QcgXPiDM5CcKxsPmOv_-qJf75m2b6JuA0-xCGel99l3v_9nAI_LjJmAIkv98dZhjydIYKP4G72ekJScpPaLbBrE3XNDBQAtSpmZtOjSN776Wnm92iWftqmOrrc-dniA9m3FOfC2MkPq1U3LxGdVW8GvBD5VU3u0sxyc9craWUrKWjg9PmmBqTD-pK5yfTzerfnhCSc9fqT0eKe-TbROUrhuxyKSPXy7cD6mXZ4mzvKWKS1vOm2GHvM2qn9QhfxFR4dR4OVq1oKai" 
          />
          <img 
            alt="user" 
            className="w-8 h-8 rounded-full border-2 border-white" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJb4l4TLVoI3UMplQYeKdlPbR_jVXAQw2ErcGsf2Ss1HOgXNNQnnf_8_7_IRDNwXiHthUQ2Sx2M44iDpAvATpgG2Ud2dd9V_fWWp0sKpMfbH1bz8G3ICEBKYX9kdaptZmj1FpLVyvdY_4EqyfSN_vF3YuW7HeZ3e4mXN1bsgUENtoKom6Myk0Oac6cC_U0-TcDgg8Sw7P4K30_3OnBHPD0A8wELbCs6HIPYaEb40r_dPhBI3vtg7tEkj_6c6A8q7vtK22ppg3xO9N5" 
          />
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">+12k</div>
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pr-4">Active Learners</p>
      </div>
    </div>
  );
};

export default AcademyHero;
