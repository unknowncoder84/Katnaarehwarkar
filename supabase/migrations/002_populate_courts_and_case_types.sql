-- =====================================================
-- POPULATE COURTS AND CASE TYPES
-- Run this in Supabase SQL Editor to add default data
-- =====================================================

-- =====================================================
-- 1. INSERT COURTS
-- =====================================================
-- Clear existing courts (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE public.courts CASCADE;

-- Insert comprehensive list of Indian courts
INSERT INTO public.courts (name) VALUES 
  -- Supreme Court
  ('Supreme Court of India'),
  
  -- High Courts (Major ones)
  ('High Court of Bombay'),
  ('High Court of Delhi'),
  ('High Court of Calcutta'),
  ('High Court of Madras'),
  ('High Court of Karnataka'),
  ('High Court of Gujarat'),
  ('High Court of Rajasthan'),
  ('High Court of Madhya Pradesh'),
  ('High Court of Allahabad'),
  ('High Court of Kerala'),
  ('High Court of Punjab and Haryana'),
  ('High Court of Andhra Pradesh'),
  ('High Court of Telangana'),
  ('High Court of Orissa'),
  ('High Court of Patna'),
  ('High Court of Jharkhand'),
  ('High Court of Uttarakhand'),
  ('High Court of Chhattisgarh'),
  ('High Court of Himachal Pradesh'),
  ('High Court of Jammu and Kashmir'),
  ('High Court of Gauhati'),
  ('High Court of Sikkim'),
  ('High Court of Tripura'),
  ('High Court of Meghalaya'),
  ('High Court of Manipur'),
  
  -- District Courts
  ('District Court - Mumbai'),
  ('District Court - Delhi'),
  ('District Court - Bangalore'),
  ('District Court - Pune'),
  ('District Court - Hyderabad'),
  ('District Court - Chennai'),
  ('District Court - Kolkata'),
  ('District Court - Ahmedabad'),
  ('District Court - Jaipur'),
  ('District Court - Lucknow'),
  ('District Court - Kanpur'),
  ('District Court - Nagpur'),
  ('District Court - Indore'),
  ('District Court - Thane'),
  ('District Court - Bhopal'),
  ('District Court - Visakhapatnam'),
  ('District Court - Pimpri-Chinchwad'),
  ('District Court - Patna'),
  ('District Court - Vadodara'),
  ('District Court - Ghaziabad'),
  ('District Court - Ludhiana'),
  ('District Court - Agra'),
  ('District Court - Nashik'),
  ('District Court - Faridabad'),
  ('District Court - Meerut'),
  ('District Court - Rajkot'),
  ('District Court - Kalyan-Dombivali'),
  ('District Court - Vasai-Virar'),
  ('District Court - Varanasi'),
  ('District Court - Srinagar'),
  
  -- Specialized Courts
  ('Sessions Court'),
  ('Civil Court'),
  ('Family Court'),
  ('Consumer Court'),
  ('Labour Court'),
  ('Industrial Tribunal'),
  ('Debt Recovery Tribunal (DRT)'),
  ('Income Tax Appellate Tribunal (ITAT)'),
  ('National Company Law Tribunal (NCLT)'),
  ('National Company Law Appellate Tribunal (NCLAT)'),
  ('Central Administrative Tribunal (CAT)'),
  ('Armed Forces Tribunal'),
  ('Railway Claims Tribunal'),
  ('Intellectual Property Appellate Board (IPAB)'),
  ('Competition Appellate Tribunal'),
  ('Securities Appellate Tribunal (SAT)'),
  ('Telecom Disputes Settlement Appellate Tribunal (TDSAT)'),
  ('Customs, Excise and Service Tax Appellate Tribunal (CESTAT)'),
  ('National Green Tribunal (NGT)'),
  ('Cyber Appellate Tribunal'),
  
  -- Magistrate Courts
  ('Chief Metropolitan Magistrate Court'),
  ('Metropolitan Magistrate Court'),
  ('Judicial Magistrate First Class (JMFC)'),
  ('Chief Judicial Magistrate Court'),
  
  -- Other Courts
  ('Small Causes Court'),
  ('Motor Accident Claims Tribunal'),
  ('Rent Control Court'),
  ('Juvenile Justice Board'),
  ('Special Court for Economic Offences'),
  ('Special Court for CBI Cases'),
  ('Special Court for NDPS Cases'),
  ('Special Court for SC/ST Cases'),
  ('Fast Track Court'),
  ('Commercial Court'),
  ('Arbitration Tribunal'),
  ('Lok Adalat')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. INSERT CASE TYPES
-- =====================================================
-- Clear existing case types (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE public.case_types CASCADE;

-- Insert comprehensive list of case types
INSERT INTO public.case_types (name) VALUES 
  -- Civil Cases
  ('Civil Suit'),
  ('Civil Appeal'),
  ('Civil Revision'),
  ('Civil Writ Petition'),
  ('Civil Miscellaneous'),
  ('Money Recovery Suit'),
  ('Property Dispute'),
  ('Partition Suit'),
  ('Specific Performance'),
  ('Declaration Suit'),
  ('Injunction'),
  ('Permanent Injunction'),
  ('Temporary Injunction'),
  ('Damages Suit'),
  ('Breach of Contract'),
  ('Tort'),
  ('Defamation'),
  ('Nuisance'),
  ('Trespass'),
  
  -- Criminal Cases
  ('Criminal Case'),
  ('Criminal Appeal'),
  ('Criminal Revision'),
  ('Criminal Writ Petition'),
  ('Criminal Miscellaneous'),
  ('FIR'),
  ('Anticipatory Bail'),
  ('Regular Bail'),
  ('Quashing Petition'),
  ('Discharge Application'),
  ('Complaint Case'),
  ('Sessions Trial'),
  ('Magistrate Trial'),
  ('Summary Trial'),
  ('Warrant Case'),
  ('Summons Case'),
  ('Murder Case'),
  ('Rape Case'),
  ('Theft Case'),
  ('Robbery Case'),
  ('Cheating Case'),
  ('Fraud Case'),
  ('Forgery Case'),
  ('Criminal Breach of Trust'),
  ('Dowry Death'),
  ('Domestic Violence'),
  ('NDPS Case'),
  ('POCSO Case'),
  ('Cyber Crime'),
  ('Economic Offence'),
  ('White Collar Crime'),
  
  -- Family Law
  ('Divorce Petition'),
  ('Mutual Consent Divorce'),
  ('Contested Divorce'),
  ('Judicial Separation'),
  ('Restitution of Conjugal Rights'),
  ('Nullity of Marriage'),
  ('Child Custody'),
  ('Guardianship'),
  ('Maintenance'),
  ('Alimony'),
  ('Domestic Violence'),
  ('Adoption'),
  ('Succession'),
  ('Will Contest'),
  ('Probate'),
  ('Letters of Administration'),
  
  -- Corporate/Commercial
  ('Corporate Dispute'),
  ('Company Petition'),
  ('Winding Up Petition'),
  ('Insolvency Petition'),
  ('Arbitration'),
  ('Commercial Dispute'),
  ('Partnership Dispute'),
  ('Shareholder Dispute'),
  ('Director Dispute'),
  ('Oppression and Mismanagement'),
  ('Merger and Acquisition'),
  ('Securities Law'),
  ('Banking Law'),
  ('Insurance Dispute'),
  ('Negotiable Instruments Act'),
  ('Cheque Bounce Case'),
  ('Recovery Suit'),
  ('Debt Recovery'),
  ('SARFAESI'),
  
  -- Constitutional Law
  ('Writ Petition'),
  ('Public Interest Litigation (PIL)'),
  ('Habeas Corpus'),
  ('Mandamus'),
  ('Prohibition'),
  ('Certiorari'),
  ('Quo Warranto'),
  ('Fundamental Rights'),
  ('Constitutional Challenge'),
  
  -- Labour & Employment
  ('Labour Dispute'),
  ('Industrial Dispute'),
  ('Service Matter'),
  ('Wrongful Termination'),
  ('Unfair Labour Practice'),
  ('Wage Dispute'),
  ('Bonus Dispute'),
  ('Provident Fund'),
  ('Gratuity'),
  ('Workmen Compensation'),
  ('Sexual Harassment'),
  ('Employment Contract'),
  
  -- Real Estate
  ('Real Estate Dispute'),
  ('RERA Complaint'),
  ('Builder Dispute'),
  ('Possession Suit'),
  ('Title Dispute'),
  ('Easement'),
  ('Mortgage'),
  ('Lease Dispute'),
  ('Rent Control'),
  ('Eviction'),
  ('Tenancy Dispute'),
  
  -- Tax Law
  ('Income Tax Appeal'),
  ('GST Dispute'),
  ('Service Tax'),
  ('Customs Duty'),
  ('Excise Duty'),
  ('Sales Tax'),
  ('VAT'),
  ('Property Tax'),
  ('Tax Evasion'),
  ('Tax Assessment'),
  
  -- Intellectual Property
  ('Patent Dispute'),
  ('Trademark Dispute'),
  ('Copyright Dispute'),
  ('Design Dispute'),
  ('Trade Secret'),
  ('Passing Off'),
  ('Infringement'),
  ('Licensing Dispute'),
  
  -- Consumer Protection
  ('Consumer Complaint'),
  ('Defective Product'),
  ('Deficiency in Service'),
  ('Unfair Trade Practice'),
  ('Product Liability'),
  ('Medical Negligence'),
  ('Insurance Claim'),
  
  -- Immigration
  ('Visa Application'),
  ('Deportation'),
  ('Citizenship'),
  ('Refugee Status'),
  ('Asylum'),
  ('Immigration Appeal'),
  
  -- Environmental Law
  ('Environmental Dispute'),
  ('Pollution Case'),
  ('Forest Rights'),
  ('Wildlife Protection'),
  ('Coastal Regulation'),
  ('Environmental Clearance'),
  
  -- Administrative Law
  ('Service Law'),
  ('Pension Dispute'),
  ('Promotion Dispute'),
  ('Transfer Dispute'),
  ('Disciplinary Proceedings'),
  ('Government Contract'),
  ('Tender Dispute'),
  ('RTI Appeal'),
  
  -- Other Specialized
  ('Election Petition'),
  ('Contempt of Court'),
  ('Perjury'),
  ('Extradition'),
  ('Mutual Legal Assistance'),
  ('Preventive Detention'),
  ('Sedition'),
  ('Terrorism'),
  ('Money Laundering'),
  ('Corruption'),
  ('Bribery'),
  ('Human Rights'),
  ('Media Law'),
  ('Defamation'),
  ('Privacy'),
  ('Data Protection'),
  ('Cyber Law'),
  ('E-Commerce Dispute'),
  ('Cryptocurrency'),
  ('Sports Law'),
  ('Entertainment Law'),
  ('Medical Law'),
  ('Education Law'),
  ('Charity Law'),
  ('Trust Dispute'),
  ('Society Dispute'),
  ('Co-operative Society'),
  ('Religious Dispute'),
  ('Caste Dispute'),
  ('Land Acquisition'),
  ('Eminent Domain'),
  ('Mining Dispute'),
  ('Shipping Law'),
  ('Aviation Law'),
  ('Railway Law'),
  ('Telecommunication'),
  ('Energy Law'),
  ('Infrastructure'),
  ('Construction Dispute'),
  ('Architect Dispute'),
  ('Professional Negligence'),
  ('Legal Malpractice'),
  ('Audit Dispute'),
  ('Valuation Dispute'),
  ('Expert Witness'),
  ('Forensic'),
  ('DNA Test'),
  ('Paternity Suit'),
  ('Surrogacy'),
  ('IVF Dispute'),
  ('Organ Donation'),
  ('Euthanasia'),
  ('Abortion'),
  ('Transgender Rights'),
  ('LGBTQ Rights'),
  ('Disability Rights'),
  ('Senior Citizen Rights'),
  ('Child Rights'),
  ('Women Rights'),
  ('Minority Rights'),
  ('Tribal Rights'),
  ('Dalit Rights'),
  ('Refugee Rights'),
  ('Prisoner Rights'),
  ('Animal Rights'),
  ('Heritage Protection'),
  ('Archaeological Dispute'),
  ('Cultural Property'),
  ('Art Law'),
  ('Antiquities'),
  ('Museum Dispute')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. VERIFY DATA
-- =====================================================
-- Check how many courts were inserted
SELECT COUNT(*) as total_courts FROM public.courts;

-- Check how many case types were inserted
SELECT COUNT(*) as total_case_types FROM public.case_types;

-- View all courts
SELECT * FROM public.courts ORDER BY name;

-- View all case types
SELECT * FROM public.case_types ORDER BY name;

-- =====================================================
-- DONE!
-- =====================================================
-- You now have:
-- ✅ 90+ Courts (Supreme Court, High Courts, District Courts, Specialized Courts)
-- ✅ 200+ Case Types (Civil, Criminal, Family, Corporate, Tax, IP, Consumer, etc.)
--
-- These will populate the dropdowns in:
-- - Case Details Page
-- - Create Case Form
-- - Edit Case Form
-- - Settings Page
-- =====================================================
