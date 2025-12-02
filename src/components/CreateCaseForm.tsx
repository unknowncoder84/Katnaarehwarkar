import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import RichTextEditor from './RichTextEditor';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Case } from '../types';

interface CreateCaseFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const CreateCaseForm: React.FC<CreateCaseFormProps> = ({ onClose, onSuccess }) => {
  const { addCase, caseTypes, courts } = useData();
  const { theme } = useTheme();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const sectionHeaderClass = theme === 'light' 
    ? 'text-lg font-bold mb-4 text-purple-700' 
    : 'text-lg font-bold font-cyber mb-4 text-cyber-blue text-glow';
    
  const cancelButtonClass = theme === 'light'
    ? 'flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 border border-gray-300'
    : 'flex-1 bg-cyber-blue/10 text-cyber-blue font-semibold font-cyber py-3 rounded-lg hover:bg-cyber-blue/20 transition-all duration-300 border border-cyber-blue/30';

  const [formData, setFormData] = useState({
    // Client Info
    clientName: '',
    clientEmail: '',
    clientMobile: '',
    clientAlternateNo: '',
    // Case Info
    partiesName: '',
    district: '',
    caseType: '',
    court: '',
    onBehalfOf: '',
    noResp: '',
    // Legal Details
    fileNo: '',
    stampNo: '',
    regNo: '',
    feesQuoted: '',
    // Opposition
    opponentLawyer: '',
    // Extras
    additionalDetails: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail) newErrors.clientEmail = 'Email is required';
    if (!formData.clientMobile) newErrors.clientMobile = 'Mobile is required';
    if (!formData.partiesName) newErrors.partiesName = 'Parties name is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.caseType) newErrors.caseType = 'Case type is required';
    if (!formData.court) newErrors.court = 'Court is required';
    if (!formData.fileNo) newErrors.fileNo = 'File number is required';
    if (!formData.stampNo) newErrors.stampNo = 'Stamp number is required';
    if (!formData.regNo) newErrors.regNo = 'Registration number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTextAreaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, additionalDetails: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'> = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientMobile: formData.clientMobile,
        clientAlternateNo: formData.clientAlternateNo,
        partiesName: formData.partiesName,
        district: formData.district,
        caseType: formData.caseType,
        court: formData.court,
        onBehalfOf: formData.onBehalfOf,
        noResp: formData.noResp,
        fileNo: formData.fileNo,
        stampNo: formData.stampNo,
        regNo: formData.regNo,
        feesQuoted: parseInt(formData.feesQuoted) || 0,
        opponentLawyer: formData.opponentLawyer,
        additionalDetails: formData.additionalDetails,
        status: 'pending',
        nextDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        filingDate: new Date(),
        circulationStatus: 'non-circulated',
        interimRelief: 'none',
        createdBy: 'current-user',
      };

      addCase(newCase);

      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        clientMobile: '',
        clientAlternateNo: '',
        partiesName: '',
        district: '',
        caseType: '',
        court: '',
        onBehalfOf: '',
        noResp: '',
        fileNo: '',
        stampNo: '',
        regNo: '',
        feesQuoted: '',
        opponentLawyer: '',
        additionalDetails: '',
      });

      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const caseTypeOptions = caseTypes.map((ct) => ({ value: ct.id, label: ct.name }));
  const courtOptions = courts.map((c) => ({ value: c.id, label: c.name }));

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Client Info Section */}
      <div>
        <h3 className={sectionHeaderClass}>Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Client Name"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            error={errors.clientName}
            required
          />
          <FormInput
            label="Email"
            name="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={handleInputChange}
            error={errors.clientEmail}
            required
          />
          <FormInput
            label="Mobile"
            name="clientMobile"
            value={formData.clientMobile}
            onChange={handleInputChange}
            error={errors.clientMobile}
            required
          />
          <FormInput
            label="Alternate No"
            name="clientAlternateNo"
            value={formData.clientAlternateNo}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Case Info Section */}
      <div>
        <h3 className={sectionHeaderClass}>Case Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Parties Name"
            name="partiesName"
            value={formData.partiesName}
            onChange={handleInputChange}
            error={errors.partiesName}
            required
          />
          <FormInput
            label="District"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            error={errors.district}
            required
          />
          <FormSelect
            label="Case Type"
            name="caseType"
            options={caseTypeOptions}
            value={formData.caseType}
            onChange={handleInputChange}
            error={errors.caseType}
            required
          />
          <FormSelect
            label="Court"
            name="court"
            options={courtOptions}
            value={formData.court}
            onChange={handleInputChange}
            error={errors.court}
            required
          />
          <FormInput
            label="On Behalf Of"
            name="onBehalfOf"
            value={formData.onBehalfOf}
            onChange={handleInputChange}
          />
          <FormInput
            label="No Resp"
            name="noResp"
            value={formData.noResp}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Legal Details Section */}
      <div>
        <h3 className={sectionHeaderClass}>Legal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Office File No"
            name="fileNo"
            value={formData.fileNo}
            onChange={handleInputChange}
            error={errors.fileNo}
            required
          />
          <FormInput
            label="Stamp No"
            name="stampNo"
            value={formData.stampNo}
            onChange={handleInputChange}
            error={errors.stampNo}
            required
          />
          <FormInput
            label="Registration No"
            name="regNo"
            value={formData.regNo}
            onChange={handleInputChange}
            error={errors.regNo}
            required
          />
          <FormInput
            label="Fees Quoted"
            name="feesQuoted"
            type="number"
            value={formData.feesQuoted}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Opposition Section */}
      <div>
        <h3 className={sectionHeaderClass}>Opposition</h3>
        <FormInput
          label="Opponent Lawyer"
          name="opponentLawyer"
          value={formData.opponentLawyer}
          onChange={handleInputChange}
        />
      </div>

      {/* Additional Details Section */}
      <div>
        <h3 className={sectionHeaderClass}>Additional Details</h3>
        <RichTextEditor
          label="Additional Details"
          value={formData.additionalDetails}
          onChange={handleTextAreaChange}
          placeholder="Enter additional case details..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-cyber text-white font-semibold font-cyber py-3 rounded-lg hover:shadow-cyber transition-all duration-300 disabled:opacity-50 border border-cyber-blue/30"
        >
          {loading ? 'Creating Case...' : 'Create Case'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cancelButtonClass}
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
};

export default CreateCaseForm;
