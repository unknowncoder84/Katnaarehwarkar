import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import RichTextEditor from '../components/RichTextEditor';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const CreateCounselCasePage: React.FC = () => {
  const { theme } = useTheme();
  const { addCase, counsel } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    counsellor: '',
    partiesName: '',
    district: '',
    caseType: '',
    court: '',
    onBehalfOf: '',
    noResp: '',
    officeFileNo: '',
    stampNo: '',
    registrationNo: '',
    fees: '',
    opponentLawyer: '',
    additionalDetails: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCase = {
      id: Date.now().toString(),
      clientName: formData.counsellor,
      clientEmail: '',
      clientMobile: '',
      fileNo: formData.officeFileNo,
      stampNo: formData.stampNo,
      regNo: formData.registrationNo,
      partiesName: formData.partiesName,
      district: formData.district,
      caseType: formData.caseType,
      court: formData.court,
      onBehalfOf: formData.onBehalfOf,
      noResp: formData.noResp,
      opponentLawyer: formData.opponentLawyer,
      additionalDetails: formData.additionalDetails,
      feesQuoted: parseFloat(formData.fees) || 0,
      status: 'pending' as const,
      nextDate: new Date(),
      filingDate: new Date(),
      circulationStatus: 'non-circulated' as const,
      interimRelief: 'none' as const,
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addCase(newCase);
    navigate('/counsel/cases');
  };

  const bgClass = theme === 'light' ? 'bg-white text-black' : 'glass-dark text-cyber-blue';
  const borderClass = theme === 'light' ? 'border-gray-300' : 'border-cyber-blue/20';

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgClass} p-6 rounded-lg mb-6 border ${borderClass}`}
      >
        <h1 className={`text-2xl font-bold font-cyber ${theme === 'light' ? 'text-gray-900' : 'holographic-text'}`}>Create New Case</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${bgClass} p-8 rounded-xl border ${borderClass}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Counsellor and Name of Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormSelect
                label="SELECT COUNSELLOR"
                name="counsellor"
                value={formData.counsellor}
                onChange={(e) => setFormData({ ...formData, counsellor: e.target.value })}
                options={[
                  { value: '', label: 'Select Counsellor' },
                  ...counsel.map(c => ({ value: c.name, label: c.name }))
                ]}
                required
              />
              <a href="/counsel/create" className="text-cyan-400 text-sm hover:underline mt-1 inline-block">
                (CREATE COUNSELLOR)
              </a>
            </div>
            <FormInput
              label="NAME OF PARTIES"
              name="partiesName"
              type="text"
              placeholder="Name of Parties"
              value={formData.partiesName}
              onChange={(e) => setFormData({ ...formData, partiesName: e.target.value })}
              required
            />
          </div>

          {/* District, Case Type, Court */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormSelect
              label="DISTRICT"
              name="district"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              options={[
                { value: '', label: 'Select District' },
                { value: 'Mumbai', label: 'Mumbai' },
                { value: 'Pune', label: 'Pune' },
                { value: 'Nagpur', label: 'Nagpur' },
              ]}
              required
            />
            <FormSelect
              label="CASE TYPE"
              name="caseType"
              value={formData.caseType}
              onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
              options={[
                { value: '', label: 'Select case type' },
                { value: 'Civil', label: 'Civil' },
                { value: 'Criminal', label: 'Criminal' },
                { value: 'Family', label: 'Family' },
              ]}
              required
            />
            <FormSelect
              label="COURT"
              name="court"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              options={[
                { value: '', label: 'Select court' },
                { value: 'High Court', label: 'High Court' },
                { value: 'District Court', label: 'District Court' },
              ]}
              required
            />
          </div>

          {/* On Behalf Of and No Resp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="ON BEHALF OF"
              name="onBehalfOf"
              value={formData.onBehalfOf}
              onChange={(e) => setFormData({ ...formData, onBehalfOf: e.target.value })}
              options={[
                { value: '', label: 'Select' },
                { value: 'Plaintiff', label: 'Plaintiff' },
                { value: 'Defendant', label: 'Defendant' },
              ]}
              required
            />
            <FormInput
              label="NO RESP"
              name="noResp"
              type="text"
              placeholder="Select"
              value={formData.noResp}
              onChange={(e) => setFormData({ ...formData, noResp: e.target.value })}
            />
          </div>

          {/* Office File No, Stamp No, Registration No, Fees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="OFFICE FILE NO"
              name="officeFileNo"
              type="text"
              placeholder="Office file number"
              value={formData.officeFileNo}
              onChange={(e) => setFormData({ ...formData, officeFileNo: e.target.value })}
              required
            />
            <FormInput
              label="STAMP NO"
              name="stampNo"
              type="text"
              placeholder="Stamp number"
              value={formData.stampNo}
              onChange={(e) => setFormData({ ...formData, stampNo: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="REGISTRATION NO"
              name="registrationNo"
              type="text"
              placeholder="Registration number"
              value={formData.registrationNo}
              onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
              required
            />
            <FormInput
              label="FEES"
              name="fees"
              type="text"
              placeholder="Fees quoted to client"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
            />
          </div>

          {/* Opponent Lawyer */}
          <div>
            <FormInput
              label="OPPONENT LAWYER"
              name="opponentLawyer"
              type="text"
              placeholder="Opponent Lawyer"
              value={formData.opponentLawyer}
              onChange={(e) => setFormData({ ...formData, opponentLawyer: e.target.value })}
            />
          </div>

          {/* Additional Details */}
          <div>
            <RichTextEditor
              label="ADDITIONAL DETAILS"
              value={formData.additionalDetails}
              onChange={(value) => setFormData({ ...formData, additionalDetails: value })}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/counsel/cases')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-cyber text-white px-8 py-3 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all duration-300 border border-cyber-blue/30"
            >
              CREATE CASE
            </button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default CreateCounselCasePage;
